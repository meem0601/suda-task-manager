'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { toast as toastVariants, transitions } from '@/src/lib/animations';
import { CheckCircle, XCircle, Info, AlertTriangle, X } from 'lucide-react';
import { useState, useEffect } from 'react';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

interface ToastProps {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
  onClose: (id: string) => void;
  onUndo?: () => void;
}

export function Toast({
  id,
  type,
  title,
  message,
  duration = 5000,
  onClose,
  onUndo,
}: ToastProps) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(() => onClose(id), 200);
    }, duration);

    return () => clearTimeout(timer);
  }, [id, duration, onClose]);

  const configs = {
    success: {
      icon: CheckCircle,
      bgColor: 'from-green-500 to-emerald-500',
      iconColor: 'text-white',
    },
    error: {
      icon: XCircle,
      bgColor: 'from-red-500 to-rose-500',
      iconColor: 'text-white',
    },
    info: {
      icon: Info,
      bgColor: 'from-blue-500 to-cyan-500',
      iconColor: 'text-white',
    },
    warning: {
      icon: AlertTriangle,
      bgColor: 'from-orange-500 to-amber-500',
      iconColor: 'text-white',
    },
  };

  const config = configs[type];
  const Icon = config.icon;

  if (!isVisible) return null;

  return (
    <motion.div
      variants={toastVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      layout
      className={`
        relative overflow-hidden rounded-2xl shadow-2xl
        bg-gradient-to-r ${config.bgColor}
        backdrop-blur-sm
        min-w-[320px] max-w-md
        p-4
      `}
    >
      <div className="flex items-start gap-3">
        {/* アイコン */}
        <div className="flex-shrink-0 mt-0.5">
          <Icon className={`w-6 h-6 ${config.iconColor}`} strokeWidth={2.5} />
        </div>

        {/* コンテンツ */}
        <div className="flex-1 min-w-0">
          <p className="font-bold text-white">{title}</p>
          {message && (
            <p className="text-sm text-white/90 mt-1 line-clamp-2">{message}</p>
          )}
        </div>

        {/* アクションボタン */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {onUndo && (
            <motion.button
              onClick={onUndo}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className="text-xs font-bold text-white bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded-lg transition-colors"
            >
              元に戻す
            </motion.button>
          )}

          {/* 閉じるボタン */}
          <motion.button
            onClick={() => {
              setIsVisible(false);
              setTimeout(() => onClose(id), 200);
            }}
            whileHover={{ scale: 1.1, rotate: 90 }}
            whileTap={{ scale: 0.9 }}
            className="text-white/80 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" strokeWidth={2.5} />
          </motion.button>
        </div>
      </div>

      {/* プログレスバー */}
      <motion.div
        initial={{ scaleX: 1 }}
        animate={{ scaleX: 0 }}
        transition={{ duration: duration / 1000, ease: 'linear' }}
        className="absolute bottom-0 left-0 right-0 h-1 bg-white/30 origin-left"
      />
    </motion.div>
  );
}

// トースト管理用のコンテナコンポーネント
interface ToastContainerProps {
  toasts: Array<{
    id: string;
    type: ToastType;
    title: string;
    message?: string;
    onUndo?: () => void;
  }>;
  onClose: (id: string) => void;
}

export function ToastContainer({ toasts, onClose }: ToastContainerProps) {
  return (
    <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-3 pointer-events-none">
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => (
          <div key={toast.id} className="pointer-events-auto">
            <Toast {...toast} onClose={onClose} />
          </div>
        ))}
      </AnimatePresence>
    </div>
  );
}
