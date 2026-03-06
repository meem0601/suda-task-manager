/**
 * Framer Motion アニメーション定義
 * Sidekick風の自然で気持ちいいアニメーション
 */

import { Variants, Transition } from 'framer-motion';

// 共通トランジション
export const transitions = {
  fast: { duration: 0.15, ease: 'easeOut' } as Transition,
  medium: { duration: 0.2, ease: 'easeOut' } as Transition,
  slow: { duration: 0.3, ease: 'easeOut' } as Transition,
  spring: { type: 'spring', stiffness: 300, damping: 30 } as Transition,
  bouncy: { type: 'spring', stiffness: 400, damping: 20 } as Transition,
};

// ページ遷移（fadeIn + slideUp）
export const pageTransition: Variants = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 },
};

// タスクカード追加（scaleIn + fadeIn）
export const cardAppear: Variants = {
  initial: { opacity: 0, scale: 0.95 },
  animate: {
    opacity: 1,
    scale: 1,
    transition: transitions.medium,
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    height: 0,
    marginBottom: 0,
    transition: { duration: 0.2, ease: 'easeIn' },
  },
};

// タスクカード削除（fadeOut + scaleOut + collapse）
export const cardRemove: Variants = {
  initial: { opacity: 1, scale: 1, height: 'auto' },
  exit: {
    opacity: 0,
    scale: 0.9,
    height: 0,
    marginBottom: 0,
    transition: { duration: 0.25, ease: 'easeInOut' },
  },
};

// モーダル開閉（overlay fadeIn + modal slideUp）
export const modalOverlay: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: transitions.medium },
  exit: { opacity: 0, transition: transitions.fast },
};

export const modalContent: Variants = {
  initial: { opacity: 0, y: 50, scale: 0.95 },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: transitions.slow,
  },
  exit: {
    opacity: 0,
    y: 30,
    scale: 0.95,
    transition: transitions.fast,
  },
};

// ドラッグ中のスタイル
export const dragStyle = {
  scale: 1.02,
  rotate: 2,
  boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
  transition: transitions.fast,
};

// ホバーアニメーション
export const hoverLift = {
  scale: 1.02,
  boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
  transition: transitions.fast,
};

// ボタンホバー
export const buttonHover = {
  scale: 1.03,
  transition: transitions.fast,
};

// ボタンタップ
export const buttonTap = {
  scale: 0.97,
};

// チェックマークアニメーション（完了時）
export const checkmark: Variants = {
  initial: { scale: 0, rotate: -180 },
  animate: {
    scale: 1,
    rotate: 0,
    transition: transitions.bouncy,
  },
};

// 数値カウントアップ用（ダッシュボード）
export const countUp = (value: number) => ({
  initial: { opacity: 0, y: 10 },
  animate: {
    opacity: 1,
    y: 0,
    transition: transitions.medium,
  },
});

// リストアイテム stagger（順番にfadeIn）
export const listContainer: Variants = {
  initial: { opacity: 0 },
  animate: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.1,
    },
  },
};

export const listItem: Variants = {
  initial: { opacity: 0, x: -10 },
  animate: {
    opacity: 1,
    x: 0,
    transition: transitions.medium,
  },
};

// 空状態のアニメーション
export const emptyState: Variants = {
  initial: { opacity: 0, scale: 0.9 },
  animate: {
    opacity: 1,
    scale: 1,
    transition: { delay: 0.2, ...transitions.slow },
  },
};

// ローディングスピナー
export const spinner: Variants = {
  animate: {
    rotate: 360,
    transition: { repeat: Infinity, duration: 1, ease: 'linear' },
  },
};

// トースト通知
export const toast: Variants = {
  initial: { opacity: 0, y: -50, scale: 0.8 },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: transitions.bouncy,
  },
  exit: {
    opacity: 0,
    y: -20,
    scale: 0.9,
    transition: transitions.fast,
  },
};

// パルス（「タスクを追加」ボタンなど）
export const pulse: Variants = {
  animate: {
    scale: [1, 1.05, 1],
    transition: {
      repeat: Infinity,
      duration: 2,
      ease: 'easeInOut',
    },
  },
};

// フェードイン（汎用）
export const fadeIn: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: transitions.medium },
  exit: { opacity: 0, transition: transitions.fast },
};

// スライドイン（左から）
export const slideInLeft: Variants = {
  initial: { opacity: 0, x: -20 },
  animate: { opacity: 1, x: 0, transition: transitions.medium },
  exit: { opacity: 0, x: -20, transition: transitions.fast },
};

// スライドイン（右から）
export const slideInRight: Variants = {
  initial: { opacity: 0, x: 20 },
  animate: { opacity: 1, x: 0, transition: transitions.medium },
  exit: { opacity: 0, x: 20, transition: transitions.fast },
};

// グラフ描画アニメーション（Recharts用）
export const chartAnimation = {
  animationDuration: 800,
  animationBegin: 0,
  animationEasing: 'ease-out' as const,
};
