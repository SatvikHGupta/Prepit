'use client';
import { useRef } from 'react';

// A short radio group drawn as a segmented control. Equal-width segments let a CSS-only thumb slide to the choice
// (no measuring, so it is right on the server too). Arrow keys move and select; one tab stop.
export default function Segmented({ label, options, value, onChange }) {
  const refs = useRef([]);
  const found = options.findIndex((o) => o.id === value);
  const idx = Math.max(0, found);
  function onKeyDown(e) {
    const step = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[e.key];
    if (!step) return;
    e.preventDefault();
    const next = (idx + step + options.length) % options.length;
    onChange(options[next].id);
    refs.current[next]?.focus();
  }
  return (
    <div className="seg" role="radiogroup" aria-label={label} onKeyDown={onKeyDown} style={{ '--n': options.length, '--i': idx }} data-none={found < 0 || undefined}>
      <span className="seg-thumb" aria-hidden="true" />
      {options.map((o, i) => (
        <button key={o.id} ref={(el) => { refs.current[i] = el; }} type="button" role="radio" aria-checked={o.id === value} tabIndex={i === idx ? 0 : -1} aria-label={o.aria} title={o.aria} onClick={() => onChange(o.id)}>
          {o.icon}
          {o.label !== undefined ? <span>{o.label}</span> : null}
          {o.count !== undefined ? <small>{o.count}</small> : null}
        </button>
      ))}
    </div>
  );
}
