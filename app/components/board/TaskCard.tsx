'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Task } from '@/src/lib/types';
import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import { cardAppear, modalOverlay, modalContent, transitions } from '@/src/lib/animations';

interface TaskCardProps {
  task: Task;
  isDragging?: boolean;
  onRefresh?: () => void;
}

export default function TaskCard({ task, isDragging = false, onRefresh }: TaskCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging,
  } = useSortable({ id: task.id });

  const [showDetail, setShowDetail] = useState(false);

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isSortableDragging ? 0.5 : 1,
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

  const priorityEmoji = (priority?: string) => {
    switch (priority) {
      case '今すぐやる': return '🔥';
      case '今週やる': return '⚡';
      case '今月やる': return '📅';
      case '緊急': return '🚨';
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

  const handleDelete = async () => {
    if (!confirm('このタスクを削除しますか？')) return;

    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', task.id);

    if (!error && onRefresh) {
      onRefresh();
    }
  };

  return (
    <>
      <motion.div
        ref={setNodeRef}
        style={style}
        {...attributes}
        {...listeners}
        variants={cardAppear}
        initial="initial"
        animate="animate"
        exit="exit"
        whileHover={{ 
          scale: 1.02, 
          boxShadow: '0 10px 30px rgba(0,0,0,0.12)',
          transition: transitions.fast 
        }}
        whileTap={{ scale: 0.98 }}
        className={`
          card cursor-grab active:cursor-grabbing p-4 group
          ${isOverdue(task) ? 'border-red-400 bg-red-50' : ''}
          ${isSortableDragging ? 'shadow-2xl rotate-2' : ''}
        `}
        onClick={(e) => {
          if ((e.target as HTMLElement).tagName !== 'BUTTON') {
            setShowDetail(true);
          }
        }}
      >
        {/* カラーバー */}
        <div
          className="h-1 w-full rounded-full mb-3"
          style={{ backgroundColor: getBusinessColor(task.business_type) }}
        />

        {/* タイトル */}
        <h3 className="font-bold text-neutral-900 mb-2 line-clamp-2">
          {task.title}
        </h3>

        {/* 説明 */}
        {task.description && (
          <p className="text-sm text-neutral-600 mb-3 line-clamp-2">
            {task.description}
          </p>
        )}

        {/* メタ情報 */}
        <div className="flex flex-wrap gap-2 items-center">
          {task.priority && (
            <span className="text-xl" title={task.priority}>
              {priorityEmoji(task.priority)}
            </span>
          )}
          {task.due_date && (
            <span
              className={`badge text-xs ${
                isOverdue(task) ? 'badge-danger' : 'badge-neutral'
              }`}
            >
              📅 {new Date(task.due_date).toLocaleDateString('ja-JP', {
                month: 'short',
                day: 'numeric',
              })}
            </span>
          )}
          {task.business_type && (
            <span
              className="badge text-xs text-white font-semibold"
              style={{ backgroundColor: getBusinessColor(task.business_type) }}
            >
              {task.business_type}
            </span>
          )}
        </div>

        {/* ホバー時の操作ボタン */}
        <div className="opacity-0 group-hover:opacity-100 transition-opacity mt-3 pt-3 border-t border-neutral-200 flex gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowDetail(true);
            }}
            className="btn-sm btn-secondary flex-1"
          >
            詳細
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleDelete();
            }}
            className="btn-sm btn-danger"
          >
            削除
          </button>
        </div>
      </motion.div>

      {/* 詳細モーダル（簡易版） */}
      <AnimatePresence>
        {showDetail && (
          <motion.div
            variants={modalOverlay}
            initial="initial"
            animate="animate"
            exit="exit"
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={() => setShowDetail(false)}
          >
            <motion.div
              variants={modalContent}
              initial="initial"
              animate="animate"
              exit="exit"
              className="bg-white rounded-2xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
            <div className="flex items-start justify-between mb-4">
              <h2 className="text-2xl font-bold text-neutral-900">{task.title}</h2>
              <button
                onClick={() => setShowDetail(false)}
                className="btn-ghost p-2"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              {task.description && (
                <div>
                  <label className="block text-sm font-semibold text-neutral-700 mb-1">説明</label>
                  <p className="text-neutral-900 whitespace-pre-wrap">{task.description}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-neutral-700 mb-1">ステータス</label>
                  <p className="text-neutral-900">{task.status}</p>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-neutral-700 mb-1">優先度</label>
                  <p className="text-neutral-900">
                    {task.priority ? `${priorityEmoji(task.priority)} ${task.priority}` : 'なし'}
                  </p>
                </div>
              </div>

              {task.due_date && (
                <div>
                  <label className="block text-sm font-semibold text-neutral-700 mb-1">期限</label>
                  <p className={`text-neutral-900 ${isOverdue(task) ? 'text-red-600 font-bold' : ''}`}>
                    {new Date(task.due_date).toLocaleDateString('ja-JP', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                    {isOverdue(task) && ' ⚠️ 期限切れ'}
                  </p>
                </div>
              )}

              {task.business_type && (
                <div>
                  <label className="block text-sm font-semibold text-neutral-700 mb-1">事業種別</label>
                  <span
                    className="badge text-white font-semibold"
                    style={{ backgroundColor: getBusinessColor(task.business_type) }}
                  >
                    {task.business_type}
                  </span>
                </div>
              )}

              <div className="pt-4 flex gap-2">
                <button
                  onClick={() => {
                    setShowDetail(false);
                    window.location.href = `/?task=${task.id}`;
                  }}
                  className="btn btn-primary flex-1"
                >
                  詳細編集
                </button>
                <button
                  onClick={() => setShowDetail(false)}
                  className="btn btn-secondary"
                >
                  閉じる
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
