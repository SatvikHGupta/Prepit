'use client';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

// a thin accent bar that runs while a page change is loading; it starts on a click on an internal link and finishes when the path changes
export default function NavProgress() {
  const pathname = usePathname();
  const [state, setState] = useState('idle');
  const [seen, setSeen] = useState(pathname);
  if (seen !== pathname) {
    setSeen(pathname);
    if (state === 'loading') setState('done');
  }
  useEffect(() => {
    const onClick = (e) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = e.target instanceof Element ? e.target.closest('a[href]') : null;
      if (!a || a.target === '_blank' || a.hasAttribute('download')) return;
      const url = new URL(a.href, window.location.href);
      if (url.origin !== window.location.origin || (url.pathname === window.location.pathname && url.search === window.location.search) || url.hash) return;
      setState('loading');
    };
    document.addEventListener('click', onClick);
    return () => document.removeEventListener('click', onClick);
  }, []);
  useEffect(() => {
    if (state !== 'done') return undefined;
    const t = setTimeout(() => setState('idle'), 350);
    return () => clearTimeout(t);
  }, [state]);
  return <div className="navbar" data-state={state} aria-hidden="true" />;
}
