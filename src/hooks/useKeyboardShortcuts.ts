'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface KeyboardShortcutsOptions {
  onAddTask?: () => void;
  onSearch?: () => void;
  onEscape?: () => void;
}

/**
 * キーボードショートカット
 * ⌘N: タスク追加
 * ⌘K: 検索
 * ⌘0: ダッシュボード
 * ⌘1: ボード
 * ⌘2: リスト
 * ⌘3: カレンダー
 * Escape: モーダル閉じる
 */
export function useKeyboardShortcuts(options: KeyboardShortcutsOptions = {}) {
  const router = useRouter();
  const { onAddTask, onSearch, onEscape } = options;

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const modKey = isMac ? e.metaKey : e.ctrlKey;

      // モーダルやインプット内では無効化
      const target = e.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) {
        // Escapeだけは許可
        if (e.key === 'Escape' && onEscape) {
          onEscape();
        }
        return;
      }

      // ⌘N: タスク追加
      if (modKey && e.key === 'n') {
        e.preventDefault();
        if (onAddTask) {
          onAddTask();
        }
      }

      // ⌘K: 検索
      if (modKey && e.key === 'k') {
        e.preventDefault();
        if (onSearch) {
          onSearch();
        }
      }

      // ⌘0: ダッシュボード
      if (modKey && e.key === '0') {
        e.preventDefault();
        router.push('/dashboard');
      }

      // ⌘1: ボード
      if (modKey && e.key === '1') {
        e.preventDefault();
        router.push('/board');
      }

      // ⌘2: リスト
      if (modKey && e.key === '2') {
        e.preventDefault();
        router.push('/');
      }

      // ⌘3: カレンダー
      if (modKey && e.key === '3') {
        e.preventDefault();
        router.push('/calendar');
      }

      // Escape: モーダル閉じる
      if (e.key === 'Escape' && onEscape) {
        onEscape();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [router, onAddTask, onSearch, onEscape]);
}
