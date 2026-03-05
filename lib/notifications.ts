import { supabase } from './supabase';

export interface NotificationData {
  task_id: string;
  type: 'reminder_1day' | 'reminder_1hour' | 'task_completed' | 'task_overdue';
  title: string;
  body: string;
}

/**
 * 通知の許可をリクエスト
 */
export async function requestNotificationPermission(): Promise<boolean> {
  if (!('Notification' in window)) {
    console.warn('このブラウザは通知をサポートしていません');
    return false;
  }

  if (Notification.permission === 'granted') {
    return true;
  }

  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }

  return false;
}

/**
 * Service Workerを登録
 */
export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (!('serviceWorker' in navigator)) {
    console.warn('このブラウザはService Workerをサポートしていません');
    return null;
  }

  try {
    const registration = await navigator.serviceWorker.register('/sw.js', {
      scope: '/'
    });
    console.log('Service Worker registered:', registration);
    return registration;
  } catch (error) {
    console.error('Service Worker registration failed:', error);
    return null;
  }
}

/**
 * プッシュ通知を購読
 */
export async function subscribeToPushNotifications(): Promise<boolean> {
  try {
    const registration = await navigator.serviceWorker.ready;
    
    // VAPID公開鍵（後で環境変数に移動）
    const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || '';
    
    if (!vapidPublicKey) {
      console.warn('VAPID公開鍵が設定されていません');
      // VAPID鍵なしでも基本的な通知は動作する
    }

    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: vapidPublicKey || undefined
    });

    // サブスクリプション情報をSupabaseに保存
    const { error } = await supabase
      .from('push_subscriptions')
      .upsert({
        endpoint: subscription.endpoint,
        p256dh: arrayBufferToBase64(subscription.getKey('p256dh')!),
        auth: arrayBufferToBase64(subscription.getKey('auth')!)
      }, {
        onConflict: 'endpoint'
      });

    if (error) {
      console.error('プッシュ購読の保存に失敗:', error);
      return false;
    }

    console.log('プッシュ通知を購読しました');
    return true;
  } catch (error) {
    console.error('プッシュ通知の購読に失敗:', error);
    return false;
  }
}

/**
 * ローカル通知を表示（プッシュ通知のフォールバック）
 */
export async function showLocalNotification(data: NotificationData): Promise<void> {
  if (Notification.permission !== 'granted') {
    console.warn('通知の許可がありません');
    return;
  }

  const registration = await navigator.serviceWorker.ready;
  
  await registration.showNotification(data.title, {
    body: data.body,
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    tag: `task-${data.task_id}`,
    data: {
      taskId: data.task_id,
      type: data.type,
      url: '/'
    },
    requireInteraction: data.type.includes('reminder')
    // Note: actions removed due to TypeScript type definition limitations
    // actions: [
    //   {
    //     action: 'view',
    //     title: '確認する'
    //   },
    //   {
    //     action: 'close',
    //     title: '閉じる'
    //   }
    // ]
  });

  // Supabaseに通知記録を保存
  await supabase.from('notifications').insert({
    task_id: data.task_id,
    type: data.type,
    title: data.title,
    body: data.body,
    sent_at: new Date().toISOString()
  });
}

/**
 * 通知の既読状態を更新
 */
export async function markNotificationAsRead(notificationId: string): Promise<void> {
  await supabase
    .from('notifications')
    .update({ read_at: new Date().toISOString() })
    .eq('id', notificationId);
}

/**
 * 未読通知を取得
 */
export async function getUnreadNotifications(): Promise<any[]> {
  const { data, error } = await supabase
    .from('notifications')
    .select('*, tasks(*)')
    .is('read_at', null)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('未読通知の取得に失敗:', error);
    return [];
  }

  return data || [];
}

/**
 * ArrayBufferをBase64に変換
 */
function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

/**
 * タスクのリマインダーをチェック（クライアント側で定期実行）
 */
export async function checkTaskReminders(): Promise<void> {
  const { data: tasks, error } = await supabase
    .from('tasks')
    .select('*')
    .neq('status', '完了')
    .not('due_date', 'is', null);

  if (error || !tasks) {
    console.error('タスクの取得に失敗:', error);
    return;
  }

  const now = new Date();
  
  for (const task of tasks) {
    const dueDate = new Date(task.due_date);
    const timeDiff = dueDate.getTime() - now.getTime();
    const hoursDiff = timeDiff / (1000 * 60 * 60);

    // 既に送信済みの通知をチェック
    const { data: existingNotifications } = await supabase
      .from('notifications')
      .select('type')
      .eq('task_id', task.id)
      .not('sent_at', 'is', null);

    const sentTypes = new Set(existingNotifications?.map(n => n.type) || []);

    // 1日前のリマインダー（23〜25時間前）
    if (hoursDiff > 23 && hoursDiff <= 25 && !sentTypes.has('reminder_1day')) {
      await showLocalNotification({
        task_id: task.id,
        type: 'reminder_1day',
        title: '📅 タスク期限リマインダー（1日前）',
        body: `明日が期限: ${task.title}`
      });
    }

    // 1時間前のリマインダー（0.5〜1.5時間前）
    if (hoursDiff > 0.5 && hoursDiff <= 1.5 && !sentTypes.has('reminder_1hour')) {
      await showLocalNotification({
        task_id: task.id,
        type: 'reminder_1hour',
        title: '⏰ タスク期限リマインダー（1時間前）',
        body: `まもなく期限: ${task.title}`
      });
    }

    // 期限切れ通知
    if (timeDiff < 0 && !sentTypes.has('task_overdue')) {
      await showLocalNotification({
        task_id: task.id,
        type: 'task_overdue',
        title: '⚠️ タスク期限切れ',
        body: `期限を過ぎています: ${task.title}`
      });
    }
  }
}
