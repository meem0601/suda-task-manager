'use client';

import { useDroppable } from '@dnd-kit/core';
import { Task } from '@/src/lib/types';
import TaskCard from './TaskCard';
import { motion, AnimatePresence } from 'framer-motion';
import { listContainer, listItem } from '@/src/lib/animations';
import EmptyState from '@/src/components/common/EmptyState';

interface BoardColumnProps {
  column: {
    id: string;
    title: string;
    color: string;
  };
  tasks: Task[];
  onRefresh: () => void;
}

export default function BoardColumn({ column, tasks, onRefresh }: BoardColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id: column.id });

  return (
    <div
      ref={setNodeRef}
      className={`
        bg-white/80 backdrop-blur-sm rounded-2xl p-4 border-2 transition-all
        ${isOver ? 'border-purple-400 shadow-xl scale-[1.02]' : 'border-neutral-200'}
        min-h-[600px]
      `}
    >
      {/* カラムヘッダー */}
      <div className={`${column.color} rounded-xl px-4 py-3 mb-4`}>
        <div className="flex items-center justify-between">
          <h2 className="font-bold text-neutral-900">{column.title}</h2>
          <span className="badge badge-neutral">{tasks.length}</span>
        </div>
      </div>

      {/* タスクカード */}
      <motion.div 
        className="space-y-3"
        variants={listContainer}
        initial="initial"
        animate="animate"
      >
        <AnimatePresence mode="popLayout">
          {tasks.map((task) => (
            <motion.div key={task.id} variants={listItem}>
              <TaskCard task={task} onRefresh={onRefresh} />
            </motion.div>
          ))}
        </AnimatePresence>
        
        {tasks.length === 0 && (
          <EmptyState type="board" showButton={false} />
        )}
      </motion.div>
    </div>
  );
}
