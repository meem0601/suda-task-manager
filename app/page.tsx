'use client';

import { useEffect, useState } from 'react';
import { supabase, Task, Subtask } from '@/lib/supabase';

export default function Home() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [completedTasks, setCompletedTasks] = useState<Task[]>([]);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [subtasks, setSubtasks] = useState<Subtask[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | '個人' | '事業'>('all');
  const [viewMode, setViewMode] = useState<'active' | 'completed'>('active');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    category: '個人' as '個人' | '事業',
    business_type: undefined as Task['business_type'],
    priority: undefined as Task['priority']
  });

  useEffect(() => {
    fetchTasks();
    fetchCompletedTasks();
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

  const fetchCompletedTasks = async () => {
    let query = supabase
      .from('tasks')
      .select('*')
      .eq('status', '完了')
      .order('completed_at', { ascending: false });

    if (filter !== 'all') {
      query = query.eq('category', filter);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching completed tasks:', error);
    } else {
      setCompletedTasks(data || []);
    }
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
        priority: undefined
      });
      fetchTasks();
    }
  };

  const handleCompleteTask = async (task: Task) => {
    const { error } = await supabase
      .from('tasks')
      .update({ status: '完了', completed_at: new Date().toISOString() })
      .eq('id', task.id);

    if (error) {
      console.error('Error completing task:', error);
      alert('タスクの完了に失敗しました');
    } else {
      setSelectedTask(null);
      fetchTasks();
      fetchCompletedTasks();
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
      fetchCompletedTasks();
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

  // グループ化: 優先度順
  const displayTasks = viewMode === 'active' ? tasks : completedTasks;
  const groupedTasks = {
    '🔥 今すぐやる': displayTasks.filter(t => t.priority === '今すぐやる'),
    '⚡ 今週やる': displayTasks.filter(t => t.priority === '今週やる'),
    '📅 今月やる': displayTasks.filter(t => t.priority === '今月やる'),
    '📋 その他': displayTasks.filter(t => !['今すぐやる', '今週やる', '今月やる'].includes(t.priority || ''))
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h1 className="text-2xl font-bold text-gray-900">📋 須田様専用タスク管理</h1>
              <div className="flex gap-2">
                <button
                  onClick={() => setViewMode('active')}
                  className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
                    viewMode === 'active'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-white text-gray-600 border border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  進行中 ({tasks.length})
                </button>
                <button
                  onClick={() => setViewMode('completed')}
                  className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
                    viewMode === 'completed'
                      ? 'bg-green-600 text-white'
                      : 'bg-white text-gray-600 border border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  完了済み ({completedTasks.length})
                </button>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setFilter('all')}
                  className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
                    filter === 'all'
                      ? 'bg-gray-700 text-white'
                      : 'bg-white text-gray-600 border border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  すべて
                </button>
                <button
                  onClick={() => setFilter('個人')}
                  className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
                    filter === '個人'
                      ? 'bg-green-600 text-white'
                      : 'bg-white text-gray-600 border border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  個人
                </button>
                <button
                  onClick={() => setFilter('事業')}
                  className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
                    filter === '事業'
                      ? 'bg-purple-600 text-white'
                      : 'bg-white text-gray-600 border border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  事業
                </button>
              </div>
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="px-5 py-2.5 bg-indigo-600 text-white rounded-md font-medium hover:bg-indigo-700 transition-all flex items-center gap-2 shadow-sm"
            >
              <span className="text-lg">+</span>
              タスク追加
            </button>
          </div>
        </div>
      </div>

      {/* メインコンテンツ */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600 mx-auto"></div>
          </div>
        ) : displayTasks.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <p className="text-gray-500">
              {viewMode === 'active' ? 'タスクがありません' : '完了したタスクはありません'}
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(groupedTasks).map(([groupName, groupTasks]) => {
              if (groupTasks.length === 0) return null;
              
              return (
                <div key={groupName} className="bg-white rounded-lg shadow-sm overflow-hidden">
                  <div className="bg-gray-50 px-6 py-3 border-b border-gray-200">
                    <h3 className="font-semibold text-gray-900">{groupName} ({groupTasks.length})</h3>
                  </div>
                  
                  {/* テーブルヘッダー */}
                  <div className="grid grid-cols-12 gap-4 px-6 py-3 bg-gray-50 border-b border-gray-200 text-xs font-medium text-gray-500 uppercase">
                    <div className="col-span-4">タスク名</div>
                    <div className="col-span-2">カテゴリ</div>
                    <div className="col-span-2">優先度</div>
                    <div className="col-span-2">ステータス</div>
                    <div className="col-span-2">操作</div>
                  </div>

                  {/* タスク一覧 */}
                  <div className="divide-y divide-gray-100">
                    {groupTasks.map((task) => (
                      <div
                        key={task.id}
                        className="grid grid-cols-12 gap-4 px-6 py-4 hover:bg-gray-50 transition-colors"
                      >
                        {/* タスク名 */}
                        <div 
                          className="col-span-4 flex items-center cursor-pointer"
                          onClick={() => setSelectedTask(task)}
                        >
                          <span className="font-medium text-gray-900 truncate">{task.title}</span>
                        </div>

                        {/* カテゴリ */}
                        <div className="col-span-2 flex items-center gap-2">
                          <select
                            value={task.category}
                            onChange={(e) => handleUpdateField(task.id, 'category', e.target.value)}
                            onClick={(e) => e.stopPropagation()}
                            className={`px-3 py-1 rounded-full text-xs font-medium cursor-pointer border-0 ${
                              task.category === '個人' ? 'bg-green-100 text-green-700' : 'bg-purple-100 text-purple-700'
                            }`}
                          >
                            <option value="個人">個人</option>
                            <option value="事業">事業</option>
                          </select>
                          {task.business_type && (
                            <span className="px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-600">
                              {task.business_type}
                            </span>
                          )}
                        </div>

                        {/* 優先度 */}
                        <div className="col-span-2 flex items-center">
                          <select
                            value={task.priority || ''}
                            onChange={(e) => handleUpdateField(task.id, 'priority', e.target.value || undefined)}
                            onClick={(e) => e.stopPropagation()}
                            className={`px-3 py-1 rounded-md text-xs font-medium cursor-pointer border-0 ${priorityColor(task.priority)}`}
                          >
                            <option value="">なし</option>
                            <option value="今すぐやる">今すぐやる</option>
                            <option value="今週やる">今週やる</option>
                            <option value="今月やる">今月やる</option>
                            <option value="高">高</option>
                            <option value="中">中</option>
                            <option value="低">低</option>
                          </select>
                        </div>

                        {/* ステータス */}
                        <div className="col-span-2 flex items-center">
                          <select
                            value={task.status}
                            onChange={(e) => handleUpdateField(task.id, 'status', e.target.value)}
                            onClick={(e) => e.stopPropagation()}
                            className={`px-3 py-1 rounded-md text-xs font-medium border ${statusColor(task.status)} cursor-pointer`}
                          >
                            <option value="未着手">未着手</option>
                            <option value="進行中">進行中</option>
                            <option value="完了">完了</option>
                          </select>
                        </div>

                        {/* 操作 */}
                        <div className="col-span-2 flex items-center gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedTask(task);
                            }}
                            className="text-gray-600 hover:text-gray-700 text-sm"
                            title="詳細"
                          >
                            📋 詳細
                          </button>
                          {viewMode === 'active' && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleCompleteTask(task);
                              }}
                              className="text-green-600 hover:text-green-700 text-lg"
                              title="完了"
                            >
                              ✓
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 詳細パネル（右スライドイン） */}
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
                      selectedTask.category === '個人' ? 'bg-green-100 text-green-700' : 'bg-purple-100 text-purple-700'
                    }`}
                  >
                    <option value="個人">個人</option>
                    <option value="事業">事業</option>
                  </select>

                  {selectedTask.category === '事業' && (
                    <select
                      value={selectedTask.business_type || ''}
                      onChange={(e) => handleUpdateField(selectedTask.id, 'business_type', e.target.value || undefined)}
                      className="px-3 py-1 rounded-full text-sm font-medium bg-indigo-100 text-indigo-700 cursor-pointer"
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
              {selectedTask.ai_suggestion && (
                <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded">
                  <p className="text-sm text-blue-900">
                    <span className="font-semibold">💡 最初の一歩:</span> {selectedTask.ai_suggestion}
                  </p>
                </div>
              )}

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

              {/* 完了ボタン */}
              {viewMode === 'active' && selectedTask.status !== '完了' && (
                <button
                  onClick={() => handleCompleteTask(selectedTask)}
                  className="w-full px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
                >
                  ✓ 完了にする
                </button>
              )}
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
