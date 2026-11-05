'use client';
import Icon from '@/components/ui/Icon';
import { useBookmarks } from '@/store/bookmarks.store';

export default function BookmarkButton({ cid, label = false }) {
  const saved = useBookmarks((s) => s.items.some((i) => i.cid === cid));
  const toggle = useBookmarks((s) => s.toggle);
  const text = saved ? 'Remove from saved' : 'Save for later';
  if (label) {
    return (
      <button type="button" className="btn" aria-pressed={saved} onClick={() => toggle(cid)}>
        <Icon name="bookmark" filled={saved} />
        {saved ? 'Saved' : 'Save'}
      </button>
    );
  }
  return (
    <button type="button" className="bookmark-btn" aria-pressed={saved} aria-label={text} title={text} onClick={() => toggle(cid)}>
      <Icon name="bookmark" filled={saved} />
    </button>
  );
}
