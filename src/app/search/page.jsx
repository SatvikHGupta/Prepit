import { Suspense } from 'react';
import Link from 'next/link';
import SearchExplorer from '@/components/search/SearchExplorer';
import { getManifest, getLabels } from '@/lib/data/catalog.server.js';
import { pageMeta } from '@/lib/site.js';

export const revalidate = 300;
export const metadata = pageMeta({
  title: 'Search interview practice problems',
  description: 'Search and filter interview practice problems by keyword, tag, topic, type, domain, difficulty and how they were checked.',
  path: '/search',
});

export default async function SearchPage() {
  const [m, labels] = await Promise.all([getManifest(), getLabels()]);
  const lite = { types: labels.types, domains: labels.domains, topics: labels.topics };
  return (
    <div className="container page">
      <header className="search-head">
        <h1>Search</h1>
        <p className="lead">{m.problems.toLocaleString('en-US')} problems. Type a word, then narrow by difficulty, type, topic or how the answer was checked.</p>
      </header>
      <Suspense fallback={<p className="muted" aria-busy="true">Loading search…</p>}>
        <SearchExplorer version={m.version} labels={lite} />
      </Suspense>
      <noscript>
        <h2>Browse without JavaScript</h2>
        <ul>
          {Object.entries(labels.types).map(([id, label]) => <li key={id}><Link href={`/types/${id}`}>{label}</Link></li>)}
        </ul>
      </noscript>
    </div>
  );
}
