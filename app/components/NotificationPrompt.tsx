'use client';

import { useState, useEffect } from 'react';
import {
  requestNotificationPermission,
  registerServiceWorker,
  subscribeToPushNotifications,
  checkTaskReminders
} from '@/lib/notifications';

export default function NotificationPrompt() {
  const [showPrompt, setShowPrompt] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>('default');

  useEffect(() => {
    // 通知の許可状態をチェック
    if ('Notification' in window) {
      setPermission(Notification.permission);
      
      // まだ許可を求めていない場合、プロンプトを表示
      if (Notification.permission === 'default') {
        // 初回訪問後3秒後に表示（UX配慮）
        const timer = setTimeout(() => {
          const hasSeenPrompt = localStorage.getItem('notification-prompt-seen');
          if (!hasSeenPrompt) {
            setShowPrompt(true);
          }
        }, 3000);
        return () => clearTimeout(timer);
      }

      // 許可済みの場合、Service Workerを登録
      if (Notification.permission === 'granted') {
        initializeNotifications();
      }
    }
  }, []);

  const initializeNotifications = async () => {
    // Service Worker登録
    await registerServiceWorker();
    
    // プッシュ通知購読
    await subscribeToPushNotifications();
    
    // リマインダーチェックを定期実行（10分ごと）
    const interval = setInterval(() => {
      checkTaskReminders();
    }, 10 * 60 * 1000);
    
    // 初回実行
    checkTaskReminders();
    
    return () => clearInterval(interval);
  };

  const handleEnableNotifications = async () => {
    const granted = await requestNotificationPermission();
    
    if (granted) {
      setPermission('granted');
      setShowPrompt(false);
      localStorage.setItem('notification-prompt-seen', 'true');
      
      // 初期化
      await initializeNotifications();
      
      // 成功メッセージ
      alert('🎉 通知が有効になりました！\n\nタスクの期限が近づくとお知らせします。');
    } else {
      setPermission('denied');
      setShowPrompt(false);
      localStorage.setItem('notification-prompt-seen', 'true');
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem('notification-prompt-seen', 'true');
    
    // 1日後に再度表示
    setTimeout(() => {
      localStorage.removeItem('notification-prompt-seen');
    }, 24 * 60 * 60 * 1000);
  };

  if (!showPrompt) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl">
        <div className="text-center mb-4">
          <div className="text-5xl mb-3">🔔</div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            通知を有効にしますか？
          </h2>
          <p className="text-sm text-gray-600">
            タスクの期限が近づいたときにお知らせします
          </p>
        </div>

        <div className="bg-blue-50 rounded-lg p-4 mb-4">
          <ul className="text-sm text-blue-900 space-y-2">
            <li className="flex items-start gap-2">
              <span>📅</span>
              <span><strong>1日前</strong>のリマインダー</span>
            </li>
            <li className="flex items-start gap-2">
              <span>⏰</span>
              <span><strong>1時間前</strong>のリマインダー</span>
            </li>
            <li className="flex items-start gap-2">
              <span>⚠️</span>
              <span><strong>期限切れ</strong>の通知</span>
            </li>
            <li className="flex items-start gap-2">
              <span>✅</span>
              <span><strong>完了</strong>の確認通知</span>
            </li>
          </ul>
        </div>

        <div className="flex flex-col gap-3">
          <button
            onClick={handleEnableNotifications}
            className="w-full px-6 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 active:bg-indigo-800 transition-colors"
          >
            通知を有効にする
          </button>
          <button
            onClick={handleDismiss}
            className="w-full px-6 py-3 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 active:bg-gray-300 transition-colors"
          >
            後で
          </button>
        </div>

        <p className="text-xs text-gray-500 text-center mt-4">
          ※ブラウザの設定でいつでも変更できます
        </p>
      </div>
    </div>
  );
}
