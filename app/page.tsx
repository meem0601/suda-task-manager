'use client';

import { useEffect, useState } from 'react';
import { supabase, Task } from '@/lib/supabase';

export default function Home() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | '個人' | '事業'>('all');

  useEffect(() => {
    fetchTasks();
  }, [filter]);

  const fetchTasks = async () => {
    setLoading(true);
    let query = supabase
      .from('tasks')
      .select('*')
      .neq('status', '完了')
      .order('ai_priority_score', { ascending: false });

    if (filter !== 'all') {
      query = query.eq('category', filter);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching tasks:', error);
    } else {
      setTasks(data || []);
    }
    setLoading(false);
  };

  const priorityColor = (priority?: string) => {
    switch (priority) {
      case '今すぐやる': return 'bg-red-100 text-red-800 border-red-300';
      case '今週やる': return 'bg-orange-100 text-orange-800 border-orange-300';
      case '今月やる': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case '高': return 'bg-pink-100 text-pink-800 border-pink-300';
      case '中': return 'bg-blue-100 text-blue-800 border-blue-300';
      case '低': return 'bg-gray-100 text-gray-800 border-gray-300';
      default: return 'bg-gray-100 text-gray-600 border-gray-300';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-6xl mx-auto">
        {/* ヘッダー */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            📋 須田様専用タスク管理
          </h1>
          <p className="text-gray-600">AIがサポートする、あなただけのタスク管理システム</p>
        </div>

        {/* フィルター */}
        <div className="flex gap-4 mb-6">
          <button
            onClick={() => setFilter('all')}
            className={`px-6 py-2 rounded-lg font-medium transition-all ${
              filter === 'all'
                ? 'bg-indigo-600 text-white shadow-lg'
                : 'bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            すべて
          </button>
          <button
            onClick={() => setFilter('個人')}
            className={`px-6 py-2 rounded-lg font-medium transition-all ${
              filter === '個人'
                ? 'bg-green-600 text-white shadow-lg'
                : 'bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            個人タスク
          </button>
          <button
            onClick={() => setFilter('事業')}
            className={`px-6 py-2 rounded-lg font-medium transition-all ${
              filter === '事業'
                ? 'bg-purple-600 text-white shadow-lg'
                : 'bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            事業タスク
          </button>
        </div>

        {/* タスクリスト */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">読み込み中...</p>
          </div>
        ) : tasks.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <p className="text-gray-500 text-lg">タスクがありません</p>
            <p className="text-gray-400 mt-2">Slackで話すと自動的に追加されます✨</p>
          </div>
        ) : (
          <div className="space-y-4">
            {tasks.map((task) => (
              <div
                key={task.id}
                className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        task.category === '個人' ? 'bg-green-100 text-green-800' : 'bg-purple-100 text-purple-800'
                      }`}>
                        {task.category}
                      </span>
                      {task.business_type && (
                        <span className="px-3 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                          {task.business_type}
                        </span>
                      )}
                      {task.priority && (
                        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${priorityColor(task.priority)}`}>
                          {task.priority}
                        </span>
                      )}
                      <span className="text-xs text-gray-400">
                        AIスコア: {task.ai_priority_score || 50}
                      </span>
                    </div>
                    <h3 className="text-xl font-bold text-gray-800 mb-2">{task.title}</h3>
                    {task.description && (
                      <p className="text-gray-600 mb-3">{task.description}</p>
                    )}
                    {task.ai_suggestion && (
                      <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded">
                        <p className="text-sm text-blue-900">
                          <span className="font-semibold">💡 最初の一歩:</span> {task.ai_suggestion}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
