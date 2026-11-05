'use client';
import { useEffect } from 'react';
import { useBookmarks } from '@/store/bookmarks.store';

// loads saved problems after mount and keeps tabs in sync
export default function BookmarksSync() {
  const load = useBookmarks((s) => s.load);
  useEffect(() => {
    load();
    const onStorage = (e) => {
      if (e.key === 'prepit:v1:bookmarks') load();
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, [load]);
  return null;
}
