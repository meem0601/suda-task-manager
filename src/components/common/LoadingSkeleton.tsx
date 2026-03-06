'use client';

import { motion } from 'framer-motion';

interface LoadingSkeletonProps {
  type?: 'card' | 'list' | 'dashboard' | 'board';
  count?: number;
}

export default function LoadingSkeleton({ type = 'card', count = 3 }: LoadingSkeletonProps) {
  // パルスアニメーション
  const pulseAnimation = {
    opacity: [0.5, 0.8, 0.5],
    transition: {
      repeat: Infinity,
      duration: 1.5,
      ease: 'easeInOut' as const,
    },
  };

  // カードスケルトン
  if (type === 'card') {
    return (
      <div className="space-y-3">
        {Array.from({ length: count }).map((_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="card p-4 bg-white/80"
          >
            {/* カラーバー */}
            <motion.div
              animate={pulseAnimation}
              className="h-1 w-full bg-neutral-200 rounded-full mb-3"
            />

            {/* タイトル */}
            <motion.div
              animate={pulseAnimation}
              className="h-5 bg-neutral-200 rounded-lg mb-3 w-3/4"
            />

            {/* 説明 */}
            <motion.div
              animate={pulseAnimation}
              className="h-4 bg-neutral-200 rounded-lg mb-2 w-full"
            />
            <motion.div
              animate={pulseAnimation}
              className="h-4 bg-neutral-200 rounded-lg mb-4 w-5/6"
            />

            {/* メタ情報 */}
            <div className="flex gap-2">
              <motion.div
                animate={pulseAnimation}
                className="h-6 w-16 bg-neutral-200 rounded-full"
              />
              <motion.div
                animate={pulseAnimation}
                className="h-6 w-20 bg-neutral-200 rounded-full"
              />
            </div>
          </motion.div>
        ))}
      </div>
    );
  }

  // リストスケルトン
  if (type === 'list') {
    return (
      <div className="space-y-2">
        {Array.from({ length: count }).map((_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
            className="flex items-center gap-3 p-4 bg-white/80 rounded-xl"
          >
            {/* チェックボックス */}
            <motion.div
              animate={pulseAnimation}
              className="w-5 h-5 bg-neutral-200 rounded"
            />

            {/* タイトル */}
            <motion.div
              animate={pulseAnimation}
              className="h-4 bg-neutral-200 rounded-lg flex-1"
            />

            {/* バッジ */}
            <motion.div
              animate={pulseAnimation}
              className="h-6 w-16 bg-neutral-200 rounded-full"
            />
          </motion.div>
        ))}
      </div>
    );
  }

  // ダッシュボードスケルトン
  if (type === 'dashboard') {
    return (
      <div className="space-y-6">
        {/* 統計カード */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="rounded-2xl p-6 bg-white/80 border border-white/50 shadow-lg"
            >
              <div className="flex items-center justify-between mb-4">
                <motion.div
                  animate={pulseAnimation}
                  className="w-12 h-12 bg-neutral-200 rounded-2xl"
                />
                <motion.div
                  animate={pulseAnimation}
                  className="h-10 w-16 bg-neutral-200 rounded-lg"
                />
              </div>
              <motion.div
                animate={pulseAnimation}
                className="h-4 bg-neutral-200 rounded-lg w-24"
              />
            </motion.div>
          ))}
        </div>

        {/* グラフエリア */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="rounded-2xl p-6 bg-white/80 border border-white/50 shadow-lg"
        >
          <motion.div
            animate={pulseAnimation}
            className="h-6 bg-neutral-200 rounded-lg w-48 mb-4"
          />
          <motion.div
            animate={pulseAnimation}
            className="h-64 bg-neutral-200 rounded-xl"
          />
        </motion.div>
      </div>
    );
  }

  // ボードスケルトン
  if (type === 'board') {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white/80 rounded-2xl p-4 border-2 border-neutral-200"
          >
            {/* ヘッダー */}
            <motion.div
              animate={pulseAnimation}
              className="h-12 bg-neutral-200 rounded-xl mb-4"
            />

            {/* カード */}
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, j) => (
                <motion.div
                  key={j}
                  animate={pulseAnimation}
                  className="h-32 bg-neutral-200 rounded-xl"
                />
              ))}
            </div>
          </motion.div>
        ))}
      </div>
    );
  }

  return null;
}
