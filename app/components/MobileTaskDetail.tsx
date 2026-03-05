'use client';

import { useState } from 'react';
import { Task, Subtask } from '@/lib/supabase';

interface MobileTaskDetailProps {
  task: Task;
  subtasks: Subtask[];
  onClose: () => void;
  onUpdateField: (taskId: string, field: string, value: any) => void;
  onAddSubtask: (title: string) => void;
  onToggleSubtask: (subtask: Subtask) => void;
  onGenerateAI: () => void;
}

export default function MobileTaskDetail({
  task,
  subtasks,
  onClose,
  onUpdateField,
  onAddSubtask,
  onToggleSubtask,
  onGenerateAI
}: MobileTaskDetailProps) {
  const [localTask, setLocalTask] = useState(task);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');

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

  const handleAddSubtask = () => {
    if (newSubtaskTitle.trim()) {
      onAddSubtask(newSubtaskTitle);
      setNewSubtaskTitle('');
    }
  };

  return (
    <div className="fixed inset-0 bg-white z-50 overflow-y-auto">
      {/* ヘッダー */}
      <div className="sticky top-0 bg-white border-b border-gray-200 px-4 py-3 z-10">
        <div className="flex items-center justify-between">
          <button
            onClick={onClose}
            className="text-blue-600 font-medium text-lg"
          >
            ← 戻る
          </button>
          <h2 className="text-lg font-bold text-gray-900">詳細</h2>
          <div className="w-12" /> {/* スペーサー */}
        </div>
      </div>

      {/* コンテンツ */}
      <div className="p-4 space-y-6">
        {/* タイトル */}
        <div>
          <input
            type="text"
            value={localTask.title}
            onChange={(e) => setLocalTask({ ...localTask, title: e.target.value })}
            onBlur={() => onUpdateField(localTask.id, 'title', localTask.title)}
            className="text-xl font-bold text-gray-900 mb-4 w-full border-0 border-b-2 border-transparent hover:border-gray-300 focus:border-indigo-500 outline-none"
          />
          
          <div className="flex flex-wrap gap-2">
            <select
              value={localTask.category}
              onChange={(e) => onUpdateField(localTask.id, 'category', e.target.value)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium cursor-pointer ${
                localTask.category === '個人' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
              }`}
            >
              <option value="個人">個人</option>
              <option value="事業">事業</option>
            </select>

            {localTask.category === '事業' && (
              <select
                value={localTask.business_type || ''}
                onChange={(e) => onUpdateField(localTask.id, 'business_type', e.target.value || undefined)}
                className="px-3 py-1.5 rounded-full text-sm font-medium text-white cursor-pointer"
                style={{ backgroundColor: getBusinessColor(localTask.business_type) }}
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
              value={localTask.priority || ''}
              onChange={(e) => onUpdateField(localTask.id, 'priority', e.target.value || undefined)}
              className={`w-full px-3 py-2 rounded-md text-sm font-medium cursor-pointer ${priorityColor(localTask.priority)}`}
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
              value={localTask.status}
              onChange={(e) => onUpdateField(localTask.id, 'status', e.target.value)}
              className={`w-full px-3 py-2 rounded-md text-sm font-medium border ${statusColor(localTask.status)} cursor-pointer`}
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
            value={localTask.due_date ? localTask.due_date.split('T')[0] : ''}
            onChange={(e) => onUpdateField(localTask.id, 'due_date', e.target.value || null)}
            className={`w-full px-3 py-2 border rounded-lg ${
              isOverdue(localTask) ? 'border-red-500 bg-red-50' : 'border-gray-300 bg-white'
            }`}
          />
          {isOverdue(localTask) && (
            <p className="text-xs text-red-600 mt-1">⚠️ 期限を過ぎています</p>
          )}
        </div>

        {/* 説明 */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">説明</label>
          <textarea
            value={localTask.description || ''}
            onChange={(e) => setLocalTask({ ...localTask, description: e.target.value })}
            onBlur={() => onUpdateField(localTask.id, 'description', localTask.description)}
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
              onClick={onGenerateAI}
              className="text-xs px-3 py-1.5 bg-blue-600 text-white rounded-lg active:bg-blue-700"
            >
              {localTask.ai_suggestion ? '再生成' : '✨ AI提案を生成'}
            </button>
          </div>
          {localTask.ai_suggestion && (
            <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded">
              <p className="text-sm text-blue-900">
                <span className="font-semibold">💡 最初の一歩:</span> {localTask.ai_suggestion}
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
              <label key={subtask.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded cursor-pointer active:bg-gray-100">
                <input
                  type="checkbox"
                  checked={subtask.completed}
                  onChange={() => onToggleSubtask(subtask)}
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
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg active:bg-indigo-700 text-sm font-medium"
            >
              追加
            </button>
          </div>
        </div>

        {/* 作成日 */}
        <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded">
          作成日: {new Date(localTask.created_at).toLocaleString('ja-JP')}
          {localTask.completed_at && (
            <><br/>完了日: {new Date(localTask.completed_at).toLocaleString('ja-JP')}</>
          )}
        </div>
      </div>
    </div>
  );
}
