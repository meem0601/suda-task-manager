'use client';

import { useEffect, useState } from 'react';
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent, closestCorners } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { supabase } from '@/lib/supabase';
import { Task } from '@/src/lib/types';
import BoardColumn from '../components/board/BoardColumn';
import TaskCard from '../components/board/TaskCard';
import ViewSwitcher from '../components/layout/ViewSwitcher';
import LoadingSkeleton from '@/src/components/common/LoadingSkeleton';

type ColumnId = '未着手' | '進行中' | 'レビュー中' | '完了';

const COLUMNS: { id: ColumnId; title: string; color: string }[] = [
  { id: '未着手', title: '未着手', color: 'bg-neutral-100' },
  { id: '進行中', title: '進行中', color: 'bg-orange-100' },
  { id: 'レビュー中', title: 'レビュー中', color: 'bg-blue-100' },
  { id: '完了', title: '完了', color: 'bg-green-100' },
];

export default function BoardPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTask, setActiveTask] = useState<Task | null>(null);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('is_archived', false)
      .order('sort_order', { ascending: true });

    if (error) {
      console.error('Error fetching tasks:', error);
    } else {
      setTasks(data || []);
    }
    setLoading(false);
  };

  const handleDragStart = (event: DragStartEvent) => {
    const task = tasks.find(t => t.id === event.active.id);
    setActiveTask(task || null);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTask(null);

    if (!over) return;

    const activeTask = tasks.find(t => t.id === active.id);
    if (!activeTask) return;

    // カラム間移動
    const newStatus = over.id as ColumnId;
    if (activeTask.status !== newStatus) {
      const updateData: any = { status: newStatus };
      
      // 完了カラムに移動した場合、completed_atをセット
      if (newStatus === '完了') {
        updateData.completed_at = new Date().toISOString();
      } else if (activeTask.status === '完了') {
        // 完了から他のカラムに戻す場合、completed_atをクリア
        updateData.completed_at = null;
      }

      const { error } = await supabase
        .from('tasks')
        .update(updateData)
        .eq('id', activeTask.id);

      if (!error) {
        fetchTasks();
      }
    }
  };

  const groupedTasks = COLUMNS.reduce((acc, column) => {
    acc[column.id] = tasks.filter(task => task.status === column.id);
    return acc;
  }, {} as Record<ColumnId, Task[]>);

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-50 p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <div className="h-10 bg-neutral-200 rounded-lg w-64 mb-2 animate-pulse" />
            <div className="h-6 bg-neutral-200 rounded-lg w-96 animate-pulse" />
          </div>
          <LoadingSkeleton type="board" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* ヘッダー */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600 mb-1">
              ボードビュー
            </h1>
            <p className="text-neutral-600 font-semibold">
              ドラッグ&ドロップでタスクを移動
            </p>
          </div>
          <ViewSwitcher />
        </div>

        {/* ボード */}
        <DndContext
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {COLUMNS.map((column) => (
              <SortableContext
                key={column.id}
                id={column.id}
                items={groupedTasks[column.id]?.map(t => t.id) || []}
                strategy={verticalListSortingStrategy}
              >
                <BoardColumn
                  column={column}
                  tasks={groupedTasks[column.id] || []}
                  onRefresh={fetchTasks}
                />
              </SortableContext>
            ))}
          </div>

          <DragOverlay>
            {activeTask ? (
              <div className="opacity-50">
                <TaskCard task={activeTask} isDragging />
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      </div>
    </div>
  );
}
