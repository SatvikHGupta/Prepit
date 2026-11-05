import { BarList, Section } from './Parts';
import { prettify, DIFFICULTY_LABEL } from '@/lib/data/normalize';

const STACK = ['s-a', 's-b', 's-c'];

// what the problems are made of: question types, domains, difficulty
export function MixBlocks({ e, labels, id = 'covers' }) {
  const top = (list, n = 8) => (list || []).slice(0, n);
  const diff = (e.difficulty || []).filter(([, n]) => n > 0);
  const diffTotal = diff.reduce((n, [, c]) => n + c, 0) || 1;
  return (
    <Section id={id} title="What it covers">
      <div className="two-col">
        <div>
          <h3 className="subhead">Question types</h3>
          <BarList items={top(e.types).map(([t, n]) => ({ label: labels.types[t] || prettify(t), value: n, href: `/types/${t}` }))} />
        </div>
        <div>
          <h3 className="subhead">Domains</h3>
          <BarList items={top(e.domains).map(([d, n]) => ({ label: labels.domains[d] || prettify(d), value: n, href: `/domains/${d}` }))} />
        </div>
      </div>
      {diff.length ? (
        <>
          <h3 className="subhead" style={{ marginTop: 30 }}>Difficulty</h3>
          <div className="stack" role="img" aria-label={`Difficulty: ${diff.map(([d, n]) => `${DIFFICULTY_LABEL[d] || d} ${n}`).join(', ')}`}>
            {diff.map(([d, n]) => <i key={d} className={`s-${d}`} style={{ flexGrow: n }} />)}
          </div>
          <ul className="legend">
            {diff.map(([d, n]) => <li key={d}><i className={`s-${d}`} /> {DIFFICULTY_LABEL[d] || prettify(d)} {Math.round((n / diffTotal) * 100)}%</li>)}
          </ul>
        </>
      ) : null}
    </Section>
  );
}
export { STACK };
