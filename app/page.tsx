'use client';

import { useEffect, useState } from 'react';
import { supabase, Task, Subtask, Comment } from '@/lib/supabase';
import { validateTask, validateSubtaskTitle } from '@/lib/validation';
import ViewSwitcher from '@/app/components/layout/ViewSwitcher';
import { useKeyboardShortcuts } from '@/src/hooks/useKeyboardShortcuts';
import EmptyState from '@/src/components/common/EmptyState';
import LoadingSkeleton from '@/src/components/common/LoadingSkeleton';
import { toast } from '@/src/stores/toastStore';
import DarkModeToggle from '@/src/components/common/DarkModeToggle';

export default function Home() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [subtasks, setSubtasks] = useState<Subtask[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | '個人' | '事業'>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  const [newCommentContent, setNewCommentContent] = useState('');
  const [editingSubtaskId, setEditingSubtaskId] = useState<string | null>(null);
  const [editingSubtaskTitle, setEditingSubtaskTitle] = useState('');
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
      fetchComments(selectedTask.id);
    }
  }, [selectedTask]);

  // キーボードショートカット
  useKeyboardShortcuts({
    onAddTask: () => setShowAddModal(true),
    onSearch: () => {}, // 検索機能は今後実装
    onEscape: () => {
      setShowAddModal(false);
      setSelectedTask(null);
    },
  });

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

  const fetchComments = async (taskId: string) => {
    const { data, error } = await supabase
      .from('comments')
      .select('*')
      .eq('task_id', taskId)
      .order('created_at', { ascending: true }); // 時系列順（古い→新しい）

    if (error) {
      console.error('Error fetching comments:', error);
    } else {
      setComments(data || []);
    }
  };

  const handleAddTask = async () => {
    const validation = validateTask(newTask);
    if (!validation.valid) {
      toast.error('入力エラー', validation.error);
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
      toast.error('タスクの追加に失敗しました', error.message);
    } else {
      setShowAddModal(false);
      toast.success('タスクを追加しました', newTask.title);
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
      toast.error('更新に失敗しました', error.message);
    } else {
      fetchTasks();
      if (selectedTask?.id === taskId) {
        const updatedTask = { ...selectedTask, [field]: value };
        setSelectedTask(updatedTask);
      }
      
      // ステータス変更時のみToast表示
      if (field === 'status') {
        const task = tasks.find(t => t.id === taskId);
        if (value === '完了') {
          toast.success('タスクを完了しました！🎉', task?.title);
        } else {
          toast.info(`ステータスを「${value}」に変更しました`, task?.title);
        }
      }
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!confirm('このタスクを削除しますか？')) {
      return;
    }

    // バックアップ（Undo用）
    const taskToDelete = tasks.find(t => t.id === taskId);
    const subtasksToDelete = subtasks.filter(st => st.task_id === taskId);

    const { error: subtaskError } = await supabase
      .from('subtasks')
      .delete()
      .eq('task_id', taskId);

    if (subtaskError) {
      console.error('Error deleting subtasks:', subtaskError);
      toast.error('サブタスクの削除に失敗しました', subtaskError.message);
      return;
    }

    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', taskId);

    if (error) {
      console.error('Error deleting task:', error);
      toast.error('タスクの削除に失敗しました', error.message);
    } else {
      setSelectedTask(null);
      fetchTasks();
      
      // Undo対応のToast
      toast.success('タスクを削除しました', taskToDelete?.title, async () => {
        // Undo処理
        if (taskToDelete) {
          const { error: restoreError } = await supabase
            .from('tasks')
            .insert([taskToDelete]);
          
          if (!restoreError && subtasksToDelete.length > 0) {
            await supabase.from('subtasks').insert(subtasksToDelete);
          }
          
          if (!restoreError) {
            toast.info('タスクを復元しました');
            fetchTasks();
          } else {
            toast.error('復元に失敗しました', restoreError.message);
          }
        }
      });
    }
  };

  // Business Color Mapping
  const getBusinessColor = (businessType?: string) => {
    switch (businessType) {
      case '不動産': return '#00c875';
      case '人材': return '#0073ea';
      case '結婚相談所': return '#ff3d57';
      case 'コーポレート': return '#fdab3d';
      case '経済圏': return '#9cd326';
      default: return '#a855f7';
    }
  };

  const getAccentClass = (businessType?: string, isPersonal?: boolean) => {
    if (isPersonal) return 'accent-personal';
    switch (businessType) {
      case '不動産': return 'accent-fudosan';
      case '人材': return 'accent-jinzai';
      case '結婚相談所': return 'accent-kekkon';
      case 'コーポレート': return 'accent-corporate';
      case '経済圏': return 'accent-keizai';
      default: return 'accent-personal';
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

  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set(['✅ 完了']));

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
    <div className="flex h-screen bg-neutral-50">
      {/* サイドバーバックドロップ（モバイルのみ） */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-label="Close sidebar"
        />
      )}

      {/* 左サイドバー */}
      <div className={`sidebar ${sidebarOpen ? 'sidebar-open' : 'sidebar-closed'} fixed md:relative z-50 md:z-auto`}>
        {sidebarOpen ? (
          <>
            {/* ロゴ */}
            <div className="p-6 border-b border-neutral-200">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-xl font-bold text-neutral-900">タスク管理</h1>
                  <p className="text-xs text-neutral-500 mt-1">須田 專用</p>
                </div>
                {/* PC用閉じるボタン */}
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="hidden md:flex btn-ghost p-2 rounded-lg hover:bg-neutral-100 transition-colors"
                  aria-label="Close sidebar"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
              </div>
            </div>

          {/* ナビゲーション */}
          <div className="flex-1 p-4 space-y-1">
            <button
              onClick={() => setFilter('all')}
              className={`sidebar-item ${filter === 'all' ? 'sidebar-item-active' : ''}`}
            >
              <span className="text-base">📋</span>
              <span>すべてのタスク</span>
              <span className="ml-auto text-xs text-neutral-500">{tasks.length}</span>
            </button>
            <button
              onClick={() => setFilter('個人')}
              className={`sidebar-item ${filter === '個人' ? 'sidebar-item-active' : ''}`}
            >
              <span className="text-base">👤</span>
              <span>個人タスク</span>
              <span className="ml-auto text-xs text-neutral-500">
                {tasks.filter(t => t.category === '個人').length}
              </span>
            </button>
            <button
              onClick={() => setFilter('事業')}
              className={`sidebar-item ${filter === '事業' ? 'sidebar-item-active' : ''}`}
            >
              <span className="text-base">🏢</span>
              <span>事業タスク</span>
              <span className="ml-auto text-xs text-neutral-500">
                {tasks.filter(t => t.category === '事業').length}
              </span>
            </button>

            <div className="divider" />

            <div className="px-3 py-2 text-xs font-semibold text-neutral-600 uppercase tracking-wider">
              事業別
            </div>
            
            {['不動産', '人材', '結婚相談所', 'コーポレート', '経済圏'].map(business => {
              const count = tasks.filter(t => t.business_type === business).length;
              if (count === 0) return null;
              
              return (
                <button
                  key={business}
                  onClick={() => setFilter('事業')}
                  className="sidebar-item flex items-center gap-2"
                >
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: getBusinessColor(business) }}
                  />
                  <span>{business}</span>
                  <span className="ml-auto text-xs text-neutral-500">{count}</span>
                </button>
              );
            })}
          </div>

            {/* フッター */}
            <div className="p-4 border-t border-neutral-200">
              <div className="flex items-center gap-2 text-sm text-neutral-600">
                <div className="w-2 h-2 rounded-full bg-success-500 animate-pulse-soft" />
                <span>{tasks.filter(t => t.status !== '完了').length}個のアクティブタスク</span>
              </div>
            </div>
          </>
        ) : (
          /* 閉じた時の細いバー（PC用） */
          <div className="hidden md:flex flex-col items-center py-6 gap-4 w-full">
            <button
              onClick={() => setSidebarOpen(true)}
              className="btn-ghost p-2 rounded-lg hover:bg-neutral-100 transition-colors"
              aria-label="Open sidebar"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        )}
      </div>

      {/* メインコンテンツ */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* 上部ツールバー */}
        <div className="bg-white border-b border-neutral-200 px-4 md:px-6 py-4 shadow-sm">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3 md:gap-4">
              {/* サイドバー開閉（全デバイス対応） */}
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="btn-ghost p-2 rounded-lg hover:bg-neutral-100 transition-colors"
                aria-label="Toggle sidebar"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              
              <div>
                <h2 className="text-xl md:text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">
                  {filter === 'all' ? 'すべてのタスク' : filter === '個人' ? '個人タスク' : '事業タスク'}
                </h2>
                <p className="text-sm text-neutral-600 mt-0.5 font-semibold">
                  {new Date().toLocaleDateString('ja-JP', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'short' })}
                </p>
              </div>
            </div>

            {/* モバイル用フィルタ */}
            <div className="flex md:hidden gap-2">
              <button
                onClick={() => setFilter('all')}
                className={`btn-sm ${filter === 'all' ? 'btn-primary' : 'btn-secondary'}`}
              >
                すべて
              </button>
              <button
                onClick={() => setFilter('個人')}
                className={`btn-sm ${filter === '個人' ? 'btn-primary' : 'btn-secondary'}`}
              >
                個人
              </button>
              <button
                onClick={() => setFilter('事業')}
                className={`btn-sm ${filter === '事業' ? 'btn-primary' : 'btn-secondary'}`}
              >
                事業
              </button>
            </div>

            <div className="flex gap-2 items-center">
              <DarkModeToggle />
              <ViewSwitcher className="hidden md:flex" />
              <button
                onClick={() => setShowAddModal(true)}
                className="btn btn-primary"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <span className="hidden md:inline">タスク追加</span>
                <span className="md:hidden">追加</span>
              </button>
            </div>
          </div>
        </div>

        {/* テーブルビュー（PCのみ） */}
        <div className="hidden md:flex flex-1 overflow-auto">
          {loading ? (
            <div className="w-full p-6">
              <LoadingSkeleton type="list" count={8} />
            </div>
          ) : tasks.length === 0 ? (
            <div className="w-full flex items-center justify-center">
              <EmptyState type="tasks" onAddTask={() => setShowAddModal(true)} />
            </div>
          ) : (
            <div className="bg-white/95 backdrop-blur-sm overflow-x-auto w-full rounded-lg border border-neutral-200/50 shadow-sm">
              {/* テーブルヘッダー */}
              <div className="grid grid-cols-12 gap-4 table-header items-center px-6" style={{ minHeight: '64px' }}>
                <div className="col-span-5 flex items-center">タスク</div>
                <div className="col-span-2 flex items-center justify-center">期限</div>
                <div className="col-span-2 flex items-center justify-center">カテゴリ</div>
                <div className="col-span-3 flex items-center justify-center">ステータス / 優先度</div>
              </div>

              {/* グループごとのテーブル */}
              {Object.entries(groupedTasks).map(([groupName, groupTasks]) => {
                if (groupTasks.length === 0) return null;
                const isCollapsed = collapsedGroups.has(groupName);

                return (
                  <div key={groupName} className="border-b border-neutral-200">
                    {/* グループヘッダー */}
                    <div
                      className="group-header"
                      onClick={() => toggleGroup(groupName)}
                    >
                      <div className="group-header-title">
                        <span 
                          className="group-collapse-icon"
                          style={{ transform: isCollapsed ? 'rotate(-90deg)' : 'rotate(0deg)' }}
                        >
                          ▼
                        </span>
                        <span>{groupName}</span>
                        <span className="badge badge-neutral">{groupTasks.length}</span>
                      </div>
                    </div>

                    {/* グループのタスク */}
                    {!isCollapsed && groupTasks.map((task) => {
                      const overdueClass = isOverdue(task) ? 'bg-danger-50 border-l-4 border-l-danger-500' : '';

                      return (
                        <div
                          key={task.id}
                          onClick={() => setSelectedTask(task)}
                          className={`table-row grid grid-cols-12 gap-4 cursor-pointer px-6 ${overdueClass}`}
                          style={{ minHeight: '80px', alignItems: 'center' }}
                        >
                          {/* タスク名 + 補足 */}
                          <div className="col-span-5 flex items-center py-4">
                            <div className="flex items-center gap-3 w-full">
                              <div className={`accent-bar ${getAccentClass(task.business_type, task.category === '個人')}`} style={{ minHeight: '56px' }} />
                              <div className="flex-1 min-w-0">
                                <div className="font-semibold text-neutral-900 mb-1 text-base">
                                  {task.title}
                                </div>
                                {task.description && (
                                  <div className="text-xs text-neutral-500 line-clamp-1 mt-0.5">
                                    {task.description.split('\n')[0]}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* 期限 */}
                          <div className="col-span-2 flex items-center justify-center py-4">
                            <input
                              type="date"
                              value={task.due_date ? task.due_date.split('T')[0] : ''}
                              onChange={(e) => handleUpdateField(task.id, 'due_date', e.target.value || null)}
                              onClick={(e) => e.stopPropagation()}
                              className={`input text-sm font-medium text-center ${
                                isOverdue(task) ? 'border-danger-500 text-danger-600 font-bold bg-danger-50' : ''
                              }`}
                              style={{ height: '44px', padding: '0 12px', fontSize: '14px', width: '100%' }}
                            />
                          </div>

                          {/* カテゴリ */}
                          <div className="col-span-2 flex items-center justify-center py-4">
                            {task.category === '事業' && task.business_type ? (
                              <span
                                className="badge text-white font-bold text-xs"
                                style={{ 
                                  backgroundColor: getBusinessColor(task.business_type), 
                                  height: '40px',
                                  padding: '0 18px',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  borderRadius: '10px',
                                  boxShadow: '0 3px 10px rgba(0,0,0,0.08)'
                                }}
                              >
                                {task.business_type}
                              </span>
                            ) : (
                              <span 
                                className="badge badge-secondary font-bold text-xs" 
                                style={{ 
                                  height: '40px',
                                  padding: '0 18px',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  borderRadius: '10px',
                                  boxShadow: '0 3px 10px rgba(0,0,0,0.08)'
                                }}
                              >
                                {task.category}
                              </span>
                            )}
                          </div>

                          {/* ステータス + 優先度 */}
                          <div className="col-span-3 flex items-center justify-center gap-3 py-4">
                            <select
                              value={task.status}
                              onChange={(e) => handleUpdateField(task.id, 'status', e.target.value)}
                              onClick={(e) => e.stopPropagation()}
                              className={`select text-sm font-bold cursor-pointer ${
                                task.status === '完了' ? 'status-done' :
                                task.status === '進行中' ? 'status-progress' : 'status-todo'
                              }`}
                              style={{ 
                                height: '44px',
                                padding: '0 14px',
                                fontSize: '14px',
                                minWidth: '130px',
                                maxWidth: '140px',
                                borderRadius: '10px'
                              }}
                            >
                              <option value="未着手">未着手</option>
                              <option value="進行中">進行中</option>
                              <option value="完了">完了</option>
                            </select>
                            <span 
                              className="text-3xl flex-shrink-0 drop-shadow-sm" 
                              style={{ lineHeight: '1' }}
                            >
                              {priorityEmoji(task.priority)}
                            </span>
                          </div>
                        </div>
                      );
                    })}

                    {/* Add Item ボタン */}
                    {!isCollapsed && (
                      <div className="px-4 py-3">
                        <button
                          onClick={() => setShowAddModal(true)}
                          className="btn-ghost btn-sm text-neutral-600"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                          </svg>
                          アイテムを追加
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* カード型ビュー（スマホのみ） */}
        <div className="md:hidden flex-1 overflow-auto bg-neutral-50">
          {loading ? (
            <div className="p-4">
              <LoadingSkeleton type="card" count={5} />
            </div>
          ) : tasks.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <EmptyState type="tasks" onAddTask={() => setShowAddModal(true)} />
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
                      className="flex items-center justify-between mb-4 cursor-pointer"
                      onClick={() => toggleGroup(groupName)}
                    >
                      <div className="flex items-center gap-2">
                        <span 
                          className="text-neutral-400 transition-transform duration-200" 
                          style={{ transform: isCollapsed ? 'rotate(-90deg)' : 'rotate(0deg)' }}
                        >
                          ▼
                        </span>
                        <h3 className="font-semibold text-neutral-900">{groupName}</h3>
                        <span className="badge badge-neutral">{groupTasks.length}</span>
                      </div>
                    </div>

                    {/* グループのタスク（カード型） */}
                    {!isCollapsed && (
                      <div className="space-y-3">
                        {groupTasks.map((task) => {
                          const overdueClass = isOverdue(task) ? 'border-danger-500 bg-danger-50' : '';

                          return (
                            <div
                              key={task.id}
                              onClick={() => setSelectedTask(task)}
                              className={`card card-interactive p-4 ${overdueClass}`}
                            >
                              {/* カラーバー + タイトル */}
                              <div className="flex items-start gap-3 mb-3">
                                <div className={`accent-bar ${getAccentClass(task.business_type, task.category === '個人')}`} />
                                <div className="flex-1 min-w-0">
                                  <h4 className="font-semibold text-neutral-900 mb-1">{task.title}</h4>
                                  {task.description && (
                                    <p className="text-sm text-neutral-600 truncate-2">{task.description}</p>
                                  )}
                                </div>
                              </div>

                              {/* メタ情報 */}
                              <div className="flex flex-wrap gap-2">
                                {/* ステータス */}
                                <span className={`status-pill ${
                                  task.status === '完了' ? 'status-done' :
                                  task.status === '進行中' ? 'status-progress' : 'status-todo'
                                }`}>
                                  {task.status}
                                </span>

                                {/* カテゴリ */}
                                {task.category === '事業' && task.business_type ? (
                                  <span
                                    className="badge text-white font-semibold"
                                    style={{ backgroundColor: getBusinessColor(task.business_type) }}
                                  >
                                    {task.business_type}
                                  </span>
                                ) : (
                                  <span className="badge badge-secondary">
                                    {task.category}
                                  </span>
                                )}

                                {/* 優先度 */}
                                {task.priority && (
                                  <span className="badge badge-neutral flex items-center gap-1">
                                    <span className="text-lg">{priorityEmoji(task.priority)}</span>
                                    <span>{task.priority}</span>
                                  </span>
                                )}

                                {/* 期限 */}
                                {task.due_date && (
                                  <span className={`badge ${
                                    isOverdue(task) ? 'badge-danger' : 'badge-neutral'
                                  } flex items-center gap-1`}>
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
            </div>
          )}
        </div>
      </div>

      {/* タスク詳細パネル - バックドロップ */}
      {selectedTask && (
        <>
          {/* バックドロップ（外側クリックで閉じる） */}
          <div 
            className="fixed inset-0 bg-black/20 z-40"
            onClick={() => setSelectedTask(null)}
            aria-label="Close task detail"
          />
          
          {/* 詳細パネル本体 */}
          <div className="fixed inset-0 md:right-0 md:left-auto md:w-[500px] bg-white shadow-2xl z-50 overflow-y-auto md:border-l-2 border-neutral-200 animate-slideIn">
            <div className="p-6 md:p-8">
            {/* ヘッダー */}
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className={`accent-bar h-12 ${getAccentClass(selectedTask.business_type, selectedTask.category === '個人')}`} />
                <h2 className="text-2xl font-bold text-neutral-900">タスク詳細</h2>
              </div>
              <button
                onClick={() => setSelectedTask(null)}
                className="btn-ghost p-2 rounded-lg text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100"
                aria-label="Close"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-6">
              {/* タイトル */}
              <div>
                <label className="block text-sm font-semibold text-neutral-700 mb-2">タスク名</label>
                <input
                  type="text"
                  value={selectedTask.title}
                  onChange={(e) => setSelectedTask({ ...selectedTask, title: e.target.value })}
                  onBlur={() => handleUpdateField(selectedTask.id, 'title', selectedTask.title)}
                  className="input text-lg font-semibold"
                />
              </div>

              {/* ステータス・優先度 */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-neutral-700 mb-2">ステータス</label>
                  <select
                    value={selectedTask.status}
                    onChange={(e) => handleUpdateField(selectedTask.id, 'status', e.target.value)}
                    className="select"
                  >
                    <option value="未着手">未着手</option>
                    <option value="進行中">進行中</option>
                    <option value="完了">完了</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-neutral-700 mb-2">優先度</label>
                  <select
                    value={selectedTask.priority || ''}
                    onChange={(e) => handleUpdateField(selectedTask.id, 'priority', e.target.value || undefined)}
                    className="select"
                  >
                    <option value="">なし</option>
                    <option value="今すぐやる">🔥 今すぐやる</option>
                    <option value="今週やる">⚡ 今週やる</option>
                    <option value="今月やる">📅 今月やる</option>
                    <option value="高">🔴 高</option>
                    <option value="中">🟡 中</option>
                    <option value="低">🟢 低</option>
                  </select>
                </div>
              </div>

              {/* 期限 */}
              <div>
                <label className="block text-sm font-semibold text-neutral-700 mb-2">期限</label>
                <input
                  type="date"
                  value={selectedTask.due_date ? selectedTask.due_date.split('T')[0] : ''}
                  onChange={(e) => handleUpdateField(selectedTask.id, 'due_date', e.target.value || null)}
                  className="input"
                />
                {isOverdue(selectedTask) && (
                  <p className="text-sm text-danger-600 font-medium mt-2 flex items-center gap-1">
                    ⚠️ 期限を過ぎています
                  </p>
                )}
              </div>

              {/* カテゴリ */}
              <div>
                <label className="block text-sm font-semibold text-neutral-700 mb-3">カテゴリ</label>
                <div className="space-y-3">
                  {/* 個人/事業 選択 */}
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        checked={selectedTask.category === '個人'}
                        onChange={() => {
                          const updated = { ...selectedTask, category: '個人' as '個人' | '事業', business_type: undefined };
                          setSelectedTask(updated);
                          handleUpdateField(selectedTask.id, 'category', '個人');
                          handleUpdateField(selectedTask.id, 'business_type', null);
                        }}
                        className="w-4 h-4 text-primary-600 focus:ring-primary-500"
                      />
                      <span className="text-sm font-medium">👤 個人</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        checked={selectedTask.category === '事業'}
                        onChange={() => {
                          const updated = { ...selectedTask, category: '事業' as '個人' | '事業' };
                          setSelectedTask(updated);
                          handleUpdateField(selectedTask.id, 'category', '事業');
                        }}
                        className="w-4 h-4 text-primary-600 focus:ring-primary-500"
                      />
                      <span className="text-sm font-medium">🏢 事業</span>
                    </label>
                  </div>

                  {/* 事業種別 選択（事業の場合のみ） */}
                  {selectedTask.category === '事業' && (
                    <div>
                      <label className="block text-sm font-medium text-neutral-600 mb-2">事業種別</label>
                      <select
                        value={selectedTask.business_type || ''}
                        onChange={(e) => {
                          const value = e.target.value as Task['business_type'];
                          setSelectedTask({ ...selectedTask, business_type: value });
                          handleUpdateField(selectedTask.id, 'business_type', value || null);
                        }}
                        className="select"
                      >
                        <option value="">選択してください</option>
                        <option value="不動産">不動産</option>
                        <option value="人材">人材</option>
                        <option value="経済圏">経済圏</option>
                        <option value="結婚相談所">結婚相談所</option>
                        <option value="コーポレート">コーポレート</option>
                      </select>
                    </div>
                  )}
                </div>
              </div>

              {/* 説明 */}
              <div>
                <label className="block text-sm font-semibold text-neutral-700 mb-2">説明</label>
                <textarea
                  value={selectedTask.description || ''}
                  onChange={(e) => setSelectedTask({ ...selectedTask, description: e.target.value })}
                  onBlur={() => handleUpdateField(selectedTask.id, 'description', selectedTask.description)}
                  className="textarea"
                  rows={5}
                  placeholder="詳細な説明を入力..."
                />
              </div>

              <div className="divider" />

              {/* サブタスクセクション */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-neutral-900">サブタスク</h3>
                  <span className="badge badge-neutral">
                    {subtasks.filter(s => s.completed).length}/{subtasks.length}
                  </span>
                </div>

                {/* サブタスク一覧 */}
                <div className="space-y-2 mb-4">
                  {subtasks.map((subtask) => (
                    <div
                      key={subtask.id}
                      className="flex items-center gap-3 p-3 rounded-lg border border-neutral-200 hover:bg-neutral-50 transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={subtask.completed}
                        onChange={async () => {
                          const { error } = await supabase
                            .from('subtasks')
                            .update({ completed: !subtask.completed })
                            .eq('id', subtask.id);
                          if (!error) {
                            fetchSubtasks(selectedTask.id);
                          }
                        }}
                        className="w-5 h-5 rounded border-neutral-300 text-primary-600 focus:ring-primary-500 cursor-pointer"
                      />
                      {editingSubtaskId === subtask.id ? (
                        /* 編集モード */
                        <input
                          type="text"
                          value={editingSubtaskTitle}
                          onChange={(e) => setEditingSubtaskTitle(e.target.value)}
                          onBlur={async () => {
                            if (editingSubtaskTitle.trim() === '') {
                              setEditingSubtaskId(null);
                              return;
                            }
                            const validation = validateSubtaskTitle(editingSubtaskTitle);
                            if (!validation.valid) {
                              toast.error('入力エラー', validation.error);
                              setEditingSubtaskId(null);
                              return;
                            }
                            const { error } = await supabase
                              .from('subtasks')
                              .update({ title: editingSubtaskTitle.trim() })
                              .eq('id', subtask.id);
                            if (!error) {
                              toast.success('サブタスクを更新しました', editingSubtaskTitle);
                              fetchSubtasks(selectedTask.id);
                            } else {
                              toast.error('更新に失敗しました', error.message);
                            }
                            setEditingSubtaskId(null);
                          }}
                          onKeyPress={async (e) => {
                            if (e.key === 'Enter') {
                              e.currentTarget.blur();
                            }
                          }}
                          className="flex-1 px-2 py-1 border border-primary-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-500"
                          autoFocus
                        />
                      ) : (
                        /* 表示モード */
                        <span
                          onClick={() => {
                            setEditingSubtaskId(subtask.id);
                            setEditingSubtaskTitle(subtask.title);
                          }}
                          className={`flex-1 cursor-pointer hover:text-primary-600 ${
                            subtask.completed ? 'line-through text-neutral-400' : 'text-neutral-900'
                          }`}
                        >
                          {subtask.title}
                        </span>
                      )}
                      <button
                        onClick={async () => {
                          if (confirm('このサブタスクを削除しますか？')) {
                            const { error } = await supabase
                              .from('subtasks')
                              .delete()
                              .eq('id', subtask.id);
                            if (!error) {
                              toast.success('サブタスクを削除しました');
                              fetchSubtasks(selectedTask.id);
                            } else {
                              toast.error('削除に失敗しました', error.message);
                            }
                          }
                        }}
                        className="text-neutral-400 hover:text-danger-600 transition-colors"
                        aria-label="削除"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>

                {/* サブタスク追加フォーム */}
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newSubtaskTitle}
                    onChange={(e) => setNewSubtaskTitle(e.target.value)}
                    onKeyPress={async (e) => {
                      if (e.key === 'Enter' && newSubtaskTitle.trim()) {
                        const validation = validateSubtaskTitle(newSubtaskTitle);
                        if (!validation.valid) {
                          alert(validation.error);
                          return;
                        }
                        const { error } = await supabase
                          .from('subtasks')
                          .insert([{
                            task_id: selectedTask.id,
                            title: newSubtaskTitle.trim(),
                            completed: false
                          }]);
                        if (!error) {
                          setNewSubtaskTitle('');
                          fetchSubtasks(selectedTask.id);
                        }
                      }
                    }}
                    className="input flex-1"
                    placeholder="サブタスクを追加..."
                  />
                  <button
                    onClick={async () => {
                      if (!newSubtaskTitle.trim()) return;
                      const validation = validateSubtaskTitle(newSubtaskTitle);
                      if (!validation.valid) {
                        alert(validation.error);
                        return;
                      }
                      const { error } = await supabase
                        .from('subtasks')
                        .insert([{
                          task_id: selectedTask.id,
                          title: newSubtaskTitle.trim(),
                          completed: false
                        }]);
                      if (!error) {
                        setNewSubtaskTitle('');
                        fetchSubtasks(selectedTask.id);
                      }
                    }}
                    className="btn btn-primary"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  </button>
                </div>
              </div>

              <div className="divider" />

              {/* コメントセクション */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-neutral-900">コメント</h3>
                  <span className="badge badge-neutral">{comments.length}</span>
                </div>

                {/* コメント一覧 */}
                <div className="space-y-3 mb-4 max-h-[400px] overflow-y-auto">
                  {comments.length === 0 ? (
                    <div className="text-center py-8 text-neutral-400 text-sm">
                      まだコメントがありません
                    </div>
                  ) : (
                    comments.map((comment) => (
                      <div
                        key={comment.id}
                        className="p-4 rounded-lg bg-neutral-50 border border-neutral-200"
                      >
                        <div className="text-sm text-neutral-900 whitespace-pre-wrap mb-2">
                          {comment.content}
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-neutral-500">
                            {new Date(comment.created_at).toLocaleString('ja-JP', {
                              year: 'numeric',
                              month: '2-digit',
                              day: '2-digit',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                          <button
                            onClick={async () => {
                              if (confirm('このコメントを削除しますか？')) {
                                const { error } = await supabase
                                  .from('comments')
                                  .delete()
                                  .eq('id', comment.id);
                                if (!error) {
                                  toast.success('コメントを削除しました');
                                  fetchComments(selectedTask.id);
                                } else {
                                  toast.error('削除に失敗しました', error.message);
                                }
                              }
                            }}
                            className="text-xs text-neutral-400 hover:text-danger-600 transition-colors"
                          >
                            削除
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* コメント追加フォーム */}
                <div className="space-y-2">
                  <textarea
                    value={newCommentContent}
                    onChange={(e) => setNewCommentContent(e.target.value)}
                    onKeyPress={async (e) => {
                      if (e.key === 'Enter' && e.ctrlKey && newCommentContent.trim()) {
                        const { error } = await supabase
                          .from('comments')
                          .insert([{
                            task_id: selectedTask.id,
                            content: newCommentContent.trim()
                          }]);
                        if (!error) {
                          toast.success('コメントを追加しました');
                          setNewCommentContent('');
                          fetchComments(selectedTask.id);
                        } else {
                          toast.error('コメントの追加に失敗しました', error.message);
                        }
                      }
                    }}
                    className="textarea w-full"
                    rows={3}
                    placeholder="コメントを入力... (Ctrl+Enterで送信)"
                  />
                  <div className="flex justify-end">
                    <button
                      onClick={async () => {
                        if (!newCommentContent.trim()) {
                          toast.error('入力エラー', 'コメントを入力してください');
                          return;
                        }
                        const { error } = await supabase
                          .from('comments')
                          .insert([{
                            task_id: selectedTask.id,
                            content: newCommentContent.trim()
                          }]);
                        if (!error) {
                          toast.success('コメントを追加しました');
                          setNewCommentContent('');
                          fetchComments(selectedTask.id);
                        } else {
                          toast.error('コメントの追加に失敗しました', error.message);
                        }
                      }}
                      className="btn btn-primary"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                      </svg>
                      送信
                    </button>
                  </div>
                </div>
              </div>

              <div className="divider" />

              {/* 削除ボタン */}
              <button
                onClick={() => handleDeleteTask(selectedTask.id)}
                className="btn btn-danger w-full"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                このタスクを削除
              </button>
            </div>
          </div>
          </div>
        </>
      )}

      {/* タスク追加モーダル */}
      {showAddModal && (
        <div className="modal-backdrop">
          <div className="modal-content">
            <div className="flex items-start justify-between mb-6">
              <h2 className="text-2xl font-bold text-neutral-900">新しいタスクを追加</h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="btn-ghost p-2 rounded-lg text-neutral-400 hover:text-neutral-600"
                aria-label="Close"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-neutral-700 mb-2">
                  タスク名 <span className="text-danger-500">*</span>
                </label>
                <input
                  type="text"
                  value={newTask.title}
                  onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                  className="input"
                  placeholder="例: 資料作成"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-neutral-700 mb-2">
                  補足説明
                </label>
                <textarea
                  value={newTask.description}
                  onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                  className="textarea"
                  rows={3}
                  placeholder="タスクの詳細や補足情報を入力（任意）"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-neutral-700 mb-2">期限</label>
                <input
                  type="date"
                  value={newTask.due_date || ''}
                  onChange={(e) => setNewTask({ ...newTask, due_date: e.target.value || undefined })}
                  className="input"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-neutral-700 mb-3">カテゴリ</label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      checked={newTask.category === '個人'}
                      onChange={() => setNewTask({ ...newTask, category: '個人', business_type: undefined })}
                      className="w-4 h-4 text-primary-600 focus:ring-primary-500"
                    />
                    <span className="text-sm font-medium">👤 個人</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      checked={newTask.category === '事業'}
                      onChange={() => setNewTask({ ...newTask, category: '事業' })}
                      className="w-4 h-4 text-primary-600 focus:ring-primary-500"
                    />
                    <span className="text-sm font-medium">🏢 事業</span>
                  </label>
                </div>
              </div>

              {newTask.category === '事業' && (
                <div>
                  <label className="block text-sm font-semibold text-neutral-700 mb-2">事業種別</label>
                  <select
                    value={newTask.business_type || ''}
                    onChange={(e) => setNewTask({ ...newTask, business_type: e.target.value as Task['business_type'] })}
                    className="select"
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
                <label className="block text-sm font-semibold text-neutral-700 mb-2">優先度</label>
                <select
                  value={newTask.priority || ''}
                  onChange={(e) => setNewTask({ ...newTask, priority: e.target.value as Task['priority'] })}
                  className="select"
                >
                  <option value="">選択してください</option>
                  <option value="今すぐやる">🔥 今すぐやる</option>
                  <option value="今週やる">⚡ 今週やる</option>
                  <option value="今月やる">📅 今月やる</option>
                  <option value="高">🔴 高</option>
                  <option value="中">🟡 中</option>
                  <option value="低">🟢 低</option>
                </select>
              </div>
            </div>

            <div className="flex gap-3 mt-8">
              <button
                onClick={() => setShowAddModal(false)}
                className="btn btn-secondary flex-1"
              >
                キャンセル
              </button>
              <button
                onClick={handleAddTask}
                className="btn btn-primary flex-1"
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
