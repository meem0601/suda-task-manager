import { useMemo } from 'react';
import { Task, FilterConfig } from '@/src/lib/types';

export function useFilters(tasks: Task[], filters: FilterConfig): Task[] {
  return useMemo(() => {
    let filtered = [...tasks];

    // ステータスフィルター
    if (filters.status && filters.status.length > 0) {
      filtered = filtered.filter((task) => filters.status!.includes(task.status));
    }

    // 優先度フィルター
    if (filters.priority && filters.priority.length > 0) {
      filtered = filtered.filter(
        (task) => task.priority && filters.priority!.includes(task.priority)
      );
    }

    // カテゴリフィルター
    if (filters.category && filters.category.length > 0) {
      filtered = filtered.filter((task) => filters.category!.includes(task.category));
    }

    // 検索フィルター
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(
        (task) =>
          task.title.toLowerCase().includes(searchLower) ||
          task.description?.toLowerCase().includes(searchLower)
      );
    }

    // 期限フィルター
    if (filters.due_date_from) {
      filtered = filtered.filter(
        (task) => task.due_date && task.due_date >= filters.due_date_from!
      );
    }
    if (filters.due_date_to) {
      filtered = filtered.filter(
        (task) => task.due_date && task.due_date <= filters.due_date_to!
      );
    }

    // アーカイブフィルター
    if (filters.is_archived !== undefined) {
      filtered = filtered.filter((task) => task.is_archived === filters.is_archived);
    }

    // ソート
    if (filters.sort_by) {
      filtered.sort((a, b) => {
        const aValue = a[filters.sort_by!] as any;
        const bValue = b[filters.sort_by!] as any;

        if (aValue === bValue) return 0;
        if (aValue === null || aValue === undefined) return 1;
        if (bValue === null || bValue === undefined) return -1;

        const comparison = aValue > bValue ? 1 : -1;
        return filters.sort_order === 'asc' ? comparison : -comparison;
      });
    }

    return filtered;
  }, [tasks, filters]);
}
