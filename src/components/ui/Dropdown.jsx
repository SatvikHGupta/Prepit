'use client';
import { useEffect, useId, useMemo, useRef, useState } from 'react';
import Icon from './Icon';
import { norm } from '@/lib/search/engine';

// Shared behaviour for every menu on the site: open/close, outside click, Escape, arrow keys, one active option.
function useMenu(count, { onPick, closeOnPick, root, trigger, focusTarget }) {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const id = useId();

  const close = (refocus = true) => {
    setOpen(false);
    if (refocus) trigger.current?.focus();
  };
  useEffect(() => {
    if (!open) return undefined;
    const onDown = (e) => {
      if (!root.current?.contains(e.target)) setOpen(false);
    };
    document.addEventListener('pointerdown', onDown);
    focusTarget.current?.focus();
    return () => document.removeEventListener('pointerdown', onDown);
  }, [open, root, focusTarget]);

  const onKeyDown = (e) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      close();
    } else if (e.key === 'Tab') setOpen(false);
    else if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      if (count) setActive((a) => (a + (e.key === 'ArrowDown' ? 1 : -1) + count) % count);
    } else if (e.key === 'Home' || e.key === 'End') {
      if (e.target.tagName !== 'INPUT') {
        e.preventDefault();
        setActive(e.key === 'Home' ? 0 : Math.max(0, count - 1));
      }
    } else if (e.key === 'Enter' || (e.key === ' ' && e.target.tagName !== 'INPUT')) {
      e.preventDefault();
      onPick(active);
      if (closeOnPick) close();
    }
  };
  const onTriggerKey = (e) => {
    if (!open && (e.key === 'ArrowDown' || e.key === 'ArrowUp')) {
      e.preventDefault();
      setOpen(true);
    }
  };
  return { open, setOpen, active, setActive, id, close, onKeyDown, onTriggerKey };
}

// one choice from a short list: sort order, grouping, and so on
export function Select({ label, value, options, onChange, align = 'left' }) {
  const current = options.find((o) => o.id === value) || options[0];
  const root = useRef(null);
  const trigger = useRef(null);
  const list = useRef(null);
  const m = useMenu(options.length, { onPick: (i) => options[i] && onChange(options[i].id), closeOnPick: true, root, trigger, focusTarget: list });
  const toggle = () => {
    if (!m.open) m.setActive(Math.max(0, options.findIndex((o) => o.id === current.id)));
    m.setOpen(!m.open);
  };
  return (
    <div className="dd" ref={root}>
      <button ref={trigger} type="button" className="dd-trigger" aria-haspopup="listbox" aria-expanded={m.open} aria-controls={`${m.id}-list`} onClick={toggle} onKeyDown={m.onTriggerKey}>
        {label ? <span className="dd-label">{label}</span> : null}
        <span>{current.label}</span>
        <Icon name="chevron" className="dd-chevron" />
      </button>
      {m.open ? (
        <>
          <div className="dd-backdrop" onClick={() => m.close(false)} />
          <div className={`dd-menu${align === 'right' ? ' right' : ''}`} onKeyDown={m.onKeyDown}>
            <ul id={`${m.id}-list`} ref={list} role="listbox" tabIndex={-1} aria-label={label} aria-activedescendant={`${m.id}-o${m.active}`} className="dd-list">
              {options.map((o, i) => (
                <li key={o.id} id={`${m.id}-o${i}`} role="option" aria-selected={o.id === current.id} data-active={i === m.active} className="dd-opt" onPointerEnter={() => m.setActive(i)} onClick={() => { onChange(o.id); m.close(); }}>
                  <span>{o.label}</span>
                  {o.id === current.id ? <Icon name="check" className="dd-tick" /> : <span className="dd-tick" />}
                </li>
              ))}
            </ul>
          </div>
        </>
      ) : null}
    </div>
  );
}

const SHOWN = 60;

// several choices from a long list, with a find box and live counts: type, domain, topic, tag...
export function MultiSelect({ label, options, selected, counts, onToggle, onClear, find = false, align = 'left' }) {
  const [q, setQ] = useState('');
  const key = norm(q);
  const list = useMemo(() => {
    let l = options.map((o) => ({ ...o, n: counts?.get(o.id) ?? null }));
    if (key) l = l.filter((o) => norm(o.label).includes(key));
    // selected first, then by count, empty options last and dimmed
    l.sort((a, b) => (selected.includes(b.id) - selected.includes(a.id)) || ((b.n || 0) - (a.n || 0)) || a.label.localeCompare(b.label));
    return l;
  }, [options, counts, key, selected]);
  const shown = key ? list.slice(0, 200) : list.slice(0, SHOWN);
  const root = useRef(null);
  const trigger = useRef(null);
  const findBox = useRef(null);
  const listBox = useRef(null);
  const m = useMenu(shown.length, { onPick: (i) => shown[i] && onToggle(shown[i].id), closeOnPick: false, root, trigger, focusTarget: find ? findBox : listBox });
  const picked = selected.length;
  const toggle = () => {
    if (!m.open) {
      setQ('');
      m.setActive(0);
    }
    m.setOpen(!m.open);
  };
  return (
    <div className="dd" ref={root}>
      <button ref={trigger} type="button" className={`dd-trigger${picked ? ' has-value' : ''}`} aria-haspopup="listbox" aria-expanded={m.open} aria-controls={`${m.id}-list`} onClick={toggle} onKeyDown={m.onTriggerKey}>
        <span>{label}</span>
        {picked ? <span className="dd-count">{picked}</span> : null}
        <Icon name="chevron" className="dd-chevron" />
      </button>
      {m.open ? (
        <>
          <div className="dd-backdrop" onClick={() => m.close(false)} />
          <div className={`dd-menu${align === 'right' ? ' right' : ''}`} onKeyDown={m.onKeyDown}>
            {find ? (
              <input ref={findBox} className="dd-find" type="search" role="combobox" aria-expanded="true" aria-controls={`${m.id}-list`} aria-activedescendant={shown.length ? `${m.id}-o${m.active}` : undefined} value={q} onChange={(e) => { setQ(e.target.value); m.setActive(0); }} placeholder={`Find ${label.toLowerCase()}`} aria-label={`Find ${label.toLowerCase()}`} />
            ) : null}
            <ul id={`${m.id}-list`} ref={listBox} role="listbox" tabIndex={find ? undefined : -1} aria-label={label} aria-multiselectable="true" aria-activedescendant={find ? undefined : `${m.id}-o${m.active}`} className="dd-list">
              {shown.map((o, i) => {
                const on = selected.includes(o.id);
                return (
                  <li key={o.id} id={`${m.id}-o${i}`} role="option" aria-selected={on} data-active={i === m.active} className={`dd-opt${o.n === 0 && !on ? ' zero' : ''}`} onPointerEnter={() => m.setActive(i)} onClick={() => onToggle(o.id)}>
                    <span className="dd-box">{on ? <Icon name="check" /> : null}</span>
                    <span>{o.label}</span>
                    {o.n !== null ? <span className="n">{o.n.toLocaleString('en-US')}</span> : null}
                  </li>
                );
              })}
            </ul>
            {!shown.length ? <p className="dd-empty">Nothing matches.</p> : null}
            <div className="dd-foot">
              <span>{!key && list.length > SHOWN ? `Top ${SHOWN} of ${list.length}. Type to find the rest.` : `${picked} selected`}</span>
              {picked ? <button type="button" className="link-btn" onClick={onClear}>Clear</button> : <button type="button" className="link-btn" onClick={() => m.close()}>Done</button>}
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}
