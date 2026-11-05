'use client';
import { useRef, useState } from 'react';
import Link from 'next/link';

const n0 = (v) => Number(v || 0).toLocaleString('en-US');

// Domains on the left, the topics of the chosen domain on the right. Every panel is in the page (inactive ones are only hidden),
// so all the topic links are still there for search engines and for people without JavaScript to find.
export default function DomainExplorer({ domains }) {
  const [active, setActive] = useState(domains[0]?.id);
  const tabs = useRef([]);
  const idx = Math.max(0, domains.findIndex((d) => d.id === active));

  function onKeyDown(e) {
    const step = { ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 }[e.key];
    let next = null;
    if (step) next = (idx + step + domains.length) % domains.length;
    else if (e.key === 'Home') next = 0;
    else if (e.key === 'End') next = domains.length - 1;
    if (next === null) return;
    e.preventDefault();
    setActive(domains[next].id);
    tabs.current[next]?.focus();
  }

  return (
    <div className="dx">
      <div className="dx-tabs" role="tablist" aria-orientation="vertical" aria-label="Domains" onKeyDown={onKeyDown}>
        {domains.map((d, i) => (
          <button key={d.id} ref={(el) => { tabs.current[i] = el; }} type="button" role="tab" id={`dx-t-${d.id}`} aria-selected={d.id === active} aria-controls={`dx-p-${d.id}`} tabIndex={d.id === active ? 0 : -1} onClick={() => setActive(d.id)}>
            <span className="dx-name">{d.label}</span>
            <span className="dx-n">{n0(d.n_problems)}</span>
          </button>
        ))}
      </div>
      <div className="dx-panels">
        {domains.map((d) => {
          const max = Math.max(1, ...d.topics.map((t) => t.n_problems));
          return (
            <div key={d.id} role="tabpanel" id={`dx-p-${d.id}`} aria-labelledby={`dx-t-${d.id}`} hidden={d.id !== active} className="dx-panel">
              <header>
                <div>
                  <h3>{d.label}</h3>
                  <p>{n0(d.n_problems)} problems across {d.topic_count} topics</p>
                </div>
                <Link href={`/domains/${d.id}`} className="btn btn-sm">Open domain</Link>
              </header>
              <ul className="dx-topics">
                {d.topics.map((t) => (
                  <li key={t.id}>
                    <Link href={`/topics/${t.id}`}>
                      <span className="name">{t.label}</span>
                      <span className="bar" aria-hidden="true"><i style={{ width: `${Math.max(3, (t.n_problems / max) * 100)}%` }} /></span>
                      <span className="n">{n0(t.n_problems)}</span>
                    </Link>
                  </li>
                ))}
              </ul>
              {d.topic_count > d.topics.length ? <p className="dx-more"><Link href={`/domains/${d.id}`}>and {d.topic_count - d.topics.length} more in this domain</Link></p> : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}
