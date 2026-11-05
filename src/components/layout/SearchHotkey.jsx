'use client';
import { useEffect } from 'react';

// "/" jumps to the header search, the way most docs sites do; typing in a field is left alone
export default function SearchHotkey() {
  useEffect(() => {
    const onKey = (e) => {
      if (e.key !== '/' || e.metaKey || e.ctrlKey || e.altKey) return;
      const t = e.target;
      if (t instanceof HTMLElement && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName))) return;
      const box = document.querySelector('#explorer-search') || document.querySelector('#site-search');
      if (!box) return;
      e.preventDefault();
      box.focus();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);
  return null;
}
