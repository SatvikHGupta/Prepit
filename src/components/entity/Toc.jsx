'use client';
import { useEffect, useState } from 'react';

// "On this page" list that follows the scroll: the section you are reading is highlighted
export default function Toc({ items }) {
  const [active, setActive] = useState(items[0]?.id);
  useEffect(() => {
    const els = items.map((i) => document.getElementById(i.id)).filter(Boolean);
    if (!els.length) return undefined;
    const io = new IntersectionObserver((entries) => {
      for (const en of entries) if (en.isIntersecting) setActive(en.target.id);
    }, { rootMargin: '-15% 0px -70% 0px' });
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [items]);
  return (
    <nav className="toc" aria-label="On this page">
      <h2>On this page</h2>
      <ol>
        {items.map((t) => <li key={t.id}><a href={`#${t.id}`} aria-current={active === t.id ? 'location' : undefined}>{t.label}</a></li>)}
      </ol>
    </nav>
  );
}
