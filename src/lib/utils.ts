/**
 * MEEM Task Manager - ユーティリティ関数
 * 作成日: 2026-03-06
 */

import type { TaskStatus, TaskPriority, Task } from './types';
import { PRIORITY_CONFIG, STATUS_CONFIG, CATEGORY_COLORS } from './constants';
import { format, parseISO, isToday, isTomorrow, isPast, differenceInDays } from 'date-fns';
import { ja } from 'date-fns/locale';

// ========================================
// クラス名結合
// ========================================

/**
 * クラス名を結合するユーティリティ
 * @example cn('class1', 'class2', condition && 'class3')
 */
export function cn(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(' ');
}

// ========================================
// 日付フォーマット
// ========================================

/**
 * 日付を日本語でフォーマット
 */
export function formatDate(date: string | Date, formatStr: string = 'yyyy年M月d日'): string {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return format(dateObj, formatStr, { locale: ja });
}

/**
 * 相対的な日付表示（今日、明日、昨日など）
 */
export function formatRelativeDate(date: string | Date): string {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  
  if (isToday(dateObj)) return '今日';
  if (isTomorrow(dateObj)) return '明日';
  
  const diffDays = differenceInDays(dateObj, new Date());
  
  if (diffDays === -1) return '昨日';
  if (diffDays > 0 && diffDays <= 7) return `${diffDays}日後`;
  if (diffDays < 0 && diffDays >= -7) return `${Math.abs(diffDays)}日前`;
  
  return formatDate(dateObj, 'M月d日');
}

/**
 * 期限の色を取得（今日、明日、期限切れなど）
 */
export function getDueDateColor(dueDate: string | null): string {
  if (!dueDate) return 'text-neutral-500';
  
  const date = parseISO(dueDate);
  
  if (isPast(date) && !isToday(date)) return 'text-danger-600';
  if (isToday(date)) return 'text-warning-600';
  if (isTomorrow(date)) return 'text-warning-500';
  
  return 'text-neutral-600';
}

// ========================================
// ステータス・優先度ヘルパー
// ========================================

/**
 * ステータスの色を取得
 */
export function getStatusColor(status: TaskStatus): string {
  return STATUS_CONFIG[status]?.color || '#a3a3a3';
}

/**
 * ステータスの背景色を取得
 */
export function getStatusBgColor(status: TaskStatus): string {
  return STATUS_CONFIG[status]?.bgColor || '#f5f5f5';
}

/**
 * 優先度の色を取得
 */
export function getPriorityColor(priority: TaskPriority): string {
  return PRIORITY_CONFIG[priority]?.color || '#a3a3a3';
}

/**
 * 優先度のソート順を取得
 */
export function getPrioritySortOrder(priority: TaskPriority | null): number {
  if (!priority) return 999;
  return PRIORITY_CONFIG[priority]?.sortOrder || 999;
}

/**
 * カテゴリの色を取得
 */
export function getCategoryColor(categoryName: string): {
  primary: string;
  bg: string;
  text: string;
  border: string;
} {
  return CATEGORY_COLORS[categoryName] || CATEGORY_COLORS['デフォルト'];
}

// ========================================
// タスクヘルパー
// ========================================

/**
 * タスクが期限切れかチェック
 */
export function isTaskOverdue(task: Task): boolean {
  if (!task.due_date || task.status === '完了') return false;
  return isPast(parseISO(task.due_date)) && !isToday(parseISO(task.due_date));
}

/**
 * タスクが今日期限かチェック
 */
export function isTaskDueToday(task: Task): boolean {
  if (!task.due_date) return false;
  return isToday(parseISO(task.due_date));
}

/**
 * タスクが明日期限かチェック
 */
export function isTaskDueTomorrow(task: Task): boolean {
  if (!task.due_date) return false;
  return isTomorrow(parseISO(task.due_date));
}

/**
 * タスクの完了率を計算（サブタスク含む）
 */
