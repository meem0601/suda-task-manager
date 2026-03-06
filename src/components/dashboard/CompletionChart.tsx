'use client';

import { Task } from '@/src/lib/types';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { subDays, format } from 'date-fns';
import { ja } from 'date-fns/locale';

interface CompletionChartProps {
  tasks: Task[];
}

export default function CompletionChart({ tasks }: CompletionChartProps) {
  // 過去7日間のデータを生成
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = subDays(new Date(), 6 - i);
    const dateStr = format(date, 'yyyy-MM-dd');
    const completed = tasks.filter(
      (task) => task.completed_at?.startsWith(dateStr)
    ).length;

    return {
      date: format(date, 'M/d (E)', { locale: ja }),
      completed,
    };
  });

  const totalCompleted = last7Days.reduce((sum, day) => sum + day.completed, 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.6 }}
      className="rounded-2xl p-6 bg-white/90 backdrop-blur-sm border border-white/50 shadow-lg"
    >
      <h3 className="text-xl font-bold text-neutral-900 mb-4 flex items-center gap-2">
        <span className="text-2xl">📈</span>
        週間完了推移
        <span className="badge badge-success ml-auto">合計 {totalCompleted}件</span>
      </h3>

      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={last7Days}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis
              dataKey="date"
              tick={{ fill: '#6b7280', fontSize: 12 }}
              stroke="#d1d5db"
            />
            <YAxis
              tick={{ fill: '#6b7280', fontSize: 12 }}
              stroke="#d1d5db"
              allowDecimals={false}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                border: '2px solid #e5e7eb',
                borderRadius: '12px',
                padding: '12px',
              }}
              labelStyle={{ color: '#1f2937', fontWeight: 'bold' }}
              itemStyle={{ color: '#10b981' }}
            />
            <Bar dataKey="completed" fill="url(#colorCompleted)" radius={[8, 8, 0, 0]} />
            <defs>
              <linearGradient id="colorCompleted" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#10b981" stopOpacity={1} />
                <stop offset="100%" stopColor="#34d399" stopOpacity={0.8} />
              </linearGradient>
            </defs>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-4 text-center text-sm text-neutral-600">
        過去7日間で<span className="font-bold text-green-600">{totalCompleted}件</span>のタスクを完了しました 🎉
      </div>
    </motion.div>
  );
}
