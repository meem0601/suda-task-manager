/**
 * MEEM Task Manager - 型定義ファイル
 * 作成日: 2026-03-06
 * 目的: 全てのデータ型を一元管理
 */

// ========================================
// Union型（基本的な列挙型）
// ========================================

/** タスクのステータス */
export type TaskStatus = '未着手' | '進行中' | 'レビュー中' | '完了';

/** タスクの優先度 */
export type TaskPriority = 
  // 新しい優先度システム
  | '緊急' 
  | '高' 
  | '中' 
  | '低'
  // 旧優先度（後方互換性のため）
  | '今すぐやる' 
  | '今週やる' 
  | '今月やる';

/** タスクのカテゴリ（個人/事業） */
export type TaskCategory = '個人' | '事業';

/** 事業タイプ（既存のbusiness_type） */
export type BusinessType = '不動産' | '人材' | '経済圏' | '結婚相談所' | 'コーポレート' | 'その他';

/** アクティビティログのアクション */
export type ActivityAction = 'created' | 'updated' | 'completed' | 'deleted' | 'status_changed' | 'priority_changed';

// ========================================
// データベーステーブル型
// ========================================

/** ユーザー */
export interface User {
  id: string;
  email: string;
  display_name?: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

/** カテゴリ */
export interface Category {
  id: string;
  name: string;
  color: string;
  icon?: string;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

/** タグ */
export interface Tag {
  id: string;
  name: string;
  color: string;
  created_at: string;
}

/** タスク */
export interface Task {
  id: string;
  title: string;
  description?: string;
  note?: string; // 補足説明（テーブルで直接編集可能）
  
  // カテゴリ関連
  category: TaskCategory;
  business_type?: BusinessType; // 後方互換性のため残す
  category_id?: string; // 新しいカテゴリシステム
  
  // 優先度・スコア
  priority?: TaskPriority;
  ai_priority_score?: number; // 1-100
  ai_suggestion?: string;
  
  // ステータス・日付
  status: TaskStatus;
  start_date?: string; // DATE型
  due_date?: string; // DATE型
  
  // 階層・順序
  parent_task_id?: string; // 親タスクへの参照
  sort_order: number;
  
  // アーカイブ
  is_archived: boolean;
  
