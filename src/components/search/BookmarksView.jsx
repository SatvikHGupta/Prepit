'use client';
import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import Icon from '@/components/ui/Icon';
import { ListItem } from './ResultCard';
import { loadIndex } from '@/lib/client/index-data';
import { useBookmarks } from '@/store/bookmarks.store';

export default function BookmarksView({ version, labels }) {
  const { items, ready, persisted, clear, importCids } = useBookmarks();
  const [rows, setRows] = useState(null);
  const [error, setError] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const [note, setNote] = useState('');
  const fileRef = useRef(null);

  useEffect(() => {
    let alive = true;
    loadIndex(version, labels)
      .then((r) => alive && setRows(new Map(r.map((x) => [x.cid, x]))))
      .catch(() => alive && setError(true));
    return () => {
      alive = false;
    };
  }, [version, labels]);

  const list = useMemo(() => (rows ? items.map((i) => rows.get(i.cid) || { cid: i.cid, missing: true }) : []), [items, rows]);

  function exportJson() {
    const blob = new Blob([JSON.stringify({ v: 1, items }, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'prepit-saved.json';
    a.click();
    URL.revokeObjectURL(a.href);
  }
  async function onImport(e) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    try {
      const j = JSON.parse(await file.text());
      const cids = (Array.isArray(j) ? j : j.items || []).map((x) => (typeof x === 'string' ? x : x?.cid));
      setNote(`${importCids(cids)} problems added.`);
    } catch {
      setNote('That file could not be read.');
    }
  }

  if (!ready) return <p className="muted" aria-busy="true">Loading your saved problems…</p>;
  return (
    <div>
      {!persisted ? <div className="callout warn" role="status"><strong>Saving is blocked in this browser</strong><p>Your saved problems will be lost when you close this tab.</p></div> : null}
      <div className="tools">
        <p className="count" style={{ margin: 0 }} aria-live="polite">{items.length.toLocaleString('en-US')} saved</p>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button type="button" className="btn" onClick={exportJson} disabled={!items.length}><Icon name="download" /> Export</button>
          <button type="button" className="btn" onClick={() => fileRef.current?.click()}>Import</button>
          <input ref={fileRef} type="file" accept="application/json,.json" onChange={onImport} className="sr-only" tabIndex={-1} aria-label="Import saved problems from a file" />
          {items.length ? (
            confirm ? (
              <button type="button" className="btn" onClick={() => { clear(); setConfirm(false); }}>Confirm clear all</button>
            ) : (
              <button type="button" className="btn btn-ghost" onClick={() => setConfirm(true)}>Clear all</button>
            )
          ) : null}
        </div>
      </div>
      {note ? <p role="status" className="muted">{note}</p> : null}
      {error ? <p role="alert">Could not load problem titles. Reload to try again.</p> : null}
      {items.length === 0 ? (
        <div className="empty">
          <p><strong>Nothing saved yet.</strong></p>
          <p>Use the bookmark button on any problem to keep it here.</p>
          <Link className="btn btn-primary" href="/search">Find problems</Link>
        </div>
      ) : null}
      {list.map((r) => (r.missing ? (
        <article className="result" key={r.cid}><div className="body"><span className="muted">Problem {r.cid} is no longer available.</span></div></article>
      ) : <ListItem key={r.cid} row={r} labels={labels} tokens={[]} />))}
    </div>
  );
}
