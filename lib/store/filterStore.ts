import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { FilterConfig } from '@/src/lib/types';

interface FilterStore {
  // State
  activeFilters: FilterConfig;
  savedFilters: Array<{ id: string; name: string; config: FilterConfig }>;

  // Actions
  setFilter: <K extends keyof FilterConfig>(key: K, value: FilterConfig[K]) => void;
  clearFilters: () => void;
  saveFilter: (name: string) => void;
  loadFilter: (id: string) => void;
  deleteFilter: (id: string) => void;
}

const defaultFilters: FilterConfig = {
  status: undefined,
  priority: undefined,
  category: undefined,
  search: undefined,
  due_date_from: undefined,
  due_date_to: undefined,
  is_archived: false,
  sort_by: 'created_at',
  sort_order: 'desc',
};

export const useFilterStore = create<FilterStore>()(
  persist(
    (set, get) => ({
      // 初期状態
      activeFilters: defaultFilters,
      savedFilters: [],

      // フィルタ設定
      setFilter: (key, value) => {
        set((state) => ({
          activeFilters: {
            ...state.activeFilters,
            [key]: value,
          },
        }));
      },

      // フィルタクリア
      clearFilters: () => {
        set({ activeFilters: defaultFilters });
      },

      // フィルタ保存
      saveFilter: (name: string) => {
        const id = `filter_${Date.now()}`;
        set((state) => ({
          savedFilters: [
            ...state.savedFilters,
            { id, name, config: state.activeFilters },
          ],
        }));
      },

      // フィルタ読み込み
      loadFilter: (id: string) => {
        const filter = get().savedFilters.find((f) => f.id === id);
        if (filter) {
          set({ activeFilters: filter.config });
        }
      },

      // フィルタ削除
      deleteFilter: (id: string) => {
        set((state) => ({
          savedFilters: state.savedFilters.filter((f) => f.id !== id),
        }));
      },
    }),
    {
      name: 'filter-storage', // localStorage key
      partialize: (state) => ({
        savedFilters: state.savedFilters,
      }),
    }
  )
);