  // タイムスタンプ
  created_at: string;
  updated_at: string;
  completed_at?: string;
}

/** サブタスク */
export interface Subtask {
  id: string;
  task_id: string;
  title: string;
  completed: boolean;
  created_at: string;
  completed_at?: string;
}

/** コメント */
export interface Comment {
  id: string;
  task_id: string;
  content: string;
  created_at: string;
  updated_at: string;
}

/** タスク-タグ中間テーブル */
export interface TaskTag {
  task_id: string;
  tag_id: string;
  created_at: string;
}

/** アクティビティログ */
export interface ActivityLog {
  id: string;
  task_id?: string;
  user_id?: string;
  action: ActivityAction;
  field_name?: string;
  old_value?: string;
  new_value?: string;
  created_at: string;
}

/** 保存されたフィルター */
export interface SavedFilter {
  id: string;
  user_id: string;
  name: string;
  filter_config: FilterConfig;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

/** 繰り返しタスク */
export interface RecurringTask {
  id: string;
  task_id: string;
  recurrence_rule: string; // RRULE形式
  next_occurrence?: string; // DATE型
  created_at: string;
  updated_at: string;
}

/** 通知 */
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

/** プッシュ購読 */
export interface PushSubscription {
  id: string;
  endpoint: string;
  p256dh: string;
  auth: string;
  created_at: string;
  updated_at: string;
}

// ========================================
// フィルター設定
// ========================================

/** フィルター設定 */
export interface FilterConfig {
  status?: TaskStatus[];
  priority?: TaskPriority[];
  category?: TaskCategory[];
  category_ids?: string[];
  tag_ids?: string[];
  search?: string;
  due_date_from?: string;
  due_date_to?: string;
  is_archived?: boolean;
  has_subtasks?: boolean;
  sort_by?: 'created_at' | 'updated_at' | 'due_date' | 'priority' | 'sort_order';
  sort_order?: 'asc' | 'desc';
}

// ========================================
// ダッシュボード統計
// ========================================

/** ダッシュボード統計 */
export interface DashboardStats {
  total_tasks: number;
  completed_tasks: number;
  in_progress_tasks: number;
  overdue_tasks: number;
  today_tasks: number;
  this_week_tasks: number;
  completion_rate: number; // 0-100
  average_completion_days?: number;
}

/** カテゴリ別統計 */
export interface CategoryStats {
  category_id: string;
  category_name: string;
  total_tasks: number;
  completed_tasks: number;
  completion_rate: number;
}

/** 優先度別統計 */
export interface PriorityStats {
  priority: TaskPriority;
  total_tasks: number;
  completed_tasks: number;
}

// ========================================
// タスク拡張型（関連データ含む）
// ========================================

/** タスク（サブタスク含む） */
export interface TaskWithSubtasks extends Task {
  subtasks: Subtask[];
  subtask_completed_count?: number;
  subtask_total_count?: number;
}

/** タスク（タグ含む） */
export interface TaskWithTags extends Task {
  tags: Tag[];
}

/** タスク（カテゴリ含む） */
export interface TaskWithCategory extends Task {
  category_data?: Category;
}

/** タスク（すべての関連データ含む） */
export interface TaskWithRelations extends TaskWithSubtasks, TaskWithTags, TaskWithCategory {
  activity_logs?: ActivityLog[];
}

// ========================================
// API関連型
// ========================================

/** タスク作成リクエスト */
export interface CreateTaskRequest {
  title: string;
  description?: string;
  category: TaskCategory;
  category_id?: string;
  business_type?: BusinessType;
  priority?: TaskPriority;
  status?: TaskStatus;
  start_date?: string;
  due_date?: string;
  parent_task_id?: string;
  tag_ids?: string[];
}

/** タスク更新リクエスト */
export interface UpdateTaskRequest {
  title?: string;
  description?: string;
  category?: TaskCategory;
  category_id?: string;
  business_type?: BusinessType;
  priority?: TaskPriority;
  status?: TaskStatus;
  start_date?: string;
  due_date?: string;
  parent_task_id?: string;
  sort_order?: number;
  is_archived?: boolean;
}

/** サブタスク作成リクエスト */
export interface CreateSubtaskRequest {
  task_id: string;
  title: string;
}

/** サブタスク更新リクエスト */
export interface UpdateSubtaskRequest {
  title?: string;
  completed?: boolean;
}

/** AI提案リクエスト */
export interface AISuggestionRequest {
  message: string;
  user_id?: string;
}

/** AI提案レスポンス */
export interface AISuggestionResponse {
  task?: CreateTaskRequest;
  priority_score?: number;
  suggestion?: string;
}

// ========================================
// UI関連型
// ========================================

/** ビューモード */
export type ViewMode = 'list' | 'board' | 'calendar' | 'dashboard';

/** ソート設定 */
export interface SortConfig {
  field: 'created_at' | 'updated_at' | 'due_date' | 'priority' | 'sort_order' | 'title';
  order: 'asc' | 'desc';
}

/** ページネーション設定 */
export interface PaginationConfig {
  page: number;
  limit: number;
  total: number;
}

/** モーダル状態 */
export interface ModalState {
  isOpen: boolean;
  mode: 'create' | 'edit' | 'view';
  task?: Task;
}

// ========================================
// ユーティリティ型
// ========================================

/** APIレスポンス（成功） */
export interface ApiSuccessResponse<T = any> {
  success: true;
  data: T;
  message?: string;
}

/** APIレスポンス（エラー） */
export interface ApiErrorResponse {
  success: false;
  error: string;
  message?: string;
}

/** APIレスポンス（統合） */
export type ApiResponse<T = any> = ApiSuccessResponse<T> | ApiErrorResponse;

/** 部分的に必須 */
export type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

/** 必須フィールドのみ */
export type RequiredFields<T, K extends keyof T> = Required<Pick<T, K>> & Omit<T, K>;
