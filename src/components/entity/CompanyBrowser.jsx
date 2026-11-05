'use client';
import { useMemo, useState } from 'react';
import Link from 'next/link';
import Icon from '@/components/ui/Icon';
import { Select } from '@/components/ui/Dropdown';
import Switch from '@/components/ui/Switch';
import { norm } from '@/lib/search/engine';

const SORTS = [
  { id: 'reports', label: 'Most reports' },
  { id: 'name', label: 'A to Z' },
];
const letterOf = (name) => (/^[a-z]/i.test(name) ? name[0].toUpperCase() : '#');

// every company: find, sort, hide thin ones, and an A-Z rail when listing by name
export default function CompanyBrowser({ companies }) {
  const [q, setQ] = useState('');
  const [sort, setSort] = useState('reports');
  const [skipThin, setSkipThin] = useState(false);

  const list = useMemo(() => {
    const key = norm(q);
    let out = companies.filter((c) => (!key || norm(c.name).includes(key) || c.id.includes(key)) && !(skipThin && c.low_data));
    out = out.slice().sort(sort === 'name' ? (a, b) => a.name.localeCompare(b.name) : (a, b) => b.n_reports - a.n_reports || a.name.localeCompare(b.name));
    return out;
  }, [companies, q, sort, skipThin]);

  const byLetter = useMemo(() => {
    if (sort !== 'name') return null;
    const m = new Map();
    for (const c of list) m.set(letterOf(c.name), [...(m.get(letterOf(c.name)) || []), c]);
    return m;
  }, [list, sort]);

  const row = (c) => (
    <li key={c.id}>
      <Link href={`/companies/${c.id}`}>
        <span>{c.name}{c.low_data ? <span className="tag">few reports</span> : null}</span>
        <span className="n">{c.n_reports.toLocaleString('en-US')}</span>
      </Link>
    </li>
  );
  const letters = [...'ABCDEFGHIJKLMNOPQRSTUVWXYZ#'];

  return (
    <div>
      <div className="tools">
        <label className="field">
          <Icon name="search" />
          <span className="sr-only">Find a company</span>
          <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Find a company" autoComplete="off" />
        </label>
        <Select label="Sort" value={sort} options={SORTS} onChange={setSort} />
        <Switch checked={skipThin} onChange={setSkipThin}>Hide companies with few reports</Switch>
        <span className="count" aria-live="polite">{list.length.toLocaleString('en-US')} {list.length === 1 ? 'company' : 'companies'}</span>
      </div>
      {byLetter ? (
        <>
          <ul className="alpha" aria-label="Jump to letter">
            {letters.map((l) => <li key={l}>{byLetter.has(l) ? <a href={`#az-${l === '#' ? 'other' : l}`}>{l}</a> : <span aria-hidden="true">{l}</span>}</li>)}
          </ul>
          {[...byLetter.entries()].map(([l, items]) => (
            <section className="az-group" id={`az-${l === '#' ? 'other' : l}`} key={l}>
              <h3>{l}</h3>
              <ul className="index cols-3">{items.map(row)}</ul>
            </section>
          ))}
        </>
      ) : (
        <ul className="index cols-3">{list.map(row)}</ul>
      )}
      {!list.length ? <p className="empty">No company matches that name.</p> : null}
    </div>
  );
}
