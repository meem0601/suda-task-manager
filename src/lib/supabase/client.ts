/**
 * Supabase クライアント設定
 * 作成日: 2026-03-06
 * 更新: 型定義を src/lib/types.ts に移行
 */

import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Supabase環境変数が設定されていません');
}

/**
 * Supabaseクライアント（型安全）
 */
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

/**
 * Supabaseクライアント（型なし - 既存コード互換性用）
 */
export const supabaseUntyped = createClient(supabaseUrl, supabaseAnonKey);

// 後方互換性のため、デフォルトエクスポート
export default supabase;
