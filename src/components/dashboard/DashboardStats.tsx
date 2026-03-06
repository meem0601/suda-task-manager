'use client';

import { motion } from 'framer-motion';
import { AreaChart, Area, ResponsiveContainer, Tooltip } from 'recharts';

interface Task {
  id: string;
  title: string;
  status: string;
  priority?: string;
  due_date?: string;
  business_type?: string;
  category: string;
  completed_at?: string;
}

interface DashboardStatsProps {
  tasks: Task[];
}

export default function DashboardStats({ tasks }: DashboardStatsProps) {
  // 期限切れタスク
  const overdueTasks = tasks.filter(task => {
    if (!task.due_date || task.status === '完了') return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dueDate = new Date(task.due_date);
    dueDate.setHours(0, 0, 0, 0);
    return dueDate < today;
  });

  // 今日のタスク
  const todayTasks = tasks.filter(task => {
    if (!task.due_date || task.status === '完了') return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dueDate = new Date(task.due_date);
    dueDate.setHours(0, 0, 0, 0);
    return dueDate.getTime() === today.getTime();
  });

  // 事業別サマリー
  const businessSummary = [
    { name: '不動産', color: '#10B981', tasks: tasks.filter(t => t.business_type === '不動産' && t.status !== '完了').length },
    { name: '人材', color: '#3B82F6', tasks: tasks.filter(t => t.business_type === '人材' && t.status !== '完了').length },
    { name: 'ワタシ婚', color: '#F43F5E', tasks: tasks.filter(t => t.business_type === '結婚相談所' && t.status !== '完了').length },
    { name: 'OCTAGON', color: '#F59E0B', tasks: tasks.filter(t => t.business_type === '経済圏' && t.status !== '完了').length },
    { name: '全社', color: '#6B7280', tasks: tasks.filter(t => t.business_type === 'コーポレート' && t.status !== '完了').length },
  ].filter(b => b.tasks > 0);

  // 完了推移（過去7日間）
  const completionData = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    date.setHours(0, 0, 0, 0);
    
    const completedCount = tasks.filter(task => {
      if (!task.completed_at) return false;
      const completedDate = new Date(task.completed_at);
      completedDate.setHours(0, 0, 0, 0);
      return completedDate.getTime() === date.getTime();
    }).length;

    return {
      date: `${date.getMonth() + 1}/${date.getDate()}`,
      completed: completedCount,
    };
  });

  const statsCards = [
    {
      title: '期限切れ',
      value: overdueTasks.length,
      icon: '⚠️',
      color: 'from-red-400 to-pink-400',
      bgColor: 'from-red-50 to-pink-50',
    },
    {
      title: '今日のタスク',
      value: todayTasks.length,
      icon: '📋',
      color: 'from-blue-400 to-cyan-400',
      bgColor: 'from-blue-50 to-cyan-50',
    },
    {
      title: '進行中',
      value: tasks.filter(t => t.status === '進行中').length,
      icon: '🔵',
      color: 'from-purple-400 to-pink-400',
      bgColor: 'from-purple-50 to-pink-50',
    },
    {
      title: '完了',
      value: tasks.filter(t => t.status === '完了').length,
      icon: '✅',
      color: 'from-green-400 to-emerald-400',
      bgColor: 'from-green-50 to-emerald-50',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {/* 統計カード */}
      {statsCards.map((stat, index) => (
        <motion.div
          key={stat.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: index * 0.1 }}
          whileHover={{ y: -4, scale: 1.02 }}
          className={`
            relative overflow-hidden rounded-2xl p-6
            bg-gradient-to-br ${stat.bgColor}
            border border-white/50
            shadow-lg hover:shadow-2xl
            transition-all duration-300
            backdrop-blur-sm
          `}
        >
          {/* 装飾的なグラデーション */}
          <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${stat.color} opacity-10 rounded-full blur-2xl`} />
          
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className={`
                w-12 h-12 rounded-2xl
                bg-gradient-to-br ${stat.color}
                flex items-center justify-center
                text-2xl shadow-lg
              `}>
                {stat.icon}
              </div>
              <div className={`
                text-4xl font-black
                text-transparent bg-clip-text
                bg-gradient-to-r ${stat.color}
              `}>
                {stat.value}
              </div>
            </div>
            <h3 className="text-sm font-bold text-neutral-700 uppercase tracking-wider">
              {stat.title}
            </h3>
          </div>
        </motion.div>
      ))}

      {/* 事業別サマリー */}
      {businessSummary.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="md:col-span-2 lg:col-span-2 rounded-2xl p-6 bg-white/90 backdrop-blur-sm border border-white/50 shadow-lg"
        >
          <h3 className="text-lg font-bold text-neutral-900 mb-4 flex items-center gap-2">
            <span className="text-2xl">📊</span>
            事業別タスク
          </h3>
          <div className="space-y-3">
            {businessSummary.map((business, index) => (
              <motion.div
                key={business.name}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.5 + index * 0.1 }}
                className="flex items-center gap-4"
              >
                <div
                  className="w-3 h-3 rounded-full shadow-lg"
                  style={{ backgroundColor: business.color }}
                />
                <span className="flex-1 font-semibold text-neutral-700">{business.name}</span>
                <span className="text-2xl font-black text-neutral-900">{business.tasks}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* 完了推移グラフ */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
        className="md:col-span-2 lg:col-span-2 rounded-2xl p-6 bg-white/90 backdrop-blur-sm border border-white/50 shadow-lg"
      >
        <h3 className="text-lg font-bold text-neutral-900 mb-4 flex items-center gap-2">
          <span className="text-2xl">📈</span>
          完了推移（過去7日間）
        </h3>
        <ResponsiveContainer width="100%" height={150}>
          <AreaChart data={completionData}>
            <defs>
              <linearGradient id="colorCompleted" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
              </linearGradient>
            </defs>
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                border: 'none',
                borderRadius: '12px',
                boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)',
                padding: '8px 12px',
              }}
              labelStyle={{ fontWeight: 'bold', color: '#171717' }}
            />
            <Area
              type="monotone"
              dataKey="completed"
              stroke="#10B981"
              strokeWidth={3}
              fillOpacity={1}
              fill="url(#colorCompleted)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </motion.div>
    </div>
  );
}
