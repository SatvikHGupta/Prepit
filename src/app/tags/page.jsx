import Link from 'next/link';
import { getLabels, getTags } from '@/lib/data/catalog.server.js';
import { pageMeta } from '@/lib/site.js';
import { prettify } from '@/lib/data/normalize.js';

export const revalidate = 3600;
export const metadata = pageMeta({
  title: 'Practice problem tags',
  description: 'Every tag used on Prepit practice problems, grouped by topic. Pick a tag to see all problems that carry it.',
  path: '/tags',
});

export default async function TagsPage() {
  const [tags, labels] = await Promise.all([getTags(), getLabels()]);
  const groups = new Map();
  for (const t of (tags || []).filter((x) => x.tier === 1)) (groups.get(t.parent) || groups.set(t.parent, []).get(t.parent)).push(t);
  const ordered = [...groups.entries()].sort((a, b) => (labels.topics[a[0]] || a[0]).localeCompare(labels.topics[b[0]] || b[0]));
  return (
    <div className="container page">
      <h1>Tags</h1>
      <p className="lead">Tags describe what a problem is about. Use the <Link href="/search">search page</Link> to combine several tags at once.</p>
      {ordered.map(([parent, list]) => (
        <section className="section" key={parent}>
          <div className="section-head"><h2>{parent && labels.topics[parent] ? <Link href={`/topics/${parent}`}>{labels.topics[parent]}</Link> : prettify(parent || 'other')}</h2></div>
          <ul className="chips">
            {list.sort((a, b) => b.n_problems - a.n_problems).map((t) => (
              <li key={t.id}><Link className="chip" href={`/tags/${t.id}`}>{t.label}<small>{t.n_problems}</small></Link></li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
