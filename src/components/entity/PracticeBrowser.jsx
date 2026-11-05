'use client';
import { useMemo, useState } from 'react';
import Link from 'next/link';
import Segmented from '@/components/ui/Segmented';
import { Select } from '@/components/ui/Dropdown';
import { DifficultyBadge } from '@/components/ui/Badges';
import { loadIndex } from '@/lib/client/index-data';
import { problemPath } from '@/lib/slug';
import { prettify } from '@/lib/data/normalize';

const STEP = 30;
const DIFFS = [{ id: 'any', label: 'Any' }, { id: 'easy', label: 'Easy' }, { id: 'medium', label: 'Medium' }, { id: 'hard', label: 'Hard' }];

// The first rows arrive as plain links in the page. Filtering or "show more" loads the rest from the same index the search page uses.
export default function PracticeBrowser({ head, rest, version, labels, total, typeOptions }) {
  const [diff, setDiff] = useState('any');
  const [type, setType] = useState('all');
  const [all, setAll] = useState(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState(false);
  const [limit, setLimit] = useState(head.length);

  async function ensure() {
    if (all || loading) return;
    setLoading(true);
    setErr(false);
    try {
      const idx = await loadIndex(version, labels);
      setAll(new Map(idx.map((x) => [x.cid, x])));
    } catch {
      setErr(true);
    } finally {
      setLoading(false);
    }
  }
  const pool = useMemo(() => (all ? [...head, ...rest.map((c) => all.get(c)).filter(Boolean)] : head), [head, rest, all]);
  const list = useMemo(() => pool.filter((r) => (diff === 'any' || r.difficulty === diff) && (type === 'all' || r.type === type)), [pool, diff, type]);
  const filtering = diff !== 'any' || type !== 'all';
  const waiting = filtering && !all && rest.length > 0;
  const shown = list.slice(0, limit);
  const canMore = list.length > limit || (!all && rest.length > 0);

  const pick = (setter) => (v) => {
    setter(v);
    setLimit(head.length);
    ensure();
  };
  const more = async () => {
    await ensure();
    setLimit((n) => n + STEP);
  };

  return (
    <div>
      <div className="tools">
        <Segmented label="Difficulty" options={DIFFS} value={diff} onChange={pick(setDiff)} />
        {typeOptions.length > 1 ? <Select label="Type" value={type} options={[{ id: 'all', label: 'All types' }, ...typeOptions]} onChange={pick(setType)} /> : null}
        <span className="count" aria-live="polite">{waiting || loading ? 'Loading…' : `${list.length.toLocaleString('en-US')} of ${Math.min(total, head.length + rest.length).toLocaleString('en-US')} best matches`}</span>
      </div>
      <div className="practice-list">
        {shown.map((row) => (
          <div className="prow" key={row.cid}>
            <Link className="title" href={problemPath(row.cid, row.title)}>{row.title}</Link>
            <div className="tags">
              <DifficultyBadge value={row.difficulty} />
              <span className="badge plain">{labels.types?.[row.type] || prettify(row.type)}</span>
            </div>
          </div>
        ))}
      </div>
      {!waiting && !loading && filtering && !list.length ? <p className="empty">Nothing in this set matches those filters.</p> : null}
      {err ? <p className="muted" role="alert">Could not load more problems. Try again.</p> : null}
      {canMore && !waiting ? (
        <div className="pager">
          <button type="button" className="btn" onClick={more} disabled={loading}>{loading ? 'Loading…' : `Show ${STEP} more`}</button>
        </div>
      ) : null}
    </div>
  );
}
