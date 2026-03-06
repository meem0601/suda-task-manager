'use client';

import { useFilterStore } from '@/lib/store/filterStore';
import { TaskStatus, TaskPriority, TaskCategory } from '@/src/lib/types';

interface FilterBarProps {
  onFilterChange?: () => void;
}

export default function FilterBar({ onFilterChange }: FilterBarProps) {
  const { activeFilters, setFilter, clearFilters } = useFilterStore();

  const statuses: TaskStatus[] = ['未着手', '進行中', 'レビュー中', '完了'];
  const priorities: TaskPriority[] = ['緊急', '高', '中', '低', '今すぐやる', '今週やる', '今月やる'];
  const categories: TaskCategory[] = ['個人', '事業'];

  const toggleArrayFilter = (
    key: 'status' | 'priority' | 'category',
    value: any
  ) => {
    const current = activeFilters[key] as any[] | undefined;
    const newValue = current?.includes(value)
      ? current.filter((v) => v !== value)
      : [...(current || []), value];
    setFilter(key, newValue.length > 0 ? (newValue as any) : undefined);
    onFilterChange?.();
  };

  const hasActiveFilters =
    activeFilters.status?.length ||
    activeFilters.priority?.length ||
    activeFilters.category?.length ||
    activeFilters.search;

  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-2xl border-2 border-neutral-200 p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-neutral-900">フィルター</h3>
        {hasActiveFilters && (
          <button
            onClick={() => {
              clearFilters();
              onFilterChange?.();
            }}
            className="btn-sm btn-secondary"
          >
            クリア
          </button>
        )}
      </div>

      <div className="space-y-6">
        {/* 検索 */}
        <div>
          <label className="block text-sm font-semibold text-neutral-700 mb-2">
            🔍 検索
          </label>
          <input
            type="text"
            value={activeFilters.search || ''}
            onChange={(e) => {
              setFilter('search', e.target.value || undefined);
              onFilterChange?.();
            }}
            placeholder="タスクを検索..."
            className="input w-full"
          />
        </div>

        {/* ステータス */}
        <div>
          <label className="block text-sm font-semibold text-neutral-700 mb-2">
            📊 ステータス
          </label>
          <div className="flex flex-wrap gap-2">
            {statuses.map((status) => (
              <button
                key={status}
                onClick={() => toggleArrayFilter('status', status)}
                className={`
                  badge cursor-pointer transition-all
                  ${
                    activeFilters.status?.includes(status)
                      ? status === '完了'
                        ? 'badge-success'
                        : status === '進行中'
                        ? 'badge-primary'
                        : 'badge-neutral'
                      : 'badge-secondary'
                  }
                `}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        {/* 優先度 */}
        <div>
          <label className="block text-sm font-semibold text-neutral-700 mb-2">
            ⚡ 優先度
          </label>
          <div className="flex flex-wrap gap-2">
            {priorities.map((priority) => {
              const emoji =
                priority === '緊急' ? '🚨' :
                priority === '高' ? '🔴' :
                priority === '中' ? '🟡' :
                priority === '低' ? '🟢' :
                priority === '今すぐやる' ? '🔥' :
                priority === '今週やる' ? '⚡' :
                '📅';

              return (
                <button
                  key={priority}
                  onClick={() => toggleArrayFilter('priority', priority)}
                  className={`
                    badge cursor-pointer transition-all
                    ${
                      activeFilters.priority?.includes(priority)
                        ? 'badge-primary'
                        : 'badge-secondary'
                    }
                  `}
                >
                  {emoji} {priority}
                </button>
              );
            })}
          </div>
        </div>

        {/* カテゴリ */}
        <div>
          <label className="block text-sm font-semibold text-neutral-700 mb-2">
            📁 カテゴリ
          </label>
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => toggleArrayFilter('category', category)}
                className={`
                  badge cursor-pointer transition-all
                  ${
                    activeFilters.category?.includes(category)
                      ? 'badge-primary'
                      : 'badge-secondary'
                  }
                `}
              >
                {category === '個人' ? '👤' : '🏢'} {category}
              </button>
            ))}
          </div>
        </div>

        {/* 期限フィルター */}
        <div>
          <label className="block text-sm font-semibold text-neutral-700 mb-2">
            📅 期限
          </label>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-neutral-600 mb-1">開始日</label>
              <input
                type="date"
                value={activeFilters.due_date_from || ''}
                onChange={(e) => {
                  setFilter('due_date_from', e.target.value || undefined);
                  onFilterChange?.();
                }}
                className="input w-full text-sm"
              />
            </div>
            <div>
              <label className="block text-xs text-neutral-600 mb-1">終了日</label>
              <input
                type="date"
                value={activeFilters.due_date_to || ''}
                onChange={(e) => {
                  setFilter('due_date_to', e.target.value || undefined);
                  onFilterChange?.();
                }}
                className="input w-full text-sm"
              />
            </div>
          </div>
        </div>

        {/* クイックフィルター */}
        <div>
          <label className="block text-sm font-semibold text-neutral-700 mb-2">
            ⚡ クイックフィルター
          </label>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => {
                const today = new Date().toISOString().split('T')[0];
                setFilter('due_date_from', today);
                setFilter('due_date_to', today);
                onFilterChange?.();
              }}
              className="btn-sm btn-secondary"
            >
              📅 今日
            </button>
            <button
              onClick={() => {
                const today = new Date();
                const weekLater = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
                setFilter('due_date_from', today.toISOString().split('T')[0]);
                setFilter('due_date_to', weekLater.toISOString().split('T')[0]);
                onFilterChange?.();
              }}
              className="btn-sm btn-secondary"
            >
              📆 今週
            </button>
            <button
              onClick={() => {
                const today = new Date();
                setFilter('due_date_to', today.toISOString().split('T')[0]);
                setFilter('status', ['未着手', '進行中', 'レビュー中']);
                onFilterChange?.();
              }}
              className="btn-sm btn-danger"
            >
              ⚠️ 期限切れ
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
