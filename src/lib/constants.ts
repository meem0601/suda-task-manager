/**
 * MEEM Task Manager - 定数定義ファイル
 * 作成日: 2026-03-06
 * 目的: アプリケーション全体で使用する定数を一元管理
 */

import type { TaskStatus, TaskPriority } from './types';

// ========================================
// ステータス設定
// ========================================

export const STATUS_CONFIG: Record<TaskStatus, {
  label: string;
  value: TaskStatus;
  color: string;
  bgColor: string;
  textColor: string;
  icon: string;
}> = {
  '未着手': {
    label: '未着手',
    value: '未着手',
    color: '#a3a3a3',
    bgColor: '#f5f5f5',
    textColor: '#525252',
    icon: '⭕',
  },
  '進行中': {
    label: '進行中',
    value: '進行中',
    color: '#3b82f6',
    bgColor: '#eff6ff',
    textColor: '#1d4ed8',
    icon: '🔵',
  },
  'レビュー中': {
    label: 'レビュー中',
    value: 'レビュー中',
    color: '#f59e0b',
    bgColor: '#fffbeb',
    textColor: '#d97706',
    icon: '👀',
  },
  '完了': {
    label: '完了',
    value: '完了',
    color: '#22c55e',
    bgColor: '#f0fdf4',
    textColor: '#15803d',
    icon: '✅',
  },
};

export const STATUS_LIST: TaskStatus[] = ['未着手', '進行中', 'レビュー中', '完了'];

// ========================================
// 優先度設定
// ========================================

export const PRIORITY_CONFIG: Record<TaskPriority, {
  label: string;
  value: TaskPriority;
  color: string;
  bgColor: string;
  textColor: string;
  icon: string;
  sortOrder: number;
}> = {
  // 新しい優先度システム
  '緊急': {
    label: '緊急',
    value: '緊急',
    color: '#ef4444',
    bgColor: '#fef2f2',
    textColor: '#dc2626',
    icon: '🔴',
    sortOrder: 1,
  },
  '高': {
    label: '高',
    value: '高',
    color: '#f59e0b',
    bgColor: '#fffbeb',
    textColor: '#d97706',
    icon: '🟠',
    sortOrder: 2,
  },
  '中': {
    label: '中',
    value: '中',
    color: '#3b82f6',
    bgColor: '#eff6ff',
    textColor: '#1d4ed8',
    icon: '🟡',
    sortOrder: 3,
  },
  '低': {
    label: '低',
    value: '低',
    color: '#a3a3a3',
    bgColor: '#f5f5f5',
    textColor: '#525252',
    icon: '⚪',
    sortOrder: 4,
  },
  
  // 旧優先度（後方互換性のため）
  '今すぐやる': {
    label: '今すぐやる',
    value: '今すぐやる',
    color: '#ef4444',
    bgColor: '#fef2f2',
    textColor: '#dc2626',
    icon: '⚡',
    sortOrder: 1,
  },
  '今週やる': {
    label: '今週やる',
    value: '今週やる',
    color: '#f59e0b',
    bgColor: '#fffbeb',
    textColor: '#d97706',
    icon: '📅',
    sortOrder: 2,
  },
  '今月やる': {
    label: '今月やる',
    value: '今月やる',
    color: '#3b82f6',
    bgColor: '#eff6ff',
    textColor: '#1d4ed8',
    icon: '📆',
    sortOrder: 3,
  },
};

export const PRIORITY_LIST: TaskPriority[] = ['緊急', '高', '中', '低'];
export const PRIORITY_LIST_LEGACY: TaskPriority[] = ['今すぐやる', '今週やる', '今月やる'];

// ========================================
// カテゴリカラー設定（Monday.com風）
// ========================================

