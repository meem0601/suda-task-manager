import { create } from 'zustand';
import { ToastType } from '@/src/components/common/Toast';

interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  onUndo?: () => void;
}

interface ToastStore {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;
  clearAll: () => void;
}

export const useToastStore = create<ToastStore>((set) => ({
  toasts: [],

  addToast: (toast) => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    set((state) => ({
      toasts: [...state.toasts, { ...toast, id }],
    }));
  },

  removeToast: (id) => {
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    }));
  },

  clearAll: () => {
    set({ toasts: [] });
  },
}));

// ヘルパー関数
export const toast = {
  success: (title: string, message?: string, onUndo?: () => void) => {
    useToastStore.getState().addToast({ type: 'success', title, message, onUndo });
  },
  error: (title: string, message?: string) => {
    useToastStore.getState().addToast({ type: 'error', title, message });
  },
  info: (title: string, message?: string) => {
    useToastStore.getState().addToast({ type: 'info', title, message });
  },
  warning: (title: string, message?: string) => {
    useToastStore.getState().addToast({ type: 'warning', title, message });
  },
};
