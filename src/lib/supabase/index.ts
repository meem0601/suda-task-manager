/**
 * Supabase モジュールのエクスポート
 * 作成日: 2026-03-06
 * 目的: 既存コードとの互換性を保ちつつ、新しい型定義を提供
 */

// クライアント
export { supabase, supabaseUntyped } from './client';
export { default } from './client';

// 型定義
export type { Database } from './database.types';

// 既存の型定義（後方互換性のため）
// これらは src/lib/types.ts から再エクスポート
import type { 
  Task, 
  Subtask, 
  Notification, 
  PushSubscription 
} from '../types';

export type { 
  Task, 
  Subtask, 
  Notification, 
  PushSubscription 
};
