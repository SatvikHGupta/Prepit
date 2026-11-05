import Link from 'next/link';
import { fmt, isNum, monthLabel } from './format';
import { DifficultyBadge } from '@/components/ui/Badges';
import { problemPath } from '@/lib/slug';
import { prettify } from '@/lib/data/normalize';
import PracticeBrowser from './PracticeBrowser';

// a plain line of numbers under the title
export function Facts({ items }) {
  const list = items.filter((i) => i.value !== undefined && i.value !== null);
  if (!list.length) return null;
  return (
    <dl className="facts">
      {list.map((i) => (
        <div key={i.label}>
          <dt>{i.label}</dt>
          <dd>{fmt(i.value)}</dd>
        </div>
      ))}
    </dl>
  );
}
export const StatTiles = Facts;

export function Section({ title, children, note, id }) {
  return (
    <section className="section" id={id}>
      <div className="section-head"><h2>{title}</h2></div>
      {children}
      {note ? <p className="muted" style={{ fontSize: '0.85rem', marginTop: 10 }}>{note}</p> : null}
    </section>
  );
}

// reports per month as a tiny SVG bar chart; the last month is usually still in progress
export function Trend({ data, start, partial }) {
  if (!Array.isArray(data) || data.length < 2 || !data.some((v) => v > 0)) return null;
  const max = Math.max(...data, 1);
  const w = 300;
  const h = 84;
  const gap = 4;
  const bw = (w - gap * (data.length - 1)) / data.length;
  const first = monthLabel(start, 0);
  const last = monthLabel(start, data.length - 1);
  const desc = `Reports per month, ${first} to ${last}: ${data.join(', ')}`;
  return (
    <figure style={{ margin: 0 }}>
      <svg className="spark" viewBox={`0 0 ${w} ${h + 18}`} role="img" aria-label={desc}>
        <title>{desc}</title>
        {data.map((v, i) => {
          const bh = Math.max(v > 0 ? 3 : 0, (v / max) * h);
          return <rect key={i} className={`bar${partial && i === data.length - 1 ? ' partial' : ''}`} x={i * (bw + gap)} y={h - bh} width={bw} height={bh} rx="2" />;
        })}
        <text x="0" y={h + 14}>{first}</text>
        <text x={w} y={h + 14} textAnchor="end">{last}{partial ? ' (so far)' : ''}</text>
      </svg>
    </figure>
  );
}

export function BarList({ items, empty = 'No data.' }) {
  const list = (items || []).filter(Boolean);
  if (!list.length) return <p className="muted">{empty}</p>;
  const max = Math.max(...list.map((i) => (isNum(i.value) ? i.value : 0)), 1);
  return (
    <ul className="bars">
      {list.map((i) => (
        <li key={i.label}>
          <span>{i.href ? <Link href={i.href}>{i.label}</Link> : i.label}</span>
          <span className="track" aria-hidden="true">{isNum(i.value) ? <span className="fill" style={{ width: `${Math.max(2, (i.value / max) * 100)}%` }} /> : null}</span>
          <span className="val">{fmt(i.value)}</span>
        </li>
      ))}
    </ul>
  );
}

export function ChipLinks({ items }) {
  if (!items?.length) return null;
  return (
    <ul className="chips">
      {items.map((i) => (
        <li key={i.label}>
          {i.href ? <Link className="chip" href={i.href}>{i.label}{i.n !== undefined ? <small>{fmt(i.n)}</small> : null}</Link> : <span className="chip">{i.label}{i.n !== undefined ? <small>{fmt(i.n)}</small> : null}</span>}
        </li>
      ))}
    </ul>
  );
}

// stages and outcomes of the reported interviews
export function ExperienceBlock({ exp, id }) {
  if (!exp || !exp.n) return null;
  const pairs = (o) => Object.entries(o || {}).map(([label, value]) => ({ label, value })).sort((a, b) => (isNum(b.value) ? b.value : -1) - (isNum(a.value) ? a.value : -1));
  return (
    <Section id={id} title="Reported interviews" note="Counts come from reports shared publicly, not from the company. They show what was reported, not your chances. '<5' means fewer than five reports.">
      <div className="two-col">
        <div>
          <h3 className="subhead">Stages reported</h3>
          <BarList items={pairs(exp.stages)} />
          {exp.typical_stages?.length ? <p className="muted" style={{ fontSize: '0.88rem', marginTop: 12 }}>Most often: {exp.typical_stages.join(', ')}.</p> : null}
        </div>
        <div>
          <h3 className="subhead">Outcomes reported</h3>
          <BarList items={pairs(exp.outcomes)} />
          {exp.levels && Object.keys(exp.levels).length ? (
            <>
              <h3 className="subhead">Levels</h3>
              <ChipLinks items={pairs(exp.levels).map((l) => ({ label: l.label, n: l.value }))} />
            </>
          ) : null}
        </div>
      </div>
    </Section>
  );
}

export function ProblemRow({ row, labels }) {
  return (
    <div className="prow">
      <Link className="title" href={problemPath(row.cid, row.title)}>{row.title}</Link>
      <div className="tags">
        <DifficultyBadge value={row.difficulty} />
        <span className="badge plain">{labels.types?.[row.type] || prettify(row.type)}</span>
      </div>
    </div>
  );
}

// the practice set: first rows are real links in the HTML, the rest load on demand
export function PracticeSet({ title = 'Practice set', rows, total, labels, version, notice, more = 300, first = 24, id = 'practice', typeMix = [] }) {
  if (!rows.length) return null;
  const slim = (r) => ({ cid: r.cid, title: r.title, type: r.type, difficulty: r.difficulty });
  const head = rows.slice(0, first).map(slim);
  const rest = rows.slice(first, first + more).map((r) => r.cid);
  const typeOptions = typeMix.map(([t]) => ({ id: t, label: labels.types?.[t] || prettify(t) }));
  return (
    <Section id={id} title={title} note={notice}>
      <PracticeBrowser head={head} rest={rest} version={version} labels={labels} total={total} typeOptions={typeOptions} />
    </Section>
  );
}

// a ruled list of links with a count on the right
export function LinkList({ items, cols = 1 }) {
  if (!items?.length) return null;
  return (
    <ul className={`index${cols > 1 ? ` cols-${cols}` : ''}`}>
      {items.map((i) => (
        <li key={i.label}>
          {i.href ? <Link href={i.href}>{i.label}<span className="n">{i.n !== undefined ? fmt(i.n) : ''}</span></Link> : <span className="row">{i.label}<span className="n">{i.n !== undefined ? fmt(i.n) : ''}</span></span>}
        </li>
      ))}
    </ul>
  );
}

export function TrendSection({ e, labels, id = 'trend' }) {
  if (!Array.isArray(e.trend) || e.trend.length < 2) return null;
  return (
    <Section id={id} title="Reports over time">
      <Trend data={e.trend} start={e.trend_start} partial={labels.dims.last_month_partial} />
    </Section>
  );
}

export function AsOf({ labels }) {
  return <p className="muted small" style={{ marginTop: 48 }}>Aggregated from public interview reports, as of {labels.asOf}. Counts are reports, not probabilities.</p>;
}
