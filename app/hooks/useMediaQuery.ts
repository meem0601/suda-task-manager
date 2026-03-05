'use client';

import { useState, useEffect } from 'react';

export function useMediaQuery(query: string): boolean {
  // モバイルファースト: 初期値をtrueにして、クライアントで正確な値に更新
  const [matches, setMatches] = useState(true);

  useEffect(() => {
    const media = window.matchMedia(query);
    setMatches(media.matches);

    const listener = (e: MediaQueryListEvent) => {
      setMatches(e.matches);
    };

    media.addEventListener('change', listener);
    return () => media.removeEventListener('change', listener);
  }, [query]);

  return matches;
}
