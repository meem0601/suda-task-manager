'use client';

import { Task } from '@/src/lib/types';
import { motion } from 'framer-motion';

interface OverdueAlertProps {
  tasks: Task[];
}

export default function OverdueAlert({ tasks }: OverdueAlertProps) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const overdueTasks = tasks.filter((task) => {
    if (!task.due_date || task.status === '完了') return false;
    const dueDate = new Date(task.due_date);
    dueDate.setHours(0, 0, 0, 0);
    return dueDate < today;
  });

  if (overdueTasks.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="rounded-2xl p-6 bg-gradient-to-r from-red-50 to-orange-50 border-2 border-red-300 shadow-lg mb-6"
    >
      <div className="flex items-start gap-4">
        <div className="text-4xl">⚠️</div>
        <div className="flex-1">
          <h3 className="text-xl font-bold text-red-900 mb-2">
            期限切れタスク
            <span className="ml-2 badge badge-danger">{overdueTasks.length}</span>
          </h3>
          <p className="text-red-700 mb-4">以下のタスクが期限を過ぎています。早急な対応が必要です。</p>
          <div className="space-y-2">
            {overdueTasks.slice(0, 3).map((task) => (
              <div
                key={task.id}
                onClick={() => (window.location.href = `/?task=${task.id}`)}
                className="flex items-center justify-between p-3 rounded-lg bg-white/80 backdrop-blur-sm border border-red-200 hover:shadow-md transition-all cursor-pointer"
              >
                <div className="flex-1">
                  <h4 className="font-bold text-red-900">{task.title}</h4>
                  <p className="text-sm text-red-700">
                    期限: {new Date(task.due_date!).toLocaleDateString('ja-JP')}
                  </p>
                </div>
                <button className="btn-sm btn-danger">
                  詳細
                </button>
              </div>
            ))}
            {overdueTasks.length > 3 && (
              <p className="text-sm text-red-700 text-center">
                他 {overdueTasks.length - 3}件
              </p>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