export function calculateTaskProgress(task: Task & { subtasks?: any[] }): number {
  if (!task.subtasks || task.subtasks.length === 0) {
    return task.status === '完了' ? 100 : 0;
  }
  
  const completedCount = task.subtasks.filter(st => st.completed).length;
  return Math.round((completedCount / task.subtasks.length) * 100);
}

/**
 * タスクリストをフィルタリング
 */
export function filterTasks(
  tasks: Task[],
  filters: {
    status?: TaskStatus[];
    priority?: TaskPriority[];
    search?: string;
    isArchived?: boolean;
  }
): Task[] {
  return tasks.filter(task => {
    // ステータスフィルター
    if (filters.status && filters.status.length > 0) {
      if (!filters.status.includes(task.status)) return false;
    }
    
    // 優先度フィルター
    if (filters.priority && filters.priority.length > 0) {
      if (!task.priority || !filters.priority.includes(task.priority)) return false;
    }
    
    // 検索フィルター
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      const matchTitle = task.title.toLowerCase().includes(searchLower);
      const matchDescription = task.description?.toLowerCase().includes(searchLower);
      if (!matchTitle && !matchDescription) return false;
    }
    
    // アーカイブフィルター
    if (filters.isArchived !== undefined) {
      if (task.is_archived !== filters.isArchived) return false;
    }
    
    return true;
  });
}

/**
 * タスクリストをソート
 */
export function sortTasks(
  tasks: Task[],
  sortBy: 'created_at' | 'updated_at' | 'due_date' | 'priority' | 'sort_order' = 'created_at',
  order: 'asc' | 'desc' = 'desc'
): Task[] {
  const sorted = [...tasks].sort((a, b) => {
    let valueA: any;
    let valueB: any;
    
    switch (sortBy) {
      case 'priority':
        valueA = getPrioritySortOrder(a.priority || null);
        valueB = getPrioritySortOrder(b.priority || null);
        break;
      case 'due_date':
        valueA = a.due_date ? new Date(a.due_date).getTime() : Infinity;
        valueB = b.due_date ? new Date(b.due_date).getTime() : Infinity;
        break;
      case 'sort_order':
        valueA = a.sort_order;
        valueB = b.sort_order;
        break;
      default:
        valueA = new Date(a[sortBy]).getTime();
        valueB = new Date(b[sortBy]).getTime();
    }
    
    if (order === 'asc') {
      return valueA > valueB ? 1 : -1;
    } else {
      return valueA < valueB ? 1 : -1;
    }
  });
  
  return sorted;
}

// ========================================
// バリデーション
// ========================================

/**
 * メールアドレスの妥当性チェック
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * URLの妥当性チェック
 */
export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

// ========================================
// テキスト処理
// ========================================

/**
 * テキストを切り詰める
 */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}

/**
 * 改行をHTMLのbrタグに変換
 */
export function nl2br(text: string): string {
  return text.replace(/\n/g, '<br>');
}

// ========================================
// 数値フォーマット
// ========================================

/**
 * パーセンテージをフォーマット
 */
export function formatPercentage(value: number): string {
  return `${Math.round(value)}%`;
}

/**
 * 数値を3桁カンマ区切りでフォーマット
 */
export function formatNumber(value: number): string {
  return value.toLocaleString('ja-JP');
}

// ========================================
// ローカルストレージヘルパー
// ========================================

/**
 * ローカルストレージに保存
 */
export function setLocalStorage<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error('Failed to save to localStorage:', error);
  }
}

/**
 * ローカルストレージから取得
 */
export function getLocalStorage<T>(key: string, defaultValue: T): T {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error('Failed to get from localStorage:', error);
    return defaultValue;
  }
}

/**
 * ローカルストレージから削除
 */
export function removeLocalStorage(key: string): void {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error('Failed to remove from localStorage:', error);
  }
}

// ========================================
// デバウンス・スロットル
// ========================================

/**
 * デバウンス関数
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;
  
  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func(...args);
    };
    
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * スロットル関数
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  
  return function executedFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}
