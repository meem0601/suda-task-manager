'use client';

import { motion } from 'framer-motion';
import { emptyState, pulse, transitions } from '@/src/lib/animations';
import { Inbox, CalendarX, CheckCircle, ListTodo } from 'lucide-react';

interface EmptyStateProps {
  type?: 'tasks' | 'calendar' | 'completed' | 'board';
  onAddTask?: () => void;
  message?: string;
  showButton?: boolean;
}

export default function EmptyState({
  type = 'tasks',
  onAddTask,
  message,
  showButton = true,
}: EmptyStateProps) {
  const configs = {
    tasks: {
      icon: Inbox,
      title: 'まだタスクがありません',
      description: message || '最初のタスクを追加してみましょう',
      emoji: '📭',
      color: 'from-purple-400 to-pink-400',
    },
    calendar: {
      icon: CalendarX,
      title: 'この日のタスクはありません',
      description: message || '別の日付を選択するか、新しいタスクを追加しましょう',
      emoji: '📅',
      color: 'from-blue-400 to-cyan-400',
    },
    completed: {
      icon: CheckCircle,
      title: '完了したタスクはありません',
      description: message || 'タスクを完了すると、ここに表示されます',
      emoji: '✨',
      color: 'from-green-400 to-emerald-400',
    },
    board: {
      icon: ListTodo,
      title: 'このカラムは空です',
      description: message || 'タスクをドラッグ＆ドロップするか、新規追加しましょう',
      emoji: '📝',
      color: 'from-orange-400 to-red-400',
    },
  };

  const config = configs[type];
  const Icon = config.icon;

  return (
    <motion.div
      variants={emptyState}
      initial="initial"
      animate="animate"
      className="flex flex-col items-center justify-center py-16 px-4 text-center"
    >
      {/* アイコン背景 */}
      <motion.div
        className={`
          relative mb-6
          w-24 h-24 rounded-full
          bg-gradient-to-br ${config.color}
          flex items-center justify-center
          shadow-lg
        `}
        whileHover={{ scale: 1.1, rotate: 5 }}
        transition={transitions.spring}
      >
        <div className="absolute inset-0 rounded-full bg-white/30 animate-pulse" />
        <Icon className="w-12 h-12 text-white relative z-10" strokeWidth={2.5} />
      </motion.div>

      {/* テキスト */}
      <motion.h3
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, ...transitions.medium }}
        className="text-xl font-bold text-neutral-800 mb-2"
      >
        {config.title}
      </motion.h3>

      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, ...transitions.medium }}
        className="text-neutral-600 mb-8 max-w-md"
      >
        {config.description}
      </motion.p>

      {/* ボタン */}
      {showButton && onAddTask && (
        <motion.button
          onClick={onAddTask}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{
            opacity: 1,
            scale: 1,
            transition: { delay: 0.3, ...transitions.medium },
          }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className={`
            px-6 py-3 rounded-xl
            bg-gradient-to-r ${config.color}
            text-white font-bold
            shadow-lg hover:shadow-xl
            transition-all duration-200
            flex items-center gap-2
          `}
        >
          <span className="text-xl">+</span>
          タスクを追加
        </motion.button>
      )}

      {/* 装飾的な絵文字（パルスアニメーション） */}
      <motion.div
        className="text-6xl mt-8 opacity-20"
        variants={pulse}
        animate="animate"
      >
        {config.emoji}
      </motion.div>
    </motion.div>
  );
}
