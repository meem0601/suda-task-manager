'use client';

import { Task } from '@/src/lib/types';
import { motion } from 'framer-motion';

interface CategorySummaryProps {
  tasks: Task[];
}

export default function CategorySummary({ tasks }: CategorySummaryProps) {
  const businessTypes = ['不動産', '人材', '結婚相談所', 'コーポレート', '経済圏'];

  const getBusinessColor = (businessType: string) => {
    switch (businessType) {
      case '不動産': return '#10B981';
      case '人材': return '#3B82F6';
      case '結婚相談所': return '#F43F5E';
      case 'コーポレート': return '#F59E0B';
      case '経済圏': return '#84CC16';
      default: return '#A855F7';
    }
  };

  const getCategoryStats = (businessType: string) => {
    const categoryTasks = tasks.filter((task) => task.business_type === businessType);
    const completed = categoryTasks.filter((task) => task.status === '完了').length;
    const inProgress = categoryTasks.filter((task) => task.status === '進行中').length;
    const notStarted = categoryTasks.filter((task) => task.status === '未着手').length;

    return {
      total: categoryTasks.length,
      completed,
      inProgress,
      notStarted,
      completionRate: categoryTasks.length > 0 ? Math.round((completed / categoryTasks.length) * 100) : 0,
    };
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }}
      className="rounded-2xl p-6 bg-white/90 backdrop-blur-sm border border-white/50 shadow-lg"
    >
      <h3 className="text-xl font-bold text-neutral-900 mb-4 flex items-center gap-2">
        <span className="text-2xl">🏢</span>
        事業別サマリー
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {businessTypes.map((business, index) => {
          const stats = getCategoryStats(business);
          if (stats.total === 0) return null;

          return (
            <motion.div
              key={business}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: 0.5 + index * 0.1 }}
              className="p-4 rounded-xl border-2 transition-all hover:shadow-lg cursor-pointer"
              style={{ borderColor: getBusinessColor(business) }}
              onClick={() => (window.location.href = `/?business=${business}`)}
            >
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-bold text-neutral-900">{business}</h4>
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: getBusinessColor(business) }}
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-neutral-600">全体</span>
                  <span className="font-bold">{stats.total}件</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-neutral-600">完了</span>
                  <span className="font-bold text-green-600">{stats.completed}件</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-neutral-600">進行中</span>
                  <span className="font-bold text-blue-600">{stats.inProgress}件</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-neutral-600">未着手</span>
                  <span className="font-bold text-orange-600">{stats.notStarted}件</span>
                </div>

                {/* 進捗バー */}
                <div className="pt-2">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-neutral-600">完了率</span>
                    <span className="font-bold">{stats.completionRate}%</span>
                  </div>
                  <div className="h-2 bg-neutral-200 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${stats.completionRate}%`,
                        backgroundColor: getBusinessColor(business),
                      }}
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