export const CATEGORY_COLORS: Record<string, {
  primary: string;
  bg: string;
  text: string;
  border: string;
}> = {
  '不動産': {
    primary: '#00c875',
    bg: '#e5f9f0',
    text: '#00854a',
    border: '#00c875',
  },
  '人材': {
    primary: '#0073ea',
    bg: '#e5f2ff',
    text: '#0055af',
    border: '#0073ea',
  },
  '経済圏': {
    primary: '#9cd326',
    bg: '#f4fce3',
    text: '#6e9a1a',
    border: '#9cd326',
  },
  '結婚相談所': {
    primary: '#ff3d57',
    bg: '#ffe5e9',
    text: '#cc0020',
    border: '#ff3d57',
  },
  'コーポレート': {
    primary: '#fdab3d',
    bg: '#fff4e5',
    text: '#c97d0a',
    border: '#fdab3d',
  },
  'その他': {
    primary: '#a3a3a3',
    bg: '#f5f5f5',
    text: '#525252',
    border: '#a3a3a3',
  },
  'デフォルト': {
    primary: '#3b82f6',
    bg: '#eff6ff',
    text: '#1d4ed8',
    border: '#3b82f6',
  },
};

// ========================================
// キーボードショートカット
// ========================================

export const KEYBOARD_SHORTCUTS = {
  // タスク操作
  CREATE_TASK: { key: 'n', ctrlKey: true, description: '新しいタスクを作成' },
  SEARCH: { key: 'k', ctrlKey: true, description: '検索' },
  TOGGLE_SIDEBAR: { key: 'b', ctrlKey: true, description: 'サイドバー表示切替' },
  
  // ナビゲーション
  GO_TO_LIST: { key: 'l', ctrlKey: true, description: 'リストビュー' },
  GO_TO_BOARD: { key: 'b', ctrlKey: true, shiftKey: true, description: 'ボードビュー' },
  GO_TO_CALENDAR: { key: 'c', ctrlKey: true, description: 'カレンダービュー' },
  GO_TO_DASHBOARD: { key: 'd', ctrlKey: true, description: 'ダッシュボード' },
  
  // モーダル操作
  CLOSE_MODAL: { key: 'Escape', description: 'モーダルを閉じる' },
  SAVE: { key: 's', ctrlKey: true, description: '保存' },
  
  // タスク詳細
  EDIT_TASK: { key: 'e', description: 'タスクを編集' },
  DELETE_TASK: { key: 'Delete', description: 'タスクを削除' },
  TOGGLE_COMPLETE: { key: 'Enter', description: '完了状態を切替' },
} as const;

// ========================================
// ビュー設定
// ========================================

export const VIEW_CONFIG = {
  LIST: {
    id: 'list',
    label: 'リスト',
    icon: '📋',
  },
  BOARD: {
    id: 'board',
    label: 'ボード',
    icon: '📊',
  },
  CALENDAR: {
    id: 'calendar',
    label: 'カレンダー',
    icon: '📅',
  },
  DASHBOARD: {
    id: 'dashboard',
    label: 'ダッシュボード',
    icon: '📈',
  },
} as const;

// ========================================
// デフォルト値
// ========================================

export const DEFAULT_VALUES = {
  TASK_STATUS: '未着手' as TaskStatus,
  TASK_PRIORITY: '中' as TaskPriority,
  TASK_CATEGORY: '事業' as const,
  AI_PRIORITY_SCORE: 50,
  SORT_ORDER: 0,
  IS_ARCHIVED: false,
  
  // ページネーション
  PAGE_SIZE: 20,
  PAGE: 1,
  
  // フィルター
  FILTER_STATUS: [] as TaskStatus[],
  FILTER_PRIORITY: [] as TaskPriority[],
} as const;

// ========================================
// APIエンドポイント
// ========================================

export const API_ENDPOINTS = {
  TASKS: '/api/tasks',
  TASK_DETAIL: (id: string) => `/api/tasks/${id}`,
  SUBTASKS: '/api/subtasks',
  SUBTASK_DETAIL: (id: string) => `/api/subtasks/${id}`,
  AI_SUGGESTION: '/api/ai-suggestion',
  DAILY_SUMMARY: '/api/daily-summary',
  SLACK_ADD_TASK: '/api/slack/add-task',
  CATEGORIES: '/api/categories',
  TAGS: '/api/tags',
  ACTIVITY_LOGS: '/api/activity-logs',
  SAVED_FILTERS: '/api/saved-filters',
} as const;

