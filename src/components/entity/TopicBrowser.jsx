'use client';
import { useMemo, useState } from 'react';
import Link from 'next/link';
import Icon from '@/components/ui/Icon';
import { Select } from '@/components/ui/Dropdown';
import { norm } from '@/lib/search/engine';

const SORTS = [
  { id: 'problems', label: 'Most problems' },
  { id: 'reports', label: 'Most reported' },
  { id: 'name', label: 'A to Z' },
];
const n0 = (v) => Number(v || 0).toLocaleString('en-US');

// topics grouped by domain, with a find box, a sort order and a side list to jump between domains
export default function TopicBrowser({ domains, topics }) {
  const [q, setQ] = useState('');
  const [sort, setSort] = useState('problems');
  const groups = useMemo(() => {
    const key = norm(q);
    const by = { problems: (a, b) => b.n_problems - a.n_problems, reports: (a, b) => b.n_reports - a.n_reports, name: (a, b) => a.label.localeCompare(b.label) }[sort];
    return domains
      .map((d) => ({ ...d, topics: topics.filter((t) => t.domain === d.id && (!key || norm(t.label).includes(key))).sort(by) }))
      .filter((d) => d.topics.length);
  }, [domains, topics, q, sort]);
  const shown = groups.reduce((n, g) => n + g.topics.length, 0);
  const max = Math.max(1, ...topics.map((t) => t.n_problems));
  return (
    <div className="browse">
      <nav className="rail" aria-label="Domains">
        <ol>
          {groups.map((g) => <li key={g.id}><a href={`#d-${g.id}`}>{g.label} <span>{g.topics.length}</span></a></li>)}
        </ol>
      </nav>
      <div>
        <div className="tools">
          <label className="field">
            <Icon name="search" />
            <span className="sr-only">Find a topic</span>
            <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Find a topic" autoComplete="off" />
          </label>
          <Select label="Sort" value={sort} options={SORTS} onChange={setSort} />
          <span className="count" aria-live="polite">{shown} {shown === 1 ? 'topic' : 'topics'}</span>
        </div>
        {groups.map((g) => (
          <section className="domain-block" id={`d-${g.id}`} key={g.id}>
            <header>
              <h2><Link href={`/domains/${g.id}`}>{g.label}</Link></h2>
              <span className="muted small">{n0(g.n_problems)} problems</span>
            </header>
            {g.topics.map((t) => (
              <Link key={t.id} href={`/topics/${t.id}`} className="topic-row">
                <span className="name">{t.label}</span>
                <span className="bar" aria-hidden="true"><i style={{ width: `${Math.max(3, (t.n_problems / max) * 100)}%` }} /></span>
                <span className="n">{n0(t.n_problems)}</span>
              </Link>
            ))}
          </section>
        ))}
        {!groups.length ? <p className="empty">No topic matches that.</p> : null}
      </div>
    </div>
  );
}
