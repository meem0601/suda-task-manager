'use client';

import { ToastContainer } from './Toast';
import { useToastStore } from '@/src/stores/toastStore';

export default function ToastProvider() {
  const { toasts, removeToast } = useToastStore();

  return <ToastContainer toasts={toasts} onClose={removeToast} />;
}
