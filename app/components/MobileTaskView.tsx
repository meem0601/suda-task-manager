'use client';

import { Task } from '@/lib/supabase';

interface MobileTaskViewProps {
  tasks: Task[];
  filter: 'all' | '個人' | '事業';
  onFilterChange: (filter: 'all' | '個人' | '事業') => void;
  onSelectTask: (task: Task) => void;
  onUpdateStatus: (taskId: string, status: Task['status']) => void;
  onAddTask: () => void;
  onGenerateAI: () => void;
}

export default function MobileTaskView({
  tasks,
  filter,
  onFilterChange,
  onSelectTask,
  onUpdateStatus,
  onAddTask,
  onGenerateAI
}: MobileTaskViewProps) {
  const getBusinessColor = (businessType?: string) => {
    switch (businessType) {
      case '不動産': return '#00C875';
      case '人材': return '#0073EA';
      case '結婚相談所': return '#FF3D57';
      case 'コーポレート': return '#FDAB3D';
      default: return '#6C3CE1';
    }
  };

  const priorityColor = (priority?: string) => {
    switch (priority) {
      case '今すぐやる': return 'bg-red-500 text-white';
      case '今週やる': return 'bg-orange-500 text-white';
      case '今月やる': return 'bg-yellow-500 text-white';
      case '高': return 'bg-pink-500 text-white';
      case '中': return 'bg-blue-500 text-white';
      case '低': return 'bg-gray-400 text-white';
      default: return 'bg-gray-300 text-gray-700';
    }
  };

  const statusColor = (status: string) => {
    switch (status) {
      case '未着手': return 'bg-gray-100 text-gray-700';
      case '進行中': return 'bg-blue-100 text-blue-700';
      case '完了': return 'bg-green-100 text-green-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const isOverdue = (task: Task) => {
    if (!task.due_date || task.status === '完了') return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dueDate = new Date(task.due_date);
    dueDate.setHours(0, 0, 0, 0);
    return dueDate < today;
  };

  const isToday = (task: Task) => {
    if (!task.due_date) return false;
    const today = new Date();
    const dueDate = new Date(task.due_date);
    return today.toDateString() === dueDate.toDateString();
  };

  const groupedTasks = {
    '🔥 今すぐやる': tasks.filter(t => t.priority === '今すぐやる'),
    '⚡ 今週やる': tasks.filter(t => t.priority === '今週やる'),
    '📅 今月やる': tasks.filter(t => t.priority === '今月やる'),
    '📋 その他': tasks.filter(t => !['今すぐやる', '今週やる', '今月やる'].includes(t.priority || ''))
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー（固定） */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="px-4 py-3">
          <h1 className="text-xl font-bold text-gray-900 mb-3">📋 タスク管理</h1>
          
          {/* フィルター */}
          <div className="flex gap-2 mb-3">
            <button
              onClick={() => onFilterChange('all')}
              className={`px-3 py-1.5 rounded-md text-sm font-medium flex-1 ${
                filter === 'all' ? 'bg-gray-700 text-white' : 'bg-gray-200 text-gray-700'
              }`}
            >
              すべて
            </button>
            <button
              onClick={() => onFilterChange('個人')}
              className={`px-3 py-1.5 rounded-md text-sm font-medium flex-1 ${
                filter === '個人' ? 'bg-purple-600 text-white' : 'bg-gray-200 text-gray-700'
              }`}
            >
              個人
            </button>
            <button
              onClick={() => onFilterChange('事業')}
              className={`px-3 py-1.5 rounded-md text-sm font-medium flex-1 ${
                filter === '事業' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'
              }`}
            >
              事業
            </button>
          </div>

          {/* アクションボタン */}
          <div className="flex flex-col gap-2">
            <button
              onClick={onGenerateAI}
              className="w-full px-4 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-all flex items-center justify-center gap-2"
            >
              <span>✨</span>
              <span className="text-sm">AI提案を一括生成</span>
            </button>
            <button
              onClick={onAddTask}
              className="w-full px-4 py-2.5 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-all flex items-center justify-center gap-2"
            >
              <span>+</span>
              <span className="text-sm">タスク追加</span>
            </button>
          </div>
        </div>
      </div>

      {/* タスクリスト */}
      <div className="px-4 py-4 space-y-6">
        {Object.entries(groupedTasks).map(([groupName, groupTasks]) => {
          if (groupTasks.length === 0) return null;
          
          return (
            <div key={groupName}>
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-gray-900">{groupName}</h3>
                <span className="text-sm text-gray-500">{groupTasks.length}</span>
              </div>
              
              <div className="space-y-3">
                {groupTasks.map((task) => (
                  <div
                    key={task.id}
                    onClick={() => onSelectTask(task)}
                    className="bg-white rounded-lg p-4 shadow-sm border-l-4 active:bg-gray-50"
                    style={{ borderLeftColor: getBusinessColor(task.category === '個人' ? undefined : task.business_type) }}
                  >
                    {/* タスク名 */}
                    <h4 className={`font-medium mb-2 ${isOverdue(task) ? 'text-red-600' : 'text-gray-900'}`}>
                      {task.title}
                    </h4>

                    {/* バッジ群 */}
                    <div className="flex flex-wrap gap-2 mb-2">
                      {task.priority && (
                        <span className={`px-2 py-1 rounded text-xs font-medium ${priorityColor(task.priority)}`}>
                          {task.priority}
                        </span>
                      )}
                      
                      {task.category === '事業' && task.business_type && (
                        <span 
                          className="px-2 py-1 rounded text-xs font-medium text-white"
                          style={{ backgroundColor: getBusinessColor(task.business_type) }}
                        >
                          {task.business_type}
                        </span>
                      )}

                      <span className={`px-2 py-1 rounded text-xs font-medium ${statusColor(task.status)}`}>
                        {task.status}
                      </span>
                    </div>

                    {/* 期限 */}
                    {task.due_date && (
                      <div className={`text-xs ${
                        isOverdue(task) ? 'text-red-600 font-bold' : 
                        isToday(task) ? 'text-blue-600 font-medium' : 
                        'text-gray-500'
                      }`}>
                        📅 {new Date(task.due_date).toLocaleDateString('ja-JP')}
                        {isOverdue(task) && ' ⚠️ 期限切れ'}
                        {isToday(task) && ' 今日'}
                      </div>
                    )}

                    {/* AI提案プレビュー */}
                    {task.ai_suggestion && (
                      <div className="mt-2 text-xs text-blue-700 bg-blue-50 px-2 py-1 rounded">
                        💡 {task.ai_suggestion.substring(0, 50)}{task.ai_suggestion.length > 50 ? '...' : ''}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
        
        {tasks.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <p className="text-lg mb-2">📭</p>
            <p>タスクがありません</p>
          </div>
        )}
      </div>
    </div>
  );
}
