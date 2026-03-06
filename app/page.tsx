'use client';

import { useEffect, useState } from 'react';
import { supabase, Task, Subtask } from '@/lib/supabase';
import { validateTask, validateSubtaskTitle } from '@/lib/validation';

export default function Home() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [subtasks, setSubtasks] = useState<Subtask[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | '個人' | '事業'>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  
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
      .order('created_at', { ascending: true});

    if (error) {
      console.error('Error fetching subtasks:', error);
    } else {
      setSubtasks(data || []);
    }
  };

  const handleAddTask = async () => {
    const validation = validateTask(newTask);
    if (!validation.valid) {
      alert(validation.error);
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

  const handleDeleteTask = async (taskId: string) => {
    if (!confirm('このタスクを削除しますか？')) {
      return;
    }

    const { error: subtaskError } = await supabase
      .from('subtasks')
      .delete()
      .eq('task_id', taskId);

    if (subtaskError) {
      console.error('Error deleting subtasks:', subtaskError);
      return;
    }

    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', taskId);

    if (error) {
      console.error('Error deleting task:', error);
    } else {
      setSelectedTask(null);
      fetchTasks();
    }
  };

  // Monday.com風のカラーパレット
  const getBusinessColor = (businessType?: string) => {
    switch (businessType) {
      case '不動産': return '#00C875';
      case '人材': return '#0073EA';
      case '結婚相談所': return '#FF3D57';
      case 'コーポレート': return '#FDAB3D';
      case '経済圏': return '#9CD326';
      default: return '#6C3CE1';
    }
  };

  const statusColor = (status: string) => {
    switch (status) {
      case '未着手': return { bg: '#C4C4C4', text: '#ffffff' };
      case '進行中': return { bg: '#0073EA', text: '#ffffff' };
      case '完了': return { bg: '#00C875', text: '#ffffff' };
      default: return { bg: '#C4C4C4', text: '#ffffff' };
    }
  };

  const priorityEmoji = (priority?: string) => {
    switch (priority) {
      case '今すぐやる': return '🔥';
      case '今週やる': return '⚡';
      case '今月やる': return '📅';
      case '高': return '🔴';
      case '中': return '🟡';
      case '低': return '🟢';
      default: return '⚪';
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

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    const month = date.getMonth() + 1;
    const day = date.getDate();
    return `${month}/${day}`;
  };

  // グループ化
  const groupedTasks = {
    '🔥 今すぐやる': tasks.filter(t => t.priority === '今すぐやる' && t.status !== '完了'),
    '⚡ 今週やる': tasks.filter(t => t.priority === '今週やる' && t.status !== '完了'),
    '📅 今月やる': tasks.filter(t => t.priority === '今月やる' && t.status !== '完了'),
    '📋 その他': tasks.filter(t => !['今すぐやる', '今週やる', '今月やる'].includes(t.priority || '') && t.status !== '完了'),
    '✅ 完了': tasks.filter(t => t.status === '完了')
  };

  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set());

  const toggleGroup = (groupName: string) => {
    setCollapsedGroups(prev => {
      const newSet = new Set(prev);
      if (newSet.has(groupName)) {
        newSet.delete(groupName);
      } else {
        newSet.add(groupName);
      }
      return newSet;
    });
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* 左サイドバー（Monday.com風） - デスクトップのみ */}
      {sidebarOpen && (
        <div className="hidden md:flex w-64 bg-white border-r border-gray-200 flex-col">
          {/* ロゴ */}
          <div className="p-4 border-b border-gray-200">
            <h1 className="text-xl font-bold text-gray-900">タスク管理</h1>
          </div>

          {/* ナビゲーション */}
          <div className="flex-1 p-4 space-y-2">
            <button
              onClick={() => setFilter('all')}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === 'all' ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              📋 すべてのタスク
            </button>
            <button
              onClick={() => setFilter('個人')}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === '個人' ? 'bg-purple-50 text-purple-600' : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              👤 個人タスク
            </button>
            <button
              onClick={() => setFilter('事業')}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === '事業' ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              🏢 事業タスク
            </button>
          </div>

          {/* フッター */}
          <div className="p-4 border-t border-gray-200">
            <div className="text-xs text-gray-500">
              {tasks.length}個のタスク
            </div>
          </div>
        </div>
      )}

      {/* メインコンテンツ */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* 上部ツールバー（Monday.com風） */}
        <div className="bg-white border-b border-gray-200 px-4 md:px-6 py-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2 md:gap-4">
              {/* サイドバー開閉（PCのみ） */}
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="hidden md:block text-gray-500 hover:text-gray-700"
              >
                ☰
              </button>
              <h2 className="text-lg md:text-xl font-semibold text-gray-900">
                {filter === 'all' ? 'すべてのタスク' : filter === '個人' ? '個人タスク' : '事業タスク'}
              </h2>
            </div>

            {/* モバイル用フィルタ */}
            <div className="flex md:hidden gap-1">
              <button
                onClick={() => setFilter('all')}
                className={`px-3 py-1 rounded text-xs font-medium ${
                  filter === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'
                }`}
              >
                すべて
              </button>
              <button
                onClick={() => setFilter('個人')}
                className={`px-3 py-1 rounded text-xs font-medium ${
                  filter === '個人' ? 'bg-purple-600 text-white' : 'bg-gray-200 text-gray-700'
                }`}
              >
                個人
              </button>
              <button
                onClick={() => setFilter('事業')}
                className={`px-3 py-1 rounded text-xs font-medium ${
                  filter === '事業' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'
                }`}
              >
                事業
              </button>
            </div>

            <button
              onClick={() => setShowAddModal(true)}
              className="px-3 md:px-4 py-2 bg-blue-600 text-white rounded-lg text-xs md:text-sm font-medium hover:bg-blue-700 transition-colors"
            >
              + タスク追加
            </button>
          </div>
        </div>

        {/* テーブルビュー（PCのみ） */}
        <div className="hidden md:flex flex-1 overflow-auto">
          {loading ? (
            <div className="flex items-center justify-center h-full w-full">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <div className="bg-white overflow-x-auto w-full">
              {/* テーブルヘッダー */}
              <div className="grid grid-cols-12 gap-4 px-6 py-3 bg-[#F6F7FB] border-b border-gray-200 font-semibold text-xs text-gray-600 uppercase tracking-wider sticky top-0 z-10">
                <div className="col-span-5">タスク</div>
                <div className="col-span-2 text-center">期限</div>
                <div className="col-span-2 text-center">カテゴリ</div>
                <div className="col-span-2 text-center">ステータス</div>
                <div className="col-span-1 text-center">優先度</div>
              </div>

              {/* グループごとのテーブル */}
              {Object.entries(groupedTasks).map(([groupName, groupTasks]) => {
                if (groupTasks.length === 0) return null;
                const isCollapsed = collapsedGroups.has(groupName);

                return (
                  <div key={groupName} className="border-b border-gray-200">
                    {/* グループヘッダー */}
                    <div
                      className="px-6 py-3 bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors flex items-center justify-between"
                      onClick={() => toggleGroup(groupName)}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-gray-400 transition-transform" style={{ transform: isCollapsed ? 'rotate(-90deg)' : 'rotate(0deg)' }}>
                          ▼
                        </span>
                        <span className="font-semibold text-gray-900">{groupName}</span>
                        <span className="text-xs text-gray-500">({groupTasks.length})</span>
                      </div>
                    </div>

                    {/* グループのタスク */}
                    {!isCollapsed && groupTasks.map((task) => {
                      const colors = statusColor(task.status);
                      const overdueStyle = isOverdue(task) ? 'bg-red-50' : '';

                      return (
                        <div
                          key={task.id}
                          className={`grid grid-cols-12 gap-4 px-6 py-4 border-b border-gray-100 hover:bg-gray-50 transition-colors ${overdueStyle}`}
                        >
                          {/* タスク名 */}
                          <div className="col-span-5 flex items-center gap-2">
                            <div
                              className="w-1 h-8 rounded-full"
                              style={{ backgroundColor: getBusinessColor(task.category === '個人' ? undefined : task.business_type) }}
                            />
                            <button
                              onClick={() => setSelectedTask(task)}
                              className="text-left font-medium text-gray-900 hover:text-blue-600 transition-colors"
                            >
                              {task.title}
                            </button>
                          </div>

                          {/* 期限 */}
                          <div className="col-span-2 flex items-center justify-center">
                            <input
                              type="date"
                              value={task.due_date ? task.due_date.split('T')[0] : ''}
                              onChange={(e) => handleUpdateField(task.id, 'due_date', e.target.value || null)}
                              className={`px-2 py-1 text-sm rounded border ${
                                isOverdue(task) ? 'border-red-500 text-red-600 font-semibold' : 'border-gray-300 text-gray-700'
                              }`}
                            />
                          </div>

                          {/* カテゴリ */}
                          <div className="col-span-2 flex items-center justify-center">
                            {task.category === '事業' && task.business_type ? (
                              <span
                                className="px-3 py-1 rounded-full text-xs font-medium text-white"
                                style={{ backgroundColor: getBusinessColor(task.business_type) }}
                              >
                                {task.business_type}
                              </span>
                            ) : (
                              <span className="px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-700">
                                {task.category}
                              </span>
                            )}
                          </div>

                          {/* ステータス */}
                          <div className="col-span-2 flex items-center justify-center">
                            <select
                              value={task.status}
                              onChange={(e) => handleUpdateField(task.id, 'status', e.target.value)}
                              className="px-3 py-1 rounded text-xs font-medium cursor-pointer border-0 outline-none"
                              style={{ backgroundColor: colors.bg, color: colors.text }}
                            >
                              <option value="未着手">未着手</option>
                              <option value="進行中">進行中</option>
                              <option value="完了">完了</option>
                            </select>
                          </div>

                          {/* 優先度 */}
                          <div className="col-span-1 flex items-center justify-center">
                            <span className="text-lg">{priorityEmoji(task.priority)}</span>
                          </div>
                        </div>
                      );
                    })}

                    {/* Add Item ボタン */}
                    {!isCollapsed && (
                      <div className="px-6 py-3">
                        <button
                          onClick={() => setShowAddModal(true)}
                          className="text-sm text-gray-500 hover:text-gray-700 font-medium"
                        >
                          + アイテムを追加
                        </button>
                      </div>
                    )}
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
        </div>

        {/* カード型ビュー（スマホのみ） */}
        <div className="md:hidden flex-1 overflow-auto">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <div className="p-4 space-y-6">
              {Object.entries(groupedTasks).map(([groupName, groupTasks]) => {
                if (groupTasks.length === 0) return null;
                const isCollapsed = collapsedGroups.has(groupName);

                return (
                  <div key={groupName}>
                    {/* グループヘッダー */}
                    <div
                      className="flex items-center justify-between mb-3 cursor-pointer"
                      onClick={() => toggleGroup(groupName)}
                    >
                      <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                        <span className="transition-transform" style={{ transform: isCollapsed ? 'rotate(-90deg)' : 'rotate(0deg)' }}>
                          ▼
                        </span>
                        {groupName}
                      </h3>
                      <span className="text-sm text-gray-500">({groupTasks.length})</span>
                    </div>

                    {/* グループのタスク（カード型） */}
                    {!isCollapsed && (
                      <div className="space-y-3">
                        {groupTasks.map((task) => {
                          const colors = statusColor(task.status);
                          const overdueStyle = isOverdue(task) ? 'border-red-500 bg-red-50' : '';

                          return (
                            <div
                              key={task.id}
                              onClick={() => setSelectedTask(task)}
                              className={`bg-white rounded-lg p-4 shadow-sm border-2 border-gray-200 ${overdueStyle} active:bg-gray-50 cursor-pointer`}
                            >
                              {/* カラーバー + タイトル */}
                              <div className="flex items-start gap-2 mb-3">
                                <div
                                  className="w-1 h-full min-h-[40px] rounded-full"
                                  style={{ backgroundColor: getBusinessColor(task.category === '個人' ? undefined : task.business_type) }}
                                />
                                <div className="flex-1">
                                  <h4 className="font-semibold text-gray-900 mb-1">{task.title}</h4>
                                  {task.description && (
                                    <p className="text-sm text-gray-600 line-clamp-2">{task.description}</p>
                                  )}
                                </div>
                              </div>

                              {/* メタ情報 */}
                              <div className="flex flex-wrap gap-2">
                                {/* ステータス */}
                                <span
                                  className="px-3 py-1 rounded text-xs font-medium"
                                  style={{ backgroundColor: colors.bg, color: colors.text }}
                                >
                                  {task.status}
                                </span>

                                {/* カテゴリ */}
                                {task.category === '事業' && task.business_type ? (
                                  <span
                                    className="px-3 py-1 rounded text-xs font-medium text-white"
                                    style={{ backgroundColor: getBusinessColor(task.business_type) }}
                                  >
                                    {task.business_type}
                                  </span>
                                ) : (
                                  <span className="px-3 py-1 rounded text-xs font-medium bg-purple-100 text-purple-700">
                                    {task.category}
                                  </span>
                                )}

                                {/* 優先度 */}
                                {task.priority && (
                                  <span className="flex items-center gap-1 px-3 py-1 rounded text-xs font-medium bg-gray-100 text-gray-700">
                                    <span className="text-sm">{priorityEmoji(task.priority)}</span>
                                    <span>{task.priority}</span>
                                  </span>
                                )}

                                {/* 期限 */}
                                {task.due_date && (
                                  <span className={`flex items-center gap-1 px-3 py-1 rounded text-xs font-medium ${
                                    isOverdue(task) ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'
                                  }`}>
                                    📅 {formatDate(task.due_date)}
                                    {isOverdue(task) && ' ⚠️'}
                                  </span>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
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
        </div>
      </div>

      {/* タスク詳細パネル */}
      {selectedTask && (
        <div className="fixed inset-0 md:right-0 md:left-auto md:w-[500px] bg-white shadow-2xl z-50 overflow-y-auto md:border-l border-gray-200">
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
                  className="text-xl font-bold text-gray-900 mb-4 w-full border-0 border-b-2 border-transparent hover:border-gray-300 focus:border-blue-500 outline-none"
                />
              </div>

              {/* ステータス・優先度 */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">ステータス</label>
                  <select
                    value={selectedTask.status}
                    onChange={(e) => handleUpdateField(selectedTask.id, 'status', e.target.value)}
                    className="w-full px-3 py-2 rounded border border-gray-300"
                  >
                    <option value="未着手">未着手</option>
                    <option value="進行中">進行中</option>
                    <option value="完了">完了</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">優先度</label>
                  <select
                    value={selectedTask.priority || ''}
                    onChange={(e) => handleUpdateField(selectedTask.id, 'priority', e.target.value || undefined)}
                    className="w-full px-3 py-2 rounded border border-gray-300"
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
              </div>

              {/* 期限 */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">期限</label>
                <input
                  type="date"
                  value={selectedTask.due_date ? selectedTask.due_date.split('T')[0] : ''}
                  onChange={(e) => handleUpdateField(selectedTask.id, 'due_date', e.target.value || null)}
                  className="w-full px-3 py-2 border border-gray-300 rounded"
                />
              </div>

              {/* 説明 */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">説明</label>
                <textarea
                  value={selectedTask.description || ''}
                  onChange={(e) => setSelectedTask({ ...selectedTask, description: e.target.value })}
                  onBlur={() => handleUpdateField(selectedTask.id, 'description', selectedTask.description)}
                  className="w-full px-3 py-2 border border-gray-300 rounded"
                  rows={4}
                  placeholder="詳細な説明を入力..."
                />
              </div>

              {/* 削除ボタン */}
              <div className="border-t pt-4">
                <button
                  onClick={() => handleDeleteTask(selectedTask.id)}
                  className="w-full px-4 py-3 bg-red-50 text-red-600 rounded-lg font-medium hover:bg-red-100"
                >
                  🗑️ このタスクを削除
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* タスク追加モーダル */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full p-8 max-h-[90vh] overflow-y-auto">
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
                className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700"
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
