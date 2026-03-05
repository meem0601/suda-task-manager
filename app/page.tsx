'use client';

import { useEffect, useState } from 'react';
import { supabase, Task, Subtask } from '@/lib/supabase';
import NotificationPrompt from './components/NotificationPrompt';

export default function Home() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [subtasks, setSubtasks] = useState<Subtask[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | '個人' | '事業'>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  
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

  // ヘルパー関数
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
      case '未着手': return 'bg-gray-100 text-gray-700 border-gray-300';
      case '進行中': return 'bg-blue-100 text-blue-700 border-blue-300';
      case '完了': return 'bg-green-100 text-green-700 border-green-300';
      default: return 'bg-gray-100 text-gray-700 border-gray-300';
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

  // グループ化
  const groupedTasks = {
    '🔥 今すぐやる': tasks.filter(t => t.priority === '今すぐやる'),
    '⚡ 今週やる': tasks.filter(t => t.priority === '今週やる'),
    '📅 今月やる': tasks.filter(t => t.priority === '今月やる'),
    '📋 その他': tasks.filter(t => !['今すぐやる', '今週やる', '今月やる'].includes(t.priority || ''))
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 通知許可プロンプト */}
      <NotificationPrompt />
      
      {/* ヘッダー（固定） */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="px-4 py-3">
          <h1 className="text-2xl font-bold text-gray-900 mb-3 flex items-center gap-2">
            <span className="emoji">📋</span>
            <span>タスク管理</span>
          </h1>
          
          {/* フィルター */}
          <div className="flex gap-3 mb-3">
            <button
              onClick={() => setFilter('all')}
              className={`btn-filter flex-1 ${
                filter === 'all' ? 'btn-filter-active' : 'btn-filter-inactive'
              }`}
            >
              すべて
            </button>
            <button
              onClick={() => setFilter('個人')}
              className={`btn-filter flex-1 ${
                filter === '個人' ? 'btn-filter-active' : 'btn-filter-inactive'
              }`}
            >
              個人
            </button>
            <button
              onClick={() => setFilter('事業')}
              className={`btn-filter flex-1 ${
                filter === '事業' ? 'btn-filter-active' : 'btn-filter-inactive'
              }`}
            >
              事業
            </button>
          </div>

          {/* アクションボタン */}
          <div className="flex flex-col gap-2">
            <button
              onClick={async () => {
                if (!confirm('全タスクにAI提案を一括生成しますか？')) return;
                
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
              className="btn-primary w-full flex items-center justify-center gap-2 bg-blue-600 active:bg-blue-700"
            >
              <span className="emoji">✨</span>
              <span className="text-sm">AI提案を一括生成</span>
            </button>
            <button
              onClick={() => setShowAddModal(true)}
              className="btn-primary w-full flex items-center justify-center gap-2"
            >
              <span className="emoji">+</span>
              <span className="text-sm">タスク追加</span>
            </button>
          </div>
        </div>
      </div>

      {/* タスクリスト */}
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
        </div>
      ) : (
        <div className="px-4 py-4 space-y-6 pb-20">
          {Object.entries(groupedTasks).map(([groupName, groupTasks]) => {
            if (groupTasks.length === 0) return null;
            
            return (
              <div key={groupName}>
                <div className="task-group-header">
                  <h3 className="task-group-title">{groupName}</h3>
                  <span className="task-group-count">{groupTasks.length}</span>
                </div>
                
                <div className="space-y-3">
                  {groupTasks.map((task) => (
                    <div
                      key={task.id}
                      onClick={() => setSelectedTask(task)}
                      className="task-card"
                      style={{ borderLeftColor: getBusinessColor(task.category === '個人' ? undefined : task.business_type) }}
                    >
                      {/* タスク名 */}
                      <h4 className={`task-title ${isOverdue(task) ? 'task-title-overdue' : 'text-gray-900'}`}>
                        {task.title}
                      </h4>

                      {/* バッジ群 */}
                      <div className="badge-container">
                        {task.priority && (
                          <span className={`status-badge ${priorityColor(task.priority)}`}>
                            {task.priority}
                          </span>
                        )}
                        
                        {task.category === '事業' && task.business_type && (
                          <span 
                            className="status-badge text-white"
                            style={{ backgroundColor: getBusinessColor(task.business_type) }}
                          >
                            {task.business_type}
                          </span>
                        )}

                        <span className={`status-badge ${statusColor(task.status)}`}>
                          {task.status}
                        </span>
                      </div>

                      {/* 期限 */}
                      {task.due_date && (
                        <div className={`text-xs flex items-center gap-1 ${
                          isOverdue(task) ? 'text-red-600 font-bold' : 
                          isToday(task) ? 'text-blue-600 font-medium' : 
                          'text-gray-500'
                        }`}>
                          <span className="emoji-sm">📅</span> 
                          <span>{new Date(task.due_date).toLocaleDateString('ja-JP')}</span>
                          {isOverdue(task) && <span> ⚠️ 期限切れ</span>}
                          {isToday(task) && <span> 今日</span>}
                        </div>
                      )}

                      {/* AI提案プレビュー */}
                      {task.ai_suggestion && (
                        <div className="mt-2 text-xs text-blue-700 bg-blue-50 px-2 py-1 rounded flex items-start gap-1">
                          <span className="emoji-sm">💡</span>
                          <span>{task.ai_suggestion.substring(0, 50)}{task.ai_suggestion.length > 50 ? '...' : ''}</span>
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
      )}

      {/* タスク詳細パネル（全画面） */}
      {selectedTask && (
        <div className="detail-panel">
          {/* ヘッダー */}
          <div className="header-sticky px-4 py-3">
            <div className="flex items-center justify-between">
              <button
                onClick={() => setSelectedTask(null)}
                className="text-[var(--primary)] font-medium text-lg touch-target flex items-center gap-1"
              >
                <span className="emoji">←</span>
                <span>戻る</span>
              </button>
              <h2 className="text-xl font-semibold text-gray-900">詳細</h2>
              <div className="w-12" />
            </div>
          </div>

          {/* コンテンツ */}
          <div className="p-4 space-y-6">
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
                  className={`px-3 py-1.5 rounded-full text-sm font-medium cursor-pointer ${
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
                    className="px-3 py-1.5 rounded-full text-sm font-medium text-white cursor-pointer"
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
              </div>
            </div>

            {/* 優先度・ステータス */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">優先度</label>
                <select
                  value={selectedTask.priority || ''}
                  onChange={(e) => handleUpdateField(selectedTask.id, 'priority', e.target.value || undefined)}
                  className={`w-full px-4 py-3 min-h-[48px] rounded-md text-sm font-medium cursor-pointer transition-all ${priorityColor(selectedTask.priority)}`}
                >
                  <option value="">優先度なし</option>
                  <option value="今すぐやる">今すぐやる</option>
                  <option value="今週やる">今週やる</option>
                  <option value="今月やる">今月やる</option>
                  <option value="高">高</option>
                  <option value="中">中</option>
                  <option value="低">低</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">ステータス</label>
                <select
                  value={selectedTask.status}
                  onChange={(e) => handleUpdateField(selectedTask.id, 'status', e.target.value)}
                  className={`w-full px-4 py-3 min-h-[48px] rounded-md text-sm font-medium border transition-all ${statusColor(selectedTask.status)} cursor-pointer`}
                >
                  <option value="未着手">未着手</option>
                  <option value="進行中">進行中</option>
                  <option value="完了">完了</option>
                </select>
              </div>
            </div>

            {/* 期限 */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">期限</label>
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
              <label className="block text-sm font-semibold text-gray-700 mb-2">説明</label>
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
                <label className="text-sm font-semibold text-gray-700">AI提案</label>
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
                  className="text-sm px-4 py-2.5 min-h-[44px] bg-blue-600 text-white rounded-lg font-medium transition-all duration-150 active:scale-95 active:bg-blue-700 flex items-center gap-2"
                >
                  <span className="emoji-sm">✨</span>
                  <span>{selectedTask.ai_suggestion ? '再生成' : 'AI提案を生成'}</span>
                </button>
              </div>
              {selectedTask.ai_suggestion && (
                <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded">
                  <p className="text-sm text-blue-900 flex items-start gap-2">
                    <span className="emoji-sm">💡</span>
                    <span><span className="font-semibold">最初の一歩:</span> {selectedTask.ai_suggestion}</span>
                  </p>
                </div>
              )}
            </div>

            {/* サブタスク */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                サブタスク ({subtasks.length})
              </label>
              <div className="space-y-2 mb-3">
                {subtasks.map((subtask) => (
                  <label key={subtask.id} className="interactive-label">
                    <input
                      type="checkbox"
                      checked={subtask.completed}
                      onChange={() => handleToggleSubtask(subtask)}
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
                  className="flex-1 px-3 py-2 min-h-[44px] border border-gray-300 rounded-lg text-sm"
                />
                <button
                  onClick={handleAddSubtask}
                  className="px-4 py-2 min-h-[44px] bg-indigo-600 text-white rounded-lg active:bg-indigo-700 text-sm font-medium transition-all duration-150 active:scale-95"
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
      )}

      {/* タスク追加モーダル */}
      {showAddModal && (
        <div className="modal-backdrop flex items-end">
          <div className="modal-content">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">新しいタスクを追加</h2>
            
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
                className="btn-primary w-full"
              >
                追加する
              </button>
              <button
                onClick={() => setShowAddModal(false)}
                className="btn-secondary w-full"
              >
                キャンセル
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