// ========================================
// バリデーション定数
// ========================================

export const VALIDATION = {
  TASK_TITLE_MIN_LENGTH: 1,
  TASK_TITLE_MAX_LENGTH: 200,
  TASK_DESCRIPTION_MAX_LENGTH: 5000,
  TAG_NAME_MAX_LENGTH: 30,
  CATEGORY_NAME_MAX_LENGTH: 50,
  AI_PRIORITY_SCORE_MIN: 1,
  AI_PRIORITY_SCORE_MAX: 100,
} as const;

// ========================================
// 通知設定
// ========================================

export const NOTIFICATION_CONFIG = {
  REMINDER_1DAY: {
    type: 'reminder_1day' as const,
    title: '明日が期限のタスクがあります',
    beforeHours: 24,
  },
  REMINDER_1HOUR: {
    type: 'reminder_1hour' as const,
    title: '1時間後が期限のタスクがあります',
    beforeHours: 1,
  },
  TASK_COMPLETED: {
    type: 'task_completed' as const,
    title: 'タスクが完了しました',
  },
  TASK_OVERDUE: {
    type: 'task_overdue' as const,
    title: '期限切れのタスクがあります',
  },
} as const;

// ========================================
// アニメーション設定
// ========================================

export const ANIMATION_DURATION = {
  FAST: 200,
  NORMAL: 300,
  SLOW: 500,
} as const;

export const ANIMATION_EASING = {
  DEFAULT: 'cubic-bezier(0.4, 0, 0.2, 1)',
  EASE_IN: 'cubic-bezier(0.4, 0, 1, 1)',
  EASE_OUT: 'cubic-bezier(0, 0, 0.2, 1)',
  EASE_IN_OUT: 'cubic-bezier(0.4, 0, 0.2, 1)',
} as const;

// ========================================
// ローカルストレージキー
// ========================================

export const STORAGE_KEYS = {
  VIEW_MODE: 'meem_task_manager_view_mode',
  FILTER_CONFIG: 'meem_task_manager_filter_config',
  SORT_CONFIG: 'meem_task_manager_sort_config',
  SIDEBAR_COLLAPSED: 'meem_task_manager_sidebar_collapsed',
  THEME: 'meem_task_manager_theme',
} as const;

// ========================================
// エラーメッセージ
// ========================================

export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'ネットワークエラーが発生しました',
  SERVER_ERROR: 'サーバーエラーが発生しました',
  VALIDATION_ERROR: '入力内容に誤りがあります',
  NOT_FOUND: 'データが見つかりません',
  UNAUTHORIZED: '認証が必要です',
  FORBIDDEN: 'アクセス権限がありません',
  TASK_TITLE_REQUIRED: 'タスク名は必須です',
  TASK_TITLE_TOO_LONG: 'タスク名が長すぎます',
  INVALID_STATUS: '無効なステータスです',
  INVALID_PRIORITY: '無効な優先度です',
} as const;

// ========================================
// 成功メッセージ
// ========================================

export const SUCCESS_MESSAGES = {
  TASK_CREATED: 'タスクを作成しました',
  TASK_UPDATED: 'タスクを更新しました',
  TASK_DELETED: 'タスクを削除しました',
  TASK_COMPLETED: 'タスクを完了しました',
  SUBTASK_CREATED: 'サブタスクを作成しました',
  SUBTASK_UPDATED: 'サブタスクを更新しました',
  SUBTASK_DELETED: 'サブタスクを削除しました',
  FILTER_SAVED: 'フィルターを保存しました',
  SETTINGS_SAVED: '設定を保存しました',
} as const;

// ========================================
// 日付フォーマット
// ========================================

export const DATE_FORMATS = {
  FULL: 'yyyy年M月d日(E)',
  SHORT: 'M/d',
  ISO: 'yyyy-MM-dd',
  TIME: 'HH:mm',
  DATETIME: 'yyyy-MM-dd HH:mm',
} as const;
