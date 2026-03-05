'use client';

import { useEffect, useState } from 'react';
import { supabase, Task, Subtask } from '@/lib/supabase';
import MondayTable from './components/MondayTable';
import MobileTaskView from './components/MobileTaskView';
import MobileTaskDetail from './components/MobileTaskDetail';
import { useMediaQuery } from './hooks/useMediaQuery';

type ViewMode = 'dashboard' | 'board' | 'table';

export default function Home() {
  const isMobile = useMediaQuery('(max-width: 768px)');
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [subtasks, setSubtasks] = useState<Subtask[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>('table');
  const [filter, setFilter] = useState<'all' | '個人' | '事業'>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  const [draggedTask, setDraggedTask] = useState<Task | null>(null);
  
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    category: '個人' as '個人' | '事業',
    business_type: undefined as Task['business_type'],
    priority: undefined as Task['priority'],
    due_date: undefined as string | undefined
  });

  useEffect(() => {
    fetchTasks();
  }, [filter]);

  useEffect(() => {
    if (selectedTask) {
      fetchSubtasks(selectedTask.id);
    }
  }, [selectedTask]);

  const fetchTasks = async () => {
    setLoading(true);
    let query = supabase
      .from('tasks')
      .select('*')
      .order('created_at', { ascending: false });

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

  const fetchSubtasks = async (taskId: string) => {
    const { data, error } = await supabase
      .from('subtasks')
      .select('*')
      .eq('task_id', taskId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching subtasks:', error);
    } else {
      setSubtasks(data || []);
    }
  };

  const handleAddTask = async () => {
    if (!newTask.title.trim()) {
      alert('タイトルを入力してください');
      return;
    }

    const { error } = await supabase
      .from('tasks')
      .insert([
        {
          ...newTask,
          status: '未着手',
          ai_priority_score: 50
        }
      ]);

    if (error) {
      console.error('Error adding task:', error);
      alert('タスクの追加に失敗しました');
    } else {
      setShowAddModal(false);
      setNewTask({
        title: '',
        description: '',
        category: '個人',
        business_type: undefined,
        priority: undefined,
        due_date: undefined
      });
      fetchTasks();
    }
  };

  const handleUpdateField = async (taskId: string, field: string, value: any) => {
    const updateData: any = { [field]: value };
    if (field === 'status' && value === '完了') {
      updateData.completed_at = new Date().toISOString();
    }

    const { error } = await supabase
      .from('tasks')
      .update(updateData)
      .eq('id', taskId);

    if (error) {
      console.error('Error updating field:', error);
    } else {
      fetchTasks();
      if (selectedTask?.id === taskId) {
        const updatedTask = { ...selectedTask, [field]: value };
        setSelectedTask(updatedTask);
      }
    }
  };

  const handleAddSubtask = async () => {
    if (!selectedTask || !newSubtaskTitle.trim()) return;

    const { error } = await supabase
      .from('subtasks')
      .insert([
        {
          task_id: selectedTask.id,
          title: newSubtaskTitle,
          completed: false
        }
      ]);

    if (error) {
      console.error('Error adding subtask:', error);
      alert('サブタスクの追加に失敗しました');
    } else {
      setNewSubtaskTitle('');
      fetchSubtasks(selectedTask.id);
    }
  };

  const handleToggleSubtask = async (subtask: Subtask) => {
    const { error } = await supabase
      .from('subtasks')
      .update({ 
        completed: !subtask.completed,
        completed_at: !subtask.completed ? new Date().toISOString() : null
      })
      .eq('id', subtask.id);

    if (error) {
      console.error('Error toggling subtask:', error);
    } else {
      if (selectedTask) {
        fetchSubtasks(selectedTask.id);
      }
    }
  };

  // 事業別カラーコーディング
  const getBusinessColor = (businessType?: string) => {
    switch (businessType) {
      case '不動産': return '#00C875';
      case '人材': return '#0073EA';
      case '結婚相談所': return '#FF3D57';
      case 'コーポレート': return '#FDAB3D';
      default: return '#6C3CE1'; // 個人
    }
  };

  const statusColor = (status: string) => {
    switch (status) {
      case '未着手': return 'bg-gray-100 text-gray-700 border-gray-300';
      case '進行中': return 'bg-blue-100 text-blue-700 border-blue-300';
      case '完了': return 'bg-green-100 text-green-700 border-green-300';
      default: return 'bg-gray-100 text-gray-700 border-gray-300';
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

  // 期限チェック（当日は期限切れにしない）
  const isOverdue = (task: Task) => {
    if (!task.due_date || task.status === '完了') return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0); // 今日の0:00
    const dueDate = new Date(task.due_date);
    dueDate.setHours(0, 0, 0, 0); // 期日の0:00
    return dueDate < today; // 期日 < 今日 なら期限切れ
  };

  const isToday = (task: Task) => {
    if (!task.due_date) return false;
    const today = new Date();
    const dueDate = new Date(task.due_date);
    return today.toDateString() === dueDate.toDateString();
  };

  // ダッシュボード用データ
  const todayTasks = tasks.filter(t => isToday(t) && t.status !== '完了');
  const overdueTasks = tasks.filter(t => isOverdue(t));
  const businessSummary = {
    '個人': tasks.filter(t => t.category === '個人').length,
    '不動産': tasks.filter(t => t.business_type === '不動産').length,
    '人材': tasks.filter(t => t.business_type === '人材').length,
    '結婚相談所': tasks.filter(t => t.business_type === '結婚相談所').length,
    'コーポレート': tasks.filter(t => t.business_type === 'コーポレート').length,
  };
  const completedCount = tasks.filter(t => t.status === '完了').length;
  const totalCount = tasks.length;

  // ボードビュー用のカラムデータ
  const boardColumns = {
    '未着手': tasks.filter(t => t.status === '未着手'),
    '進行中': tasks.filter(t => t.status === '進行中'),
    '完了': tasks.filter(t => t.status === '完了')
  };

  // Drag & Drop ハンドラー
  const handleDragStart = (task: Task) => {
    setDraggedTask(task);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (status: Task['status']) => {
    if (draggedTask) {
      handleUpdateField(draggedTask.id, 'status', status);
      setDraggedTask(null);
    }
  };

  // ダッシュボードビュー
  const renderDashboard = () => (
    <div className="space-y-6">
      {/* サマリーカード */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* 今日のタスク */}
        <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-blue-500">
          <h3 className="text-sm font-semibold text-gray-600 mb-2">📅 今日のタスク</h3>
          <p className="text-3xl font-bold text-gray-900">{todayTasks.length}</p>
          {todayTasks.length > 0 && (
            <div className="mt-4 space-y-2">
              {todayTasks.slice(0, 3).map(task => (
                <div key={task.id} className="text-sm text-gray-700 truncate">
                  • {task.title}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 期限切れアラート */}
        <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-red-500">
          <h3 className="text-sm font-semibold text-gray-600 mb-2">⚠️ 期限切れ</h3>
          <p className="text-3xl font-bold text-red-600">{overdueTasks.length}</p>
          {overdueTasks.length > 0 && (
            <div className="mt-4 space-y-2">
              {overdueTasks.slice(0, 3).map(task => (
                <div key={task.id} className="text-sm text-red-600 truncate">
                  • {task.title}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 進捗 */}
        <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-green-500">
          <h3 className="text-sm font-semibold text-gray-600 mb-2">✅ 完了率</h3>
          <p className="text-3xl font-bold text-gray-900">
            {totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0}%
          </p>
          <div className="mt-4">
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className="bg-green-500 h-3 rounded-full transition-all duration-300"
                style={{ width: `${totalCount > 0 ? (completedCount / totalCount) * 100 : 0}%` }}
              />
            </div>
            <p className="text-sm text-gray-600 mt-2">{completedCount} / {totalCount} タスク完了</p>
          </div>
        </div>
      </div>

      {/* 事業別サマリー */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">📊 事業別タスク数</h3>
        <div className="space-y-4">
          {Object.entries(businessSummary).map(([business, count]) => (
            <div key={business}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">{business}</span>
                <span className="text-sm font-bold text-gray-900">{count}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-4">
                <div 
                  className="h-4 rounded-full transition-all duration-300"
                  style={{ 
                    width: `${totalCount > 0 ? (count / totalCount) * 100 : 0}%`,
                    backgroundColor: getBusinessColor(business === '個人' ? undefined : business)
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 完了推移チャート（簡易版） */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">📈 ステータス別内訳</h3>
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">未着手</p>
            <p className="text-2xl font-bold text-gray-700">{boardColumns['未着手'].length}</p>
          </div>
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-600 mb-1">進行中</p>
            <p className="text-2xl font-bold text-blue-700">{boardColumns['進行中'].length}</p>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <p className="text-sm text-green-600 mb-1">完了</p>
            <p className="text-2xl font-bold text-green-700">{boardColumns['完了'].length}</p>
          </div>
        </div>
      </div>
    </div>
  );

  // ボードビュー（カンバン）
  const renderBoard = () => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {Object.entries(boardColumns).map(([status, tasks]) => (
        <div 
          key={status}
          className="bg-gray-50 rounded-lg p-4 min-h-[600px]"
          onDragOver={handleDragOver}
          onDrop={() => handleDrop(status as Task['status'])}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-gray-900">{status}</h3>
            <span className="px-2 py-1 bg-white rounded-full text-sm font-medium text-gray-600">
              {tasks.length}
            </span>
          </div>
          
          <div className="space-y-3">
            {tasks.map(task => (
              <div
                key={task.id}
                draggable
                onDragStart={() => handleDragStart(task)}
                onClick={() => setSelectedTask(task)}
                className="bg-white rounded-lg p-4 shadow-sm cursor-move hover:shadow-md transition-shadow border-l-4"
                style={{ borderLeftColor: getBusinessColor(task.category === '個人' ? undefined : task.business_type) }}
              >
                <h4 className="font-semibold text-gray-900 mb-2">{task.title}</h4>
                
                <div className="flex flex-wrap gap-2 mb-2">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${priorityColor(task.priority)}`}>
                    {task.priority || 'なし'}
                  </span>
                  {task.category === '事業' && task.business_type && (
                    <span 
                      className="px-2 py-1 rounded text-xs font-medium text-white"
                      style={{ backgroundColor: getBusinessColor(task.business_type) }}
                    >
                      {task.business_type}
                    </span>
                  )}
                </div>

                {task.due_date && (
                  <div className={`text-xs ${isOverdue(task) ? 'text-red-600 font-bold' : isToday(task) ? 'text-blue-600 font-medium' : 'text-gray-500'}`}>
                    📅 {new Date(task.due_date).toLocaleDateString('ja-JP')}
                    {isOverdue(task) && ' ⚠️ 期限切れ'}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );

  // リストビュー
  const renderList = () => {
    const groupedTasks = {
      '🔥 今すぐやる': tasks.filter(t => t.priority === '今すぐやる'),
      '⚡ 今週やる': tasks.filter(t => t.priority === '今週やる'),
      '📅 今月やる': tasks.filter(t => t.priority === '今月やる'),
      '📋 その他': tasks.filter(t => !['今すぐやる', '今週やる', '今月やる'].includes(t.priority || ''))
    };

    return (
      <div className="space-y-6">
        {Object.entries(groupedTasks).map(([groupName, groupTasks]) => {
          if (groupTasks.length === 0) return null;
          
          return (
            <div key={groupName} className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="bg-gray-50 px-6 py-3 border-b border-gray-200">
                <h3 className="font-semibold text-gray-900">{groupName} ({groupTasks.length})</h3>
              </div>
              
              <div className="divide-y divide-gray-100">
                {groupTasks.map((task) => (
                  <div
                    key={task.id}
                    className="grid grid-cols-12 gap-4 px-6 py-4 hover:bg-gray-50 transition-colors items-center"
                  >
                    {/* カラーインジケーター */}
                    <div className="col-span-1">
                      <div 
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: getBusinessColor(task.category === '個人' ? undefined : task.business_type) }}
                      />
                    </div>

                    {/* タスク名 */}
                    <div 
                      className="col-span-4 cursor-pointer"
                      onClick={() => setSelectedTask(task)}
                    >
                      <span className={`font-medium ${isOverdue(task) ? 'text-red-600' : 'text-gray-900'}`}>
                        {task.title}
                      </span>
                    </div>

                    {/* 期限 */}
                    <div className="col-span-2">
                      {task.due_date ? (
                        <span className={`text-sm ${isOverdue(task) ? 'text-red-600 font-bold' : isToday(task) ? 'text-blue-600 font-medium' : 'text-gray-600'}`}>
                          {new Date(task.due_date).toLocaleDateString('ja-JP')}
                          {isOverdue(task) && ' ⚠️'}
                        </span>
                      ) : (
                        <span className="text-sm text-gray-400">-</span>
                      )}
                    </div>

                    {/* カテゴリ/事業 */}
                    <div className="col-span-2">
                      {task.category === '事業' && task.business_type ? (
                        <span 
                          className="px-2 py-1 rounded text-xs font-medium text-white"
                          style={{ backgroundColor: getBusinessColor(task.business_type) }}
                        >
                          {task.business_type}
                        </span>
                      ) : (
                        <span className="px-2 py-1 rounded text-xs font-medium bg-purple-100 text-purple-700">
                          {task.category}
                        </span>
                      )}
                    </div>

                    {/* ステータス */}
                    <div className="col-span-2">
                      <select
                        value={task.status}
                        onChange={(e) => handleUpdateField(task.id, 'status', e.target.value)}
                        onClick={(e) => e.stopPropagation()}
                        className={`px-3 py-1 rounded-md text-xs font-medium border ${statusColor(task.status)} cursor-pointer w-full`}
                      >
                        <option value="未着手">未着手</option>
                        <option value="進行中">進行中</option>
                        <option value="完了">完了</option>
                      </select>
                    </div>

                    {/* 優先度 */}
                    <div className="col-span-1">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${priorityColor(task.priority)}`}>
                        {task.priority ? task.priority.substring(0, 2) : '-'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  // モバイル表示
  if (isMobile) {
    return (
      <>
        {selectedTask ? (
          <MobileTaskDetail
            task={selectedTask}
            subtasks={subtasks}
            onClose={() => setSelectedTask(null)}
            onUpdateField={handleUpdateField}
            onAddSubtask={handleAddSubtask}
            onToggleSubtask={handleToggleSubtask}
            onGenerateAI={async () => {
              try {
                const response = await fetch('/api/ai-suggestion', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ taskId: selectedTask.id })
                });
                const data = await response.json();
                if (data.success) {
                  setSelectedTask({ ...selectedTask, ai_suggestion: data.ai_suggestion });
                  fetchTasks();
                }
              } catch (error) {
                console.error('Error generating AI suggestion:', error);
                alert('AI提案の生成に失敗しました');
              }
            }}
          />
        ) : (
          <>
            <MobileTaskView
              tasks={tasks}
              filter={filter}
              onFilterChange={setFilter}
              onSelectTask={setSelectedTask}
              onUpdateStatus={(taskId, status) => handleUpdateField(taskId, 'status', status)}
              onAddTask={() => setShowAddModal(true)}
              onGenerateAI={async () => {
                if (!confirm('全タスクにAI提案を一括生成しますか？（AI提案がないタスクのみ対象）')) return;
                
                try {
                  const response = await fetch('/api/ai-suggestion', {
                    method: 'PUT'
                  });
                  const data = await response.json();
                  if (data.success) {
                    alert(`${data.count}個のタスクにAI提案を生成しました！`);
                    fetchTasks();
                  }
                } catch (error) {
                  console.error('Error batch generating AI suggestions:', error);
                  alert('AI提案の一括生成に失敗しました');
                }
              }}
            />
            
            {/* タスク追加モーダル（モバイル用） */}
            {showAddModal && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end z-50">
                <div className="bg-white rounded-t-xl w-full max-h-[90vh] overflow-y-auto p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">新しいタスクを追加</h2>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        タスク名 <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={newTask.title}
                        onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                        placeholder="例: 資料作成"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">期限</label>
                      <input
                        type="date"
                        value={newTask.due_date || ''}
                        onChange={(e) => setNewTask({ ...newTask, due_date: e.target.value || undefined })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">説明</label>
                      <textarea
                        value={newTask.description}
                        onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                        rows={3}
                        placeholder="詳細な説明（任意）"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">カテゴリ</label>
                      <div className="flex gap-4">
                        <label className="flex items-center cursor-pointer">
                          <input
                            type="radio"
                            checked={newTask.category === '個人'}
                            onChange={() => setNewTask({ ...newTask, category: '個人', business_type: undefined })}
                            className="mr-2"
                          />
                          <span>個人</span>
                        </label>
                        <label className="flex items-center cursor-pointer">
                          <input
                            type="radio"
                            checked={newTask.category === '事業'}
                            onChange={() => setNewTask({ ...newTask, category: '事業' })}
                            className="mr-2"
                          />
                          <span>事業</span>
                        </label>
                      </div>
                    </div>

                    {newTask.category === '事業' && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">事業種別</label>
                        <select
                          value={newTask.business_type || ''}
                          onChange={(e) => setNewTask({ ...newTask, business_type: e.target.value as Task['business_type'] })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                        >
                          <option value="">選択してください</option>
                          <option value="不動産">不動産</option>
                          <option value="人材">人材</option>
                          <option value="経済圏">経済圏</option>
                          <option value="結婚相談所">結婚相談所</option>
                          <option value="コーポレート">コーポレート</option>
                          <option value="その他">その他</option>
                        </select>
                      </div>
                    )}

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">優先度</label>
                      <select
                        value={newTask.priority || ''}
                        onChange={(e) => setNewTask({ ...newTask, priority: e.target.value as Task['priority'] })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                      >
                        <option value="">選択してください</option>
                        <option value="今すぐやる">今すぐやる</option>
                        <option value="今週やる">今週やる</option>
                        <option value="今月やる">今月やる</option>
                        <option value="高">高</option>
                        <option value="中">中</option>
                        <option value="低">低</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex flex-col gap-3 mt-6">
                    <button
                      onClick={handleAddTask}
                      className="w-full px-6 py-3 bg-indigo-600 text-white rounded-lg font-medium active:bg-indigo-700"
                    >
                      追加する
                    </button>
                    <button
                      onClick={() => setShowAddModal(false)}
                      className="w-full px-6 py-3 bg-gray-100 text-gray-700 rounded-lg font-medium active:bg-gray-200"
                    >
                      キャンセル
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </>
    );
  }

  // デスクトップ表示
  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <h1 className="text-2xl font-bold text-gray-900">📋 タスク管理</h1>
              
              {/* ビュー切替 */}
              <div className="flex gap-2 bg-gray-100 p-1 rounded-lg">
                <button
                  onClick={() => setViewMode('dashboard')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                    viewMode === 'dashboard'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  📊 ダッシュボード
                </button>
                <button
                  onClick={() => setViewMode('board')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                    viewMode === 'board'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  📌 ボード
                </button>
                <button
                  onClick={() => setViewMode('table')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                    viewMode === 'table'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  📋 テーブル
                </button>
              </div>

              {/* フィルター */}
              <div className="flex gap-2">
                <button
                  onClick={() => setFilter('all')}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium ${
                    filter === 'all' ? 'bg-gray-700 text-white' : 'bg-gray-200 text-gray-700'
                  }`}
                >
                  すべて
                </button>
                <button
                  onClick={() => setFilter('個人')}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium ${
                    filter === '個人' ? 'bg-purple-600 text-white' : 'bg-gray-200 text-gray-700'
                  }`}
                >
                  個人
                </button>
                <button
                  onClick={() => setFilter('事業')}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium ${
                    filter === '事業' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'
                  }`}
                >
                  事業
                </button>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={async () => {
                  if (!confirm('全タスクにAI提案を一括生成しますか？（AI提案がないタスクのみ対象）')) return;
                  
                  try {
                    const response = await fetch('/api/ai-suggestion', {
                      method: 'PUT'
                    });
                    const data = await response.json();
                    if (data.success) {
                      alert(`${data.count}個のタスクにAI提案を生成しました！`);
                      fetchTasks();
                    }
                  } catch (error) {
                    console.error('Error batch generating AI suggestions:', error);
                    alert('AI提案の一括生成に失敗しました');
                  }
                }}
                className="px-4 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-all flex items-center gap-2 shadow-sm"
              >
                <span className="text-lg">✨</span>
                AI提案を一括生成
              </button>
              <button
                onClick={() => setShowAddModal(true)}
                className="px-5 py-2.5 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-all flex items-center gap-2 shadow-sm"
              >
                <span className="text-lg">+</span>
                タスク追加
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* メインコンテンツ */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600 mx-auto"></div>
          </div>
        ) : (
          <>
            {viewMode === 'dashboard' && renderDashboard()}
            {viewMode === 'board' && renderBoard()}
            {viewMode === 'table' && (
              <MondayTable
                tasks={tasks}
                onUpdateTask={handleUpdateField}
                onSelectTask={setSelectedTask}
              />
            )}
          </>
        )}
      </div>

      {/* 詳細パネル */}
      {selectedTask && (
        <div className="fixed right-0 top-0 bottom-0 w-[500px] bg-white shadow-2xl z-50 overflow-y-auto">
          <div className="p-6">
            <div className="flex items-start justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">タスク詳細</h2>
              <button
                onClick={() => setSelectedTask(null)}
                className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
              >
                ×
              </button>
            </div>

            <div className="space-y-6">
              {/* タイトル */}
              <div>
                <input
                  type="text"
                  value={selectedTask.title}
                  onChange={(e) => setSelectedTask({ ...selectedTask, title: e.target.value })}
                  onBlur={() => handleUpdateField(selectedTask.id, 'title', selectedTask.title)}
                  className="text-xl font-bold text-gray-900 mb-4 w-full border-0 border-b-2 border-transparent hover:border-gray-300 focus:border-indigo-500 outline-none"
                />
                
                <div className="flex flex-wrap gap-2">
                  <select
                    value={selectedTask.category}
                    onChange={(e) => handleUpdateField(selectedTask.id, 'category', e.target.value)}
                    className={`px-3 py-1 rounded-full text-sm font-medium cursor-pointer ${
                      selectedTask.category === '個人' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
                    }`}
                  >
                    <option value="個人">個人</option>
                    <option value="事業">事業</option>
                  </select>

                  {selectedTask.category === '事業' && (
                    <select
                      value={selectedTask.business_type || ''}
                      onChange={(e) => handleUpdateField(selectedTask.id, 'business_type', e.target.value || undefined)}
                      className="px-3 py-1 rounded-full text-sm font-medium text-white cursor-pointer"
                      style={{ backgroundColor: getBusinessColor(selectedTask.business_type) }}
                    >
                      <option value="">事業種別</option>
                      <option value="不動産">不動産</option>
                      <option value="人材">人材</option>
                      <option value="経済圏">経済圏</option>
                      <option value="結婚相談所">結婚相談所</option>
                      <option value="コーポレート">コーポレート</option>
                      <option value="その他">その他</option>
                    </select>
                  )}

                  <select
                    value={selectedTask.priority || ''}
                    onChange={(e) => handleUpdateField(selectedTask.id, 'priority', e.target.value || undefined)}
                    className={`px-3 py-1 rounded-md text-sm font-medium cursor-pointer ${priorityColor(selectedTask.priority)}`}
                  >
                    <option value="">優先度なし</option>
                    <option value="今すぐやる">今すぐやる</option>
                    <option value="今週やる">今週やる</option>
                    <option value="今月やる">今月やる</option>
                    <option value="高">高</option>
                    <option value="中">中</option>
                    <option value="低">低</option>
                  </select>

                  <select
                    value={selectedTask.status}
                    onChange={(e) => handleUpdateField(selectedTask.id, 'status', e.target.value)}
                    className={`px-3 py-1 rounded-md text-sm font-medium border ${statusColor(selectedTask.status)} cursor-pointer`}
                  >
                    <option value="未着手">未着手</option>
                    <option value="進行中">進行中</option>
                    <option value="完了">完了</option>
                  </select>
                </div>
              </div>

              {/* 期限 */}
              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-2">期限</h4>
                <input
                  type="date"
                  value={selectedTask.due_date ? selectedTask.due_date.split('T')[0] : ''}
                  onChange={(e) => handleUpdateField(selectedTask.id, 'due_date', e.target.value || null)}
                  className={`w-full px-3 py-2 border rounded-lg ${
                    isOverdue(selectedTask) ? 'border-red-500 bg-red-50' : 'border-gray-300 bg-white'
                  }`}
                />
                {isOverdue(selectedTask) && (
                  <p className="text-xs text-red-600 mt-1">⚠️ 期限を過ぎています</p>
                )}
              </div>

              {/* 説明 */}
              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-2">説明</h4>
                <textarea
                  value={selectedTask.description || ''}
                  onChange={(e) => setSelectedTask({ ...selectedTask, description: e.target.value })}
                  onBlur={() => handleUpdateField(selectedTask.id, 'description', selectedTask.description)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-600 bg-gray-50"
                  rows={4}
                  placeholder="詳細な説明を入力..."
                />
              </div>

              {/* AI提案 */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-semibold text-gray-700">AI提案</h4>
                  <button
                    onClick={async () => {
                      try {
                        const response = await fetch('/api/ai-suggestion', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ taskId: selectedTask.id })
                        });
                        const data = await response.json();
                        if (data.success) {
                          setSelectedTask({ ...selectedTask, ai_suggestion: data.ai_suggestion });
                          fetchTasks();
                        }
                      } catch (error) {
                        console.error('Error generating AI suggestion:', error);
                        alert('AI提案の生成に失敗しました');
                      }
                    }}
                    className="text-xs px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all"
                  >
                    {selectedTask.ai_suggestion ? '再生成' : '✨ AI提案を生成'}
                  </button>
                </div>
                {selectedTask.ai_suggestion && (
                  <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded">
                    <p className="text-sm text-blue-900">
                      <span className="font-semibold">💡 最初の一歩:</span> {selectedTask.ai_suggestion}
                    </p>
                  </div>
                )}
              </div>

              {/* サブタスク */}
              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-3">サブタスク ({subtasks.length})</h4>
                <div className="space-y-2 mb-3">
                  {subtasks.map((subtask) => (
                    <label key={subtask.id} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded cursor-pointer">
                      <input
                        type="checkbox"
                        checked={subtask.completed}
                        onChange={() => handleToggleSubtask(subtask)}
                        className="w-5 h-5 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500"
                      />
                      <span className={`flex-1 text-sm ${subtask.completed ? 'line-through text-gray-400' : 'text-gray-700'}`}>
                        {subtask.title}
                      </span>
                    </label>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newSubtaskTitle}
                    onChange={(e) => setNewSubtaskTitle(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleAddSubtask()}
                    placeholder="サブタスクを追加..."
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  />
                  <button
                    onClick={handleAddSubtask}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm font-medium"
                  >
                    追加
                  </button>
                </div>
              </div>

              {/* 作成日 */}
              <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded">
                作成日: {new Date(selectedTask.created_at).toLocaleString('ja-JP')}
                {selectedTask.completed_at && (
                  <><br/>完了日: {new Date(selectedTask.completed_at).toLocaleString('ja-JP')}</>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* タスク追加モーダル */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">新しいタスクを追加</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  タスク名 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={newTask.title}
                  onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  placeholder="例: 資料作成"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">期限</label>
                <input
                  type="date"
                  value={newTask.due_date || ''}
                  onChange={(e) => setNewTask({ ...newTask, due_date: e.target.value || undefined })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">説明</label>
                <textarea
                  value={newTask.description}
                  onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  rows={3}
                  placeholder="詳細な説明（任意）"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">カテゴリ</label>
                <div className="flex gap-4">
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="radio"
                      checked={newTask.category === '個人'}
                      onChange={() => setNewTask({ ...newTask, category: '個人', business_type: undefined })}
                      className="mr-2"
                    />
                    <span>個人</span>
                  </label>
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="radio"
                      checked={newTask.category === '事業'}
                      onChange={() => setNewTask({ ...newTask, category: '事業' })}
                      className="mr-2"
                    />
                    <span>事業</span>
                  </label>
                </div>
              </div>

              {newTask.category === '事業' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">事業種別</label>
                  <select
                    value={newTask.business_type || ''}
                    onChange={(e) => setNewTask({ ...newTask, business_type: e.target.value as Task['business_type'] })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value="">選択してください</option>
                    <option value="不動産">不動産</option>
                    <option value="人材">人材</option>
                    <option value="経済圏">経済圏</option>
                    <option value="結婚相談所">結婚相談所</option>
                    <option value="コーポレート">コーポレート</option>
                    <option value="その他">その他</option>
                  </select>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">優先度</label>
                <select
                  value={newTask.priority || ''}
                  onChange={(e) => setNewTask({ ...newTask, priority: e.target.value as Task['priority'] })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="">選択してください</option>
                  <option value="今すぐやる">今すぐやる</option>
                  <option value="今週やる">今週やる</option>
                  <option value="今月やる">今月やる</option>
                  <option value="高">高</option>
                  <option value="中">中</option>
                  <option value="低">低</option>
                </select>
              </div>
            </div>

            <div className="flex gap-4 mt-6">
              <button
                onClick={() => setShowAddModal(false)}
                className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200"
              >
                キャンセル
              </button>
              <button
                onClick={handleAddTask}
                className="flex-1 px-6 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700"
              >
                追加する
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
