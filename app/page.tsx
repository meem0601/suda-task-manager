'use client';

import { useEffect, useState } from 'react';
import { supabase, Task } from '@/lib/supabase';

export default function Home() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | '個人' | '事業'>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    category: '個人' as '個人' | '事業',
    business_type: undefined as Task['business_type'],
    priority: undefined as Task['priority']
  });

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
    }
  };

  const handleUpdateStatus = async (task: Task, newStatus: Task['status']) => {
    const { error } = await supabase
      .from('tasks')
      .update({ status: newStatus })
      .eq('id', task.id);

    if (error) {
      console.error('Error updating status:', error);
    } else {
      fetchTasks();
    }
  };

  const handleUpdateTask = async () => {
    if (!editingTask) return;

    const { error } = await supabase
      .from('tasks')
      .update({
        title: editingTask.title,
        description: editingTask.description,
        category: editingTask.category,
        business_type: editingTask.business_type,
        priority: editingTask.priority
      })
      .eq('id', editingTask.id);

    if (error) {
      console.error('Error updating task:', error);
      alert('タスクの更新に失敗しました');
    } else {
      setEditingTask(null);
      setSelectedTask(editingTask);
      fetchTasks();
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
  const groupedTasks = {
    '🔥 今すぐやる': tasks.filter(t => t.priority === '今すぐやる'),
    '⚡ 今週やる': tasks.filter(t => t.priority === '今週やる'),
    '📅 今月やる': tasks.filter(t => t.priority === '今月やる'),
    '📋 その他': tasks.filter(t => !['今すぐやる', '今週やる', '今月やる'].includes(t.priority || ''))
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
                  onClick={() => setFilter('all')}
                  className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
                    filter === 'all'
                      ? 'bg-indigo-600 text-white'
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
        ) : tasks.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <p className="text-gray-500">タスクがありません</p>
            <p className="text-gray-400 text-sm mt-2">「タスク追加」ボタンから追加してください</p>
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
                    <div className="col-span-5">タスク名</div>
                    <div className="col-span-2">カテゴリ</div>
                    <div className="col-span-2">優先度</div>
                    <div className="col-span-2">ステータス</div>
                    <div className="col-span-1">操作</div>
                  </div>

                  {/* タスク一覧 */}
                  <div className="divide-y divide-gray-100">
                    {groupTasks.map((task) => (
                      <div
                        key={task.id}
                        className="grid grid-cols-12 gap-4 px-6 py-4 hover:bg-gray-50 transition-colors cursor-pointer"
                        onClick={() => setSelectedTask(task)}
                      >
                        {/* タスク名 */}
                        <div className="col-span-5 flex items-center">
                          <span className="font-medium text-gray-900 truncate">{task.title}</span>
                        </div>

                        {/* カテゴリ */}
                        <div className="col-span-2 flex items-center gap-2">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            task.category === '個人' ? 'bg-green-100 text-green-700' : 'bg-purple-100 text-purple-700'
                          }`}>
                            {task.category}
                          </span>
                          {task.business_type && (
                            <span className="px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-600">
                              {task.business_type}
                            </span>
                          )}
                        </div>

                        {/* 優先度 */}
                        <div className="col-span-2 flex items-center">
                          {task.priority && (
                            <span className={`px-3 py-1 rounded-md text-xs font-medium ${priorityColor(task.priority)}`}>
                              {task.priority}
                            </span>
                          )}
                        </div>

                        {/* ステータス */}
                        <div className="col-span-2 flex items-center">
                          <select
                            value={task.status}
                            onChange={(e) => {
                              e.stopPropagation();
                              handleUpdateStatus(task, e.target.value as Task['status']);
                            }}
                            className={`px-3 py-1 rounded-md text-xs font-medium border ${statusColor(task.status)} cursor-pointer`}
                          >
                            <option value="未着手">未着手</option>
                            <option value="進行中">進行中</option>
                            <option value="完了">完了</option>
                          </select>
                        </div>

                        {/* 操作 */}
                        <div className="col-span-1 flex items-center justify-end gap-2">
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
        <>
          <div 
            className="fixed inset-0 bg-black bg-opacity-30 z-40"
            onClick={() => setSelectedTask(null)}
          />
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

              {editingTask?.id === selectedTask.id ? (
                // 編集モード
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">タイトル</label>
                    <input
                      type="text"
                      value={editingTask.title}
                      onChange={(e) => setEditingTask({ ...editingTask, title: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">説明</label>
                    <textarea
                      value={editingTask.description || ''}
                      onChange={(e) => setEditingTask({ ...editingTask, description: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      rows={6}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">優先度</label>
                    <select
                      value={editingTask.priority || ''}
                      onChange={(e) => setEditingTask({ ...editingTask, priority: e.target.value as Task['priority'] })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
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

                  <div className="flex gap-2 pt-4">
                    <button
                      onClick={() => setEditingTask(null)}
                      className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                    >
                      キャンセル
                    </button>
                    <button
                      onClick={handleUpdateTask}
                      className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                    >
                      保存
                    </button>
                  </div>
                </div>
              ) : (
                // 表示モード
                <div className="space-y-6">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-4">{selectedTask.title}</h3>
                    <div className="flex flex-wrap gap-2">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        selectedTask.category === '個人' ? 'bg-green-100 text-green-700' : 'bg-purple-100 text-purple-700'
                      }`}>
                        {selectedTask.category}
                      </span>
                      {selectedTask.business_type && (
                        <span className="px-3 py-1 rounded-full text-sm font-medium bg-indigo-100 text-indigo-700">
                          {selectedTask.business_type}
                        </span>
                      )}
                      {selectedTask.priority && (
                        <span className={`px-3 py-1 rounded-md text-sm font-medium ${priorityColor(selectedTask.priority)}`}>
                          {selectedTask.priority}
                        </span>
                      )}
                      <span className={`px-3 py-1 rounded-md text-sm font-medium border ${statusColor(selectedTask.status)}`}>
                        {selectedTask.status}
                      </span>
                    </div>
                  </div>

                  {selectedTask.description && (
                    <div>
                      <h4 className="text-sm font-semibold text-gray-700 mb-2">説明</h4>
                      <p className="text-gray-600 whitespace-pre-wrap bg-gray-50 p-4 rounded-lg">{selectedTask.description}</p>
                    </div>
                  )}

                  {selectedTask.ai_suggestion && (
                    <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded">
                      <p className="text-sm text-blue-900">
                        <span className="font-semibold">💡 AI提案:</span> {selectedTask.ai_suggestion}
                      </p>
                    </div>
                  )}

                  <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded">
                    作成日: {new Date(selectedTask.created_at).toLocaleString('ja-JP')}
                  </div>

                  <div className="flex gap-2 pt-4 border-t border-gray-200">
                    <button
                      onClick={() => setEditingTask(selectedTask)}
                      className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium"
                    >
                      ✏️ 編集
                    </button>
                    <button
                      onClick={() => handleCompleteTask(selectedTask)}
                      className="flex-1 px-4 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
                    >
                      ✓ 完了
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </>
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
