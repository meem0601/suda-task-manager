'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Home, ArrowLeft } from 'lucide-react';
import { pageTransition, transitions } from '@/src/lib/animations';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 flex items-center justify-center p-4">
      <motion.div
        variants={pageTransition}
        initial="initial"
        animate="animate"
        className="text-center max-w-2xl"
      >
        {/* 404数字 */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, ...transitions.bouncy }}
          className="relative mb-8"
        >
          <div className="text-[180px] font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 leading-none">
            404
          </div>
          <motion.div
            animate={{
              rotate: [0, 10, -10, 10, 0],
            }}
            transition={{
              repeat: Infinity,
              duration: 3,
              ease: 'easeInOut',
            }}
            className="absolute -top-8 -right-8 text-6xl"
          >
            😵
          </motion.div>
        </motion.div>

        {/* メッセージ */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, ...transitions.medium }}
          className="text-3xl font-bold text-neutral-900 mb-4"
        >
          ページが見つかりません
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, ...transitions.medium }}
          className="text-lg text-neutral-600 mb-8"
        >
          お探しのページは削除されたか、URLが間違っている可能性があります。
        </motion.p>

        {/* ボタン */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, ...transitions.medium }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <Link href="/dashboard">
            <motion.button
              whileHover={{ scale: 1.05, boxShadow: '0 20px 40px rgba(168, 85, 247, 0.3)' }}
              whileTap={{ scale: 0.95 }}
              className="
                px-8 py-4 rounded-2xl
                bg-gradient-to-r from-purple-500 to-pink-500
                text-white font-bold text-lg
                shadow-xl
                flex items-center gap-2 justify-center
                transition-all duration-200
              "
            >
              <Home className="w-5 h-5" />
              ダッシュボードに戻る
            </motion.button>
          </Link>

          <Link href="/">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="
                px-8 py-4 rounded-2xl
                bg-white text-neutral-900 font-bold text-lg
                shadow-xl border-2 border-neutral-200
                flex items-center gap-2 justify-center
                transition-all duration-200
              "
            >
              <ArrowLeft className="w-5 h-5" />
              リストに戻る
            </motion.button>
          </Link>
        </motion.div>

        {/* 装飾的な背景要素 */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden -z-10">
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              rotate: [0, 180, 360],
            }}
            transition={{
              repeat: Infinity,
              duration: 20,
              ease: 'linear',
            }}
            className="absolute top-10 left-10 w-32 h-32 bg-purple-300/20 rounded-full blur-3xl"
          />
          <motion.div
            animate={{
              scale: [1.2, 1, 1.2],
              rotate: [360, 180, 0],
            }}
            transition={{
              repeat: Infinity,
              duration: 15,
              ease: 'linear',
            }}
            className="absolute bottom-10 right-10 w-40 h-40 bg-pink-300/20 rounded-full blur-3xl"
          />
        </div>
      </motion.div>
    </div>
  );
}
