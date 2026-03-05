'use client';

import { useState } from 'react';
import { Task, Subtask } from '@/lib/supabase';

interface MondayTableProps {
  tasks: Task[];
  onUpdateTask: (taskId: string, field: string, value: any) => Promise<void>;
  onSelectTask: (task: Task) => void;
}

export default function MondayTable({ tasks, onUpdateTask, onSelectTask }: MondayTableProps) {
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set());

  // 優先度でグループ化
  const groupedTasks = {
    '🔥 今すぐやる': tasks.filter(t => t.priority === '今すぐやる' && t.status !== '完了'),
    '⚡ 今週やる': tasks.filter(t => t.priority === '今週やる' && t.status !== '完了'),
    '📅 今月やる': tasks.filter(t => t.priority === '今月やる' && t.status !== '完了'),
    '📋 その他': tasks.filter(t => !['今すぐやる', '今週やる', '今月やる'].includes(t.priority || '') && t.status !== '完了'),
    '✅ 完了': tasks.filter(t => t.status === '完了')
  };

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

  const getBusinessColor = (businessType?: string) => {
    switch (businessType) {
      case '不動産': return '#00C875'; // Monday green
      case '人材': return '#0073EA'; // Monday blue
      case '結婚相談所': return '#FF3D57'; // Monday red
      case 'コーポレート': return '#FDAB3D'; // Monday orange
      case '経済圏': return '#9CD326'; // Monday lime
      default: return '#6C3CE1'; // Monday purple (個人)
    }
  };

  const statusColor = (status: string) => {
    switch (status) {
      case '未着手': return '#C4C4C4'; // Monday grey
      case '進行中': return '#0073EA'; // Monday blue
      case '完了': return '#00C875'; // Monday green
      default: return '#C4C4C4';
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

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* テーブルヘッダー */}
      <div className="grid grid-cols-12 gap-4 px-6 py-3 bg-gray-50 border-b border-gray-200 font-semibold text-xs text-gray-600 uppercase tracking-wider sticky top-0 z-10">
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
          <div key={groupName} className="border-b border-gray-100 last:border-b-0">
            {/* グループヘッダー */}
            <div
              onClick={() => toggleGroup(groupName)}
              className="flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-gray-50 to-white hover:from-gray-100 hover:to-gray-50 cursor-pointer transition-all group"
            >
              <div className="text-gray-400 group-hover:text-gray-600 transition-colors">
                {isCollapsed ? '▶' : '▼'}
              </div>
              <div className="font-semibold text-gray-900">{groupName}</div>
              <div className="px-2 py-0.5 bg-gray-200 group-hover:bg-gray-300 rounded-full text-xs font-medium text-gray-700 transition-colors">
                {groupTasks.length}
              </div>
            </div>

            {/* グループ内のタスク */}
            {!isCollapsed && (
              <div className="divide-y divide-gray-50">
                {groupTasks.map((task) => (
                  <div
                    key={task.id}
                    className="grid grid-cols-12 gap-4 px-6 py-4 hover:bg-blue-50/50 transition-all duration-150 group"
                  >
                    {/* タスク名 */}
                    <div
                      className="col-span-5 flex items-center gap-3 cursor-pointer"
                      onClick={() => onSelectTask(task)}
                    >
                      <div
                        className="w-1 h-8 rounded-full group-hover:w-1.5 transition-all duration-150"
                        style={{ backgroundColor: getBusinessColor(task.category === '個人' ? undefined : task.business_type) }}
                      />
                      <span className={`font-medium group-hover:text-blue-600 transition-colors ${isOverdue(task) ? 'text-red-600' : 'text-gray-900'}`}>
                        {task.title}
                      </span>
                    </div>

                    {/* 期限 */}
                    <div className="col-span-2 flex items-center justify-center">
                      <input
                        type="date"
                        value={task.due_date ? task.due_date.split('T')[0] : ''}
                        onChange={(e) => onUpdateTask(task.id, 'due_date', e.target.value || null)}
                        onClick={(e) => e.stopPropagation()}
                        className={`px-3 py-1.5 rounded-md text-sm text-center border-2 transition-all hover:border-gray-300 focus:border-blue-500 outline-none ${
                          isOverdue(task)
                            ? 'border-red-300 bg-red-50 text-red-700 font-semibold'
                            : 'border-transparent bg-gray-50 text-gray-700'
                        }`}
                      />
                    </div>

                    {/* カテゴリ */}
                    <div className="col-span-2 flex items-center justify-center">
                      {task.category === '事業' && task.business_type ? (
                        <select
                          value={task.business_type}
                          onChange={(e) => onUpdateTask(task.id, 'business_type', e.target.value)}
                          onClick={(e) => e.stopPropagation()}
                          className="px-3 py-1.5 rounded-md text-xs font-semibold text-white border-2 border-transparent hover:border-gray-300 transition-all outline-none cursor-pointer"
                          style={{ backgroundColor: getBusinessColor(task.business_type) }}
                        >
                          <option value="不動産">不動産</option>
                          <option value="人材">人材</option>
                          <option value="経済圏">経済圏</option>
                          <option value="結婚相談所">結婚相談所</option>
                          <option value="コーポレート">コーポレート</option>
                          <option value="その他">その他</option>
                        </select>
                      ) : (
                        <span className="px-3 py-1.5 rounded-md text-xs font-semibold text-white" style={{ backgroundColor: getBusinessColor(undefined) }}>
                          個人
                        </span>
                      )}
                    </div>

                    {/* ステータス */}
                    <div className="col-span-2 flex items-center justify-center">
                      <select
                        value={task.status}
                        onChange={(e) => onUpdateTask(task.id, 'status', e.target.value)}
                        onClick={(e) => e.stopPropagation()}
                        className="px-3 py-1.5 rounded-md text-xs font-semibold text-white border-2 border-transparent hover:border-gray-300 transition-all outline-none cursor-pointer w-full text-center"
                        style={{ backgroundColor: statusColor(task.status) }}
                      >
                        <option value="未着手">未着手</option>
                        <option value="進行中">進行中</option>
                        <option value="完了">完了</option>
                      </select>
                    </div>

                    {/* 優先度 */}
                    <div className="col-span-1 flex items-center justify-center">
                      <select
                        value={task.priority || ''}
                        onChange={(e) => onUpdateTask(task.id, 'priority', e.target.value || undefined)}
                        onClick={(e) => e.stopPropagation()}
                        className="text-2xl cursor-pointer hover:scale-110 transition-transform outline-none bg-transparent border-none"
                        title={task.priority || '優先度なし'}
                      >
                        <option value="">⚪</option>
                        <option value="今すぐやる">🔥</option>
                        <option value="今週やる">⚡</option>
                        <option value="今月やる">📅</option>
                        <option value="高">🔴</option>
                        <option value="中">🟡</option>
                        <option value="低">🟢</option>
                      </select>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
