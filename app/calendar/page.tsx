'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Task } from '@/src/lib/types';
import {
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  format,
  isSameMonth,
  isToday,
  addMonths,
  subMonths,
  startOfWeek,
  endOfWeek,
} from 'date-fns';
import { ja } from 'date-fns/locale';
import ViewSwitcher from '../components/layout/ViewSwitcher';
import LoadingSkeleton from '@/src/components/common/LoadingSkeleton';
import EmptyState from '@/src/components/common/EmptyState';

export default function CalendarPage() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [dayTasks, setDayTasks] = useState<Task[]>([]);

  useEffect(() => {
    fetchTasks();
  }, [currentMonth]);

  const fetchTasks = async () => {
    setLoading(true);
    const start = format(startOfMonth(currentMonth), 'yyyy-MM-dd');
    const end = format(endOfMonth(currentMonth), 'yyyy-MM-dd');

    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .gte('due_date', start)
      .lte('due_date', end)
      .eq('is_archived', false);

    if (error) {
      console.error('Error fetching tasks:', error);
    } else {
      setTasks(data || []);
    }
    setLoading(false);
  };

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });
  const calendarDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  const getTasksForDay = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return tasks.filter((task) => task.due_date?.startsWith(dateStr));
  };

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

  const handleDayClick = (date: Date) => {
    setSelectedDate(date);
    setDayTasks(getTasksForDay(date));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-50 p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <div className="h-10 bg-neutral-200 rounded-lg w-64 mb-2 animate-pulse" />
            <div className="h-6 bg-neutral-200 rounded-lg w-32 animate-pulse" />
          </div>
          <LoadingSkeleton type="dashboard" />
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
              カレンダービュー
            </h1>
            <p className="text-neutral-600 font-semibold">
              {format(currentMonth, 'yyyy年M月', { locale: ja })}
            </p>
          </div>
          <ViewSwitcher />
        </div>

        {/* 月切り替え */}
        <div className="flex items-center justify-center gap-4 mb-6">
          <button
            onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
            className="btn btn-secondary"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h2 className="text-2xl font-bold text-neutral-900 min-w-[200px] text-center">
            {format(currentMonth, 'yyyy年M月', { locale: ja })}
          </h2>
          <button
            onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
            className="btn btn-secondary"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
          <button
            onClick={() => setCurrentMonth(new Date())}
            className="btn btn-primary"
          >
            今月
          </button>
        </div>

        {/* カレンダー */}
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl border-2 border-neutral-200 p-6">
          {/* 曜日ヘッダー */}
          <div className="grid grid-cols-7 gap-2 mb-2">
            {['日', '月', '火', '水', '木', '金', '土'].map((day, index) => (
              <div
                key={day}
                className={`text-center font-bold py-2 ${
                  index === 0 ? 'text-red-600' : index === 6 ? 'text-blue-600' : 'text-neutral-700'
                }`}
              >
                {day}
              </div>
            ))}
          </div>

          {/* 日付グリッド */}
          <div className="grid grid-cols-7 gap-2">
            {calendarDays.map((day) => {
              const dayTasks = getTasksForDay(day);
              const isCurrentMonth = isSameMonth(day, currentMonth);
              const isTodayDate = isToday(day);

              return (
                <div
                  key={day.toString()}
                  onClick={() => handleDayClick(day)}
                  className={`
                    min-h-[100px] p-2 rounded-xl cursor-pointer transition-all
                    ${!isCurrentMonth ? 'bg-neutral-100 opacity-50' : 'bg-white border border-neutral-200'}
                    ${isTodayDate ? 'border-2 border-purple-500 bg-purple-50' : ''}
                    hover:shadow-lg hover:scale-105
                  `}
                >
                  <div className={`text-sm font-bold mb-1 ${isTodayDate ? 'text-purple-600' : 'text-neutral-700'}`}>
                    {format(day, 'd')}
                  </div>
                  <div className="space-y-1">
                    {dayTasks.slice(0, 3).map((task) => (
                      <div
                        key={task.id}
                        className="flex items-center gap-1"
                        title={task.title}
                      >
                        <div
                          className="w-2 h-2 rounded-full flex-shrink-0"
                          style={{ backgroundColor: getBusinessColor(task.business_type) }}
                        />
                        <div className="text-xs truncate text-neutral-900 font-medium">
                          {task.title}
                        </div>
                      </div>
                    ))}
                    {dayTasks.length > 3 && (
                      <div className="text-xs text-neutral-500 font-semibold">
                        +{dayTasks.length - 3}件
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 選択日のタスク一覧モーダル */}
        {selectedDate && (
          <div
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedDate(null)}
          >
            <div
              className="bg-white rounded-2xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-start justify-between mb-4">
                <h2 className="text-2xl font-bold text-neutral-900">
                  {format(selectedDate, 'M月d日（E）', { locale: ja })}のタスク
                </h2>
                <button
                  onClick={() => setSelectedDate(null)}
                  className="btn-ghost p-2"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-3">
                {dayTasks.length === 0 ? (
                  <EmptyState type="calendar" showButton={false} />
                ) : (
                  dayTasks.map((task) => (
                    <div
                      key={task.id}
                      onClick={() => (window.location.href = `/?task=${task.id}`)}
                      className="card card-interactive p-4 cursor-pointer"
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className="w-1 h-12 rounded-full"
                          style={{ backgroundColor: getBusinessColor(task.business_type) }}
                        />
                        <div className="flex-1">
                          <h4 className="font-bold text-neutral-900 mb-1">{task.title}</h4>
                          {task.description && (
                            <p className="text-sm text-neutral-600 line-clamp-2">{task.description}</p>
                          )}
                          <div className="flex flex-wrap gap-2 mt-2">
                            <span
                              className={`
                                badge
                                ${
                                  task.status === '完了'
                                    ? 'badge-success'
                                    : task.status === '進行中'
                                    ? 'badge-primary'
                                    : 'badge-neutral'
                                }
                              `}
                            >
                              {task.status}
                            </span>
                            {task.business_type && (
                              <span
                                className="badge text-white font-semibold"
                                style={{ backgroundColor: getBusinessColor(task.business_type) }}
                              >
                                {task.business_type}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
