import { useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useTaskStore } from '@/lib/store/taskStore';

/**
 * Realtime同期を有効にしたタスク管理フック
 */
export function useTasks() {
  const { fetchTasks, _updateTaskInStore, tasks } = useTaskStore();

  useEffect(() => {
    // 初回取得
    fetchTasks();

    // Realtime購読
    const channel = supabase
      .channel('tasks-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tasks',
        },
        (payload) => {
          console.log('Realtime event:', payload);

          if (payload.eventType === 'INSERT') {
            // 新規タスク追加
            fetchTasks();
          } else if (payload.eventType === 'UPDATE') {
            // タスク更新
            const updated = payload.new as any;
            _updateTaskInStore(updated.id, updated);
          } else if (payload.eventType === 'DELETE') {
            // タスク削除
            fetchTasks();
          }
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [fetchTasks, _updateTaskInStore]);

  return {
    tasks,
    fetchTasks,
  };
}
