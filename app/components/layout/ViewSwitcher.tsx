'use client';

import { usePathname, useRouter } from 'next/navigation';

export type ViewMode = 'dashboard' | 'list' | 'board' | 'calendar';

interface ViewSwitcherProps {
  className?: string;
}

export default function ViewSwitcher({ className = '' }: ViewSwitcherProps) {
  const pathname = usePathname();
  const router = useRouter();

  const views: Array<{ id: ViewMode; icon: string; label: string; path: string }> = [
    { id: 'dashboard', icon: '📊', label: 'ダッシュボード', path: '/dashboard' },
    { id: 'list', icon: '📋', label: 'リスト', path: '/' },
    { id: 'board', icon: '📌', label: 'ボード', path: '/board' },
    { id: 'calendar', icon: '📅', label: 'カレンダー', path: '/calendar' },
  ];

  const currentView =
    views.find((v) => pathname === v.path)?.id || 'list';

  return (
    <div className={`flex items-center gap-2 bg-white/90 backdrop-blur-sm rounded-2xl border-2 border-neutral-200 p-2 ${className}`}>
      {views.map((view) => (
        <button
          key={view.id}
          onClick={() => router.push(view.path)}
          className={`
            flex items-center gap-2 px-4 py-2 rounded-xl font-semibold transition-all
            ${
              currentView === view.id
                ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                : 'text-neutral-700 hover:bg-neutral-100'
            }
          `}
        >
          <span className="text-xl">{view.icon}</span>
          <span className="hidden md:inline">{view.label}</span>
        </button>
      ))}
    </div>
  );
}
