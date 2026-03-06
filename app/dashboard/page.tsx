'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { Task } from '@/src/lib/types';
import WelcomeHero from '@/src/components/dashboard/WelcomeHero';
import DashboardStats from '@/src/components/dashboard/DashboardStats';
import TodayTasks from '@/src/components/dashboard/TodayTasks';
import OverdueAlert from '@/src/components/dashboard/OverdueAlert';
import CategorySummary from '@/src/components/dashboard/CategorySummary';
import CompletionChart from '@/src/components/dashboard/CompletionChart';
import ViewSwitcher from '@/app/components/layout/ViewSwitcher';
import LoadingSkeleton from '@/src/components/common/LoadingSkeleton';
import EmptyState from '@/src/components/common/EmptyState';

export default function DashboardPage() {
  const router = useRouter();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('is_archived', false)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching tasks:', error);
    } else {
      setTasks(data || []);
    }
    setLoading(false);
  };

  const handleQuickAction = (action: string) => {
    if (action === 'add-task') {
      router.push('/?modal=add');
    } else if (action === 'calendar') {
      router.push('/calendar');
    } else if (action === 'urgent') {
      router.push('/?filter=urgent');
    } else if (action === 'report') {
      // 現在のページをリロード（レポート機能は今後実装）
      router.refresh();
    } else if (action.startsWith('search:')) {
      const query = action.replace('search:', '');
      router.push(`/?search=${encodeURIComponent(query)}`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen p-4 md:p-8 bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
        <div className="max-w-7xl mx-auto">
          <LoadingSkeleton type="dashboard" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 md:p-8 bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      <div className="max-w-7xl mx-auto">
        {/* ヘッダー */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4"
        >
          <div>
            <h1 className="text-3xl md:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600 mb-1">
              ダッシュボード
            </h1>
            <p className="text-neutral-600 font-semibold">
              {new Date().toLocaleDateString('ja-JP', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric', 
                weekday: 'long' 
              })}
            </p>
          </div>
          <ViewSwitcher />
        </motion.div>

        {/* Welcome Hero */}
        <WelcomeHero onQuickAction={handleQuickAction} />

        {/* 期限切れアラート */}
        <OverdueAlert tasks={tasks} />

        {/* Dashboard Stats */}
        <DashboardStats tasks={tasks} />

        {/* グリッドレイアウト */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          {/* 今日のタスク */}
          <TodayTasks tasks={tasks} />

          {/* 週間完了推移 */}
          <CompletionChart tasks={tasks} />
        </div>

        {/* 事業別サマリー */}
        <div className="mt-6">
          <CategorySummary tasks={tasks} />
        </div>

        {/* 最近のアクティビティ */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.8 }}
          className="mt-6 rounded-2xl p-6 bg-white/90 backdrop-blur-sm border border-white/50 shadow-lg"
        >
          <h3 className="text-xl font-bold text-neutral-900 mb-4 flex items-center gap-2">
            <span className="text-2xl">⚡</span>
            最近のタスク
          </h3>
          <div className="space-y-3">
            {tasks.slice(0, 5).map((task, index) => (
              <motion.div
                key={task.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.9 + index * 0.1 }}
                onClick={() => router.push(`/?task=${task.id}`)}
                className="flex items-center gap-4 p-4 rounded-xl bg-white border border-neutral-100 hover:border-purple-300 hover:shadow-lg transition-all cursor-pointer"
              >
                <div
                  className="w-1 h-12 rounded-full"
                  style={{
                    backgroundColor:
                      task.category === '個人' ? '#a855f7' :
                      task.business_type === '不動産' ? '#10B981' :
                      task.business_type === '人材' ? '#3B82F6' :
                      task.business_type === '結婚相談所' ? '#F43F5E' :
                      task.business_type === '経済圏' ? '#F59E0B' :
                      '#6B7280'
                  }}
                />
                <div className="flex-1">
                  <h4 className="font-bold text-neutral-900 mb-1">{task.title}</h4>
                  {task.description && (
                    <p className="text-sm text-neutral-600 truncate">{task.description}</p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`
                      px-3 py-1 rounded-lg text-xs font-bold
                      ${task.status === '完了' ? 'bg-green-100 text-green-700' :
                        task.status === '進行中' ? 'bg-blue-100 text-blue-700' :
                        'bg-neutral-100 text-neutral-700'}
                    `}
                  >
                    {task.status}
                  </span>
                  {task.priority && (
                    <span className="text-xl">
                      {task.priority === '今すぐやる' ? '🔥' :
                       task.priority === '今週やる' ? '⚡' :
                       task.priority === '今月やる' ? '📅' :
                       task.priority === '緊急' ? '🚨' :
                       task.priority === '高' ? '🔴' :
                       task.priority === '中' ? '🟡' :
                       '🟢'}
                    </span>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
