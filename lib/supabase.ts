/**
 * 既存コード互換性のためのラッパー
 * 新しいコードでは src/lib/supabase を使用してください
 * 
 * @deprecated 新しいコードでは src/lib/supabase/client を使用してください
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// 型定義は src/lib/types.ts に移行しました
// ここでは後方互換性のために再エクスポート

export type { 
  Task,
  Subtask,
  Comment,
  Notification,
  PushSubscription,
  TaskStatus,
  TaskPriority,
  TaskCategory,
  BusinessType,
} from '../src/lib/types';
