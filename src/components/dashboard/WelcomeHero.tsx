'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';

interface WelcomeHeroProps {
  onQuickAction?: (action: string) => void;
}

export default function WelcomeHero({ onQuickAction }: WelcomeHeroProps) {
  const [inputValue, setInputValue] = useState('');

  const currentHour = new Date().getHours();
  const greeting = currentHour < 12 ? 'おはようございます' : currentHour < 18 ? 'こんにちは' : 'こんばんは';

  const quickActions = [
    { icon: '📋', label: 'タスク追加', action: 'add-task', color: 'from-purple-400 to-pink-400' },
    { icon: '📊', label: 'レポート', action: 'report', color: 'from-blue-400 to-cyan-400' },
    { icon: '📅', label: 'カレンダー', action: 'calendar', color: 'from-green-400 to-emerald-400' },
    { icon: '⚡', label: '今すぐやる', action: 'urgent', color: 'from-orange-400 to-red-400' },
  ];

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && inputValue.trim()) {
      onQuickAction?.(`search:${inputValue}`);
      setInputValue('');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="relative overflow-hidden rounded-3xl p-8 md:p-12 mb-8"
      style={{
        background: 'linear-gradient(135deg, rgba(243, 232, 255, 0.8) 0%, rgba(252, 231, 243, 0.8) 50%, rgba(219, 234, 254, 0.8) 100%)',
        backdropFilter: 'blur(20px)',
      }}
    >
      {/* 装飾的な円 */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-purple-300/30 to-pink-300/30 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-blue-300/30 to-cyan-300/30 rounded-full blur-3xl" />

      <div className="relative z-10">
        {/* 挨拶 */}
        <motion.h1
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600 mb-2"
        >
          {greeting}、須田様
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-lg md:text-xl text-neutral-700 font-semibold mb-8"
        >
          今日は何をしますか？
        </motion.p>

        {/* レインボーボーダー入力欄 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="rainbow-border mb-8 max-w-2xl"
        >
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="タスクを検索、または新しいタスクを追加..."
            className="rainbow-border-input text-lg placeholder:text-neutral-400"
          />
        </motion.div>

        {/* クイックアクション */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="flex flex-wrap gap-3"
        >
          {quickActions.map((action, index) => (
            <motion.button
              key={action.action}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: 0.5 + index * 0.1 }}
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onQuickAction?.(action.action)}
              className={`
                flex items-center gap-2 px-6 py-3 rounded-2xl
                bg-gradient-to-r ${action.color}
                text-white font-bold shadow-lg
                transition-all duration-200
                hover:shadow-xl
              `}
            >
              <span className="text-2xl">{action.icon}</span>
              <span className="hidden md:inline">{action.label}</span>
            </motion.button>
          ))}
        </motion.div>
      </div>
    </motion.div>
  );
}
