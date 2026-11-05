'use client';
import { useRef } from 'react';
import Icon from '@/components/ui/Icon';

// radio group with arrow-key navigation (one tab stop); selection is shown by a thick border and a check, never by colour alone
export default function RadioGroup({ label, options, value, onChange, className = '' }) {
  const refs = useRef([]);
  const idx = Math.max(0, options.findIndex((o) => o.id === value));

  function onKeyDown(e) {
    const step = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[e.key];
    let next = null;
    if (step) next = (idx + step + options.length) % options.length;
    else if (e.key === 'Home') next = 0;
    else if (e.key === 'End') next = options.length - 1;
    if (next === null) return;
    e.preventDefault();
    onChange(options[next].id);
    refs.current[next]?.focus();
  }

  return (
    <div role="radiogroup" aria-label={label} className={`choices ${className}`} onKeyDown={onKeyDown}>
      {options.map((o, i) => {
        const on = o.id === value;
        return (
          <button
            key={o.id}
            ref={(el) => { refs.current[i] = el; }}
            type="button"
            role="radio"
            aria-checked={on}
            tabIndex={i === idx ? 0 : -1}
            className={`choice${on ? ' on' : ''}`}
            onClick={() => onChange(o.id)}
          >
            {o.color ? <span className="swatch" style={{ background: o.color, color: o.fg }}>{on ? <Icon name="check" /> : null}</span> : null}
            <span className="choice-text">
              <span className="choice-name">{o.label}</span>
              {o.hint ? <span className="choice-hint">{o.hint}</span> : null}
            </span>
            {!o.color && on ? <Icon name="check" className="choice-check" /> : null}
          </button>
        );
      })}
    </div>
  );
}
