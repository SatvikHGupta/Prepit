import Link from 'next/link';
import { getManifest, getLabels } from '@/lib/data/catalog.server.js';
import { pageMeta } from '@/lib/site.js';
import { prettify } from '@/lib/data/normalize.js';

export const revalidate = 3600;
export const metadata = pageMeta({
  title: 'Interview question types',
  description: 'Every kind of interview practice problem on Prepit: algorithms, system design, SQL, statistics, machine learning, behavioral and more.',
  path: '/types',
});

export default async function TypesPage() {
  const [m, labels] = await Promise.all([getManifest(), getLabels()]);
  const types = Object.entries(m.by_type || {}).sort((a, b) => b[1] - a[1]);
  return (
    <div className="container page">
      <header className="page-head">
        <h1>Question types</h1>
        <p className="lead">{types.length} kinds of problem, from coding to behavioral. Pick one to see every problem of that kind.</p>
      </header>
      <ul className="index cols-2">
        {types.map(([id, n]) => <li key={id}><Link href={`/types/${id}`}>{labels.types[id] || prettify(id)}<span className="n">{n.toLocaleString('en-US')}</span></Link></li>)}
      </ul>
    </div>
  );
}
