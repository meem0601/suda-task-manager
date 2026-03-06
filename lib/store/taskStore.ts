import { create } from 'zustand';
import { supabase } from '@/lib/supabase';
import { Task, CreateTaskRequest, UpdateTaskRequest } from '@/src/lib/types';

interface TaskStore {
  // State
  tasks: Task[];
  loading: boolean;
  error: string | null;
  selectedTask: Task | null;

  // Actions
  fetchTasks: (filters?: any) => Promise<void>;
  addTask: (task: CreateTaskRequest) => Promise<void>;
  updateTask: (id: string, updates: UpdateTaskRequest) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  setSelectedTask: (task: Task | null) => void;

  // Optimistic Update
  optimisticUpdate: (id: string, updates: Partial<Task>) => void;
  rollbackUpdate: (id: string, original: Task) => void;

  // ローカル操作
  _updateTaskInStore: (id: string, updates: Partial<Task>) => void;
}

export const useTaskStore = create<TaskStore>((set, get) => ({
  // 初期状態
  tasks: [],
  loading: false,
  error: null,
  selectedTask: null,

  // タスク取得
  fetchTasks: async (filters = {}) => {
    set({ loading: true, error: null });

    try {
      let query = supabase
        .from('tasks')
        .select('*')
        .order('sort_order', { ascending: true });

      // フィルタ適用
      if (filters.status) {
        query = query.in('status', Array.isArray(filters.status) ? filters.status : [filters.status]);
      }
      if (filters.category) {
        query = query.eq('category', filters.category);
      }
      if (filters.is_archived !== undefined) {
        query = query.eq('is_archived', filters.is_archived);
      }

      const { data, error } = await query;

      if (error) throw error;

      set({ tasks: data || [], loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },

  // タスク追加
  addTask: async (task: CreateTaskRequest) => {
    set({ loading: true, error: null });

    try {
      const { data, error } = await supabase
        .from('tasks')
        .insert([
          {
            ...task,
            status: task.status || '未着手',
            is_archived: false,
            sort_order: get().tasks.length,
          },
        ])
        .select()
        .single();

      if (error) throw error;

      set((state) => ({
        tasks: [...state.tasks, data],
        loading: false,
      }));
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },

  // タスク更新
  updateTask: async (id: string, updates: UpdateTaskRequest) => {
    const original = get().tasks.find((t) => t.id === id);
    if (!original) return;

    // Optimistic Update
    get().optimisticUpdate(id, updates);

    try {
      const updateData: any = { ...updates };

      // 完了ステータスの場合、completed_atをセット
      if (updates.status === '完了' && !original.completed_at) {
        updateData.completed_at = new Date().toISOString();
      } else if (updates.status && updates.status !== '完了' && original.completed_at) {
        updateData.completed_at = null;
      }

      const { error } = await supabase
        .from('tasks')
        .update(updateData)
        .eq('id', id);

      if (error) throw error;

      // 成功したら最新データを取得
      await get().fetchTasks();
    } catch (error: any) {
      // ロールバック
      get().rollbackUpdate(id, original);
      set({ error: error.message });
    }
  },

  // タスク削除
  deleteTask: async (id: string) => {
    set({ loading: true, error: null });

    try {
      // サブタスクも削除
      const { error: subtaskError } = await supabase
        .from('subtasks')
        .delete()
        .eq('task_id', id);

      if (subtaskError) throw subtaskError;

      const { error } = await supabase.from('tasks').delete().eq('id', id);

      if (error) throw error;

      set((state) => ({
        tasks: state.tasks.filter((t) => t.id !== id),
        selectedTask: state.selectedTask?.id === id ? null : state.selectedTask,
        loading: false,
      }));
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },

  // 選択タスク設定
  setSelectedTask: (task: Task | null) => {
    set({ selectedTask: task });
  },

  // Optimistic Update
  optimisticUpdate: (id: string, updates: Partial<Task>) => {
    get()._updateTaskInStore(id, updates);
  },

  // ロールバック
  rollbackUpdate: (id: string, original: Task) => {
    set((state) => ({
      tasks: state.tasks.map((t) => (t.id === id ? original : t)),
    }));
  },

  // ストア内でタスク更新
  _updateTaskInStore: (id: string, updates: Partial<Task>) => {
    set((state) => ({
      tasks: state.tasks.map((t) =>
        t.id === id ? { ...t, ...updates, updated_at: new Date().toISOString() } : t
      ),
      selectedTask:
        state.selectedTask?.id === id
          ? { ...state.selectedTask, ...updates, updated_at: new Date().toISOString() }
          : state.selectedTask,
    }));
  },
}));
