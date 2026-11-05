'use client';
import Link from 'next/link';
import Icon from '@/components/ui/Icon';
import { useBookmarks } from '@/store/bookmarks.store';

// the saved-problems shortcut, with how many you have saved
export default function SavedLink() {
  const n = useBookmarks((s) => s.items.length);
  return (
    <Link href="/bookmarks" className="icon-btn" aria-label={n ? `Saved problems (${n})` : 'Saved problems'}>
      <Icon name="bookmark" />
      {n ? <span className="count" aria-hidden="true">{n > 99 ? '99+' : n}</span> : null}
    </Link>
  );
}
