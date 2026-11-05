'use client';
import { useState } from 'react';
import Link from 'next/link';
import { loadIndex } from '@/lib/client/index-data';
import { problemPath } from '@/lib/slug';
import { DifficultyBadge } from '@/components/ui/Badges';
import { prettify } from '@/lib/data/normalize';

const STEP = 30;

export default function MoreProblems({ cids, version, labels, total, shown }) {
  const [rows, setRows] = useState(null);
  const [n, setN] = useState(0);
  const [err, setErr] = useState(false);

  async function more() {
    setErr(false);
    try {
      let r = rows;
      if (!r) {
        const all = await loadIndex(version, labels);
        r = new Map(all.map((x) => [x.cid, x]));
        setRows(r);
      }
      setN((x) => x + STEP);
    } catch {
      setErr(true);
    }
  }
  const list = rows ? cids.slice(0, n).map((c) => rows.get(c)).filter(Boolean) : [];
  const left = cids.length - n;
  return (
    <div>
      {list.map((row) => (
        <div className="prow" key={row.cid}>
          <Link className="title" href={problemPath(row.cid, row.title)}>{row.title}</Link>
          <div className="tags">
            <DifficultyBadge value={row.difficulty} />
            <span className="badge plain">{labels.types?.[row.type] || prettify(row.type)}</span>
          </div>
        </div>
      ))}
      {err ? <p className="muted" role="alert">Could not load more problems. Try again.</p> : null}
      {left > 0 ? (
        <div className="pager">
          <button type="button" className="btn" onClick={more}>
            Show {Math.min(STEP, left)} more <span className="muted">({shown + list.length} of {Math.min(total, shown + cids.length)} best matches)</span>
          </button>
        </div>
      ) : null}
    </div>
  );
}
