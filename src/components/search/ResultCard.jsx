import Link from 'next/link';
import { DifficultyBadge } from '@/components/ui/Badges';
import BookmarkButton from '@/components/problem/BookmarkButton';
import { problemPath } from '@/lib/slug';
import { prettify } from '@/lib/data/normalize';

export const LEVEL_SHORT = { computed: 'Answer recomputed', executed: 'Tests passed', structural: 'Not independently verified' };
const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// wraps the words you searched for in <mark>, matching word starts only (the same rule the search uses)
export function Highlight({ text, tokens }) {
  if (!tokens?.length) return text;
  const re = new RegExp(`(?<![a-z0-9])(${tokens.map(esc).join('|')})`, 'gi');
  const parts = text.split(re);
  return parts.map((p, i) => (i % 2 ? <mark key={i}>{p}</mark> : p));
}

const topicNames = (row, labels, n = 2) => row.topics.slice(0, n).map((t) => labels.topics?.[t] || prettify(t));

export function ListItem({ row, labels, tokens }) {
  const tags = [...topicNames(row, labels), ...row.tags.slice(0, 3)];
  return (
    <article className="result">
      <div className="body">
        <Link className="title" href={problemPath(row.cid, row.title)}><Highlight text={row.title} tokens={tokens} /></Link>
        <div className="line">
          <DifficultyBadge value={row.difficulty} />
          <span className="badge plain">{labels.types?.[row.type] || prettify(row.type)}</span>
          {row.level ? <span className="badge plain">{LEVEL_SHORT[row.level] || row.level}</span> : null}
        </div>
        {tags.length ? <div className="tagline">{tags.join(' · ')}</div> : null}
      </div>
      <BookmarkButton cid={row.cid} />
    </article>
  );
}

export function TableRow({ row, labels, tokens }) {
  return (
    <article className="rt-row">
      <Link href={problemPath(row.cid, row.title)}><Highlight text={row.title} tokens={tokens} /></Link>
      <span><DifficultyBadge value={row.difficulty} /></span>
      <span className="cell hide-sm">{labels.types?.[row.type] || prettify(row.type)}</span>
      <span className="cell hide-sm">{topicNames(row, labels, 1)[0] || ''}</span>
      <BookmarkButton cid={row.cid} />
    </article>
  );
}

export function CardItem({ row, labels, tokens }) {
  const tags = [...topicNames(row, labels, 1), ...row.tags.slice(0, 2)];
  return (
    <article className="rcard">
      <div className="line" style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <DifficultyBadge value={row.difficulty} />
        <span className="badge plain">{labels.types?.[row.type] || prettify(row.type)}</span>
      </div>
      <Link className="title" href={problemPath(row.cid, row.title)}><Highlight text={row.title} tokens={tokens} /></Link>
      <div className="tagline">{tags.join(' · ')}</div>
      <div className="foot">
        <span className="small muted">{row.level ? LEVEL_SHORT[row.level] || row.level : ''}</span>
        <BookmarkButton cid={row.cid} />
      </div>
    </article>
  );
}
