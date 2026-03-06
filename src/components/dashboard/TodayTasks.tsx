'use client';

import { Task } from '@/src/lib/types';
import { motion } from 'framer-motion';
import EmptyState from '@/src/components/common/EmptyState';

interface TodayTasksProps {
  tasks: Task[];
}

export default function TodayTasks({ tasks }: TodayTasksProps) {
  const today = new Date().toISOString().split('T')[0];
  const todayTasks = tasks.filter((task) => task.due_date?.startsWith(today) && task.status !== '完了');

  const getBusinessColor = (businessType?: string) => {
    switch (businessType) {
      case '不動産': return '#10B981';
      case '人材': return '#3B82F6';
      case '結婚相談所': return '#F43F5E';
      case 'コーポレート': return '#F59E0B';
      case '経済圏': return '#84CC16';
      default: return '#A855F7';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="rounded-2xl p-6 bg-white/90 backdrop-blur-sm border border-white/50 shadow-lg"
    >
      <h3 className="text-xl font-bold text-neutral-900 mb-4 flex items-center gap-2">
        <span className="text-2xl">📅</span>
        今日のタスク
        <span className="badge badge-primary">{todayTasks.length}</span>
      </h3>

      {todayTasks.length === 0 ? (
        <EmptyState
          type="tasks"
          message="今日のタスクはありません"
          showButton={false}
        />
      ) : (
        <div className="space-y-3">
          {todayTasks.map((task, index) => (
            <motion.div
              key={task.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.3 + index * 0.1 }}
              onClick={() => (window.location.href = `/?task=${task.id}`)}
              className="flex items-center gap-3 p-4 rounded-xl bg-white border border-neutral-200 hover:border-purple-300 hover:shadow-lg transition-all cursor-pointer"
            >
              <div
                className="w-1 h-12 rounded-full"
                style={{ backgroundColor: getBusinessColor(task.business_type) }}
              />
              <div className="flex-1">
                <h4 className="font-bold text-neutral-900 mb-1">{task.title}</h4>
                {task.description && (
                  <p className="text-sm text-neutral-600 truncate">{task.description}</p>
                )}
              </div>
              <span
                className={`
                  badge
                  ${task.status === '進行中' ? 'badge-primary' : 'badge-neutral'}
                `}
              >
                {task.status}
              </span>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
