import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// タスクの型定義
export interface Task {
  id: string;
  title: string;
  description?: string;
  category: '個人' | '事業';
  business_type?: '不動産' | '人材' | '経済圏' | '結婚相談所' | 'コーポレート' | 'その他';
  priority?: '今すぐやる' | '今週やる' | '今月やる' | '高' | '中' | '低';
  ai_priority_score?: number;
  ai_suggestion?: string;
  status: '未着手' | '進行中' | '完了';
  due_date?: string;
  created_at: string;
  updated_at: string;
  completed_at?: string;
}

// サブタスクの型定義
export interface Subtask {
  id: string;
  task_id: string;
  title: string;
  completed: boolean;
  created_at: string;
  completed_at?: string;
}

// 通知の型定義
export interface Notification {
  id: string;
  task_id: string;
  type: 'reminder_1day' | 'reminder_1hour' | 'task_completed' | 'task_overdue';
  title: string;
  body: string;
  sent_at?: string;
  read_at?: string;
  created_at: string;
}

// プッシュ購読の型定義
export interface PushSubscription {
  id: string;
  endpoint: string;
  p256dh: string;
  auth: string;
  created_at: string;
  updated_at: string;
}
