import BookmarksView from '@/components/search/BookmarksView';
import { getManifest, getLabels } from '@/lib/data/catalog.server.js';
import { pageMeta } from '@/lib/site.js';

export const revalidate = 300;
export const metadata = pageMeta({ title: 'Saved problems', description: 'Problems you saved on this device.', path: '/bookmarks', noindex: true });

export default async function BookmarksPage() {
  const [m, labels] = await Promise.all([getManifest(), getLabels()]);
  return (
    <div className="container page">
      <h1>Saved problems</h1>
      <p className="lead">Kept in this browser only. Export them if you want a backup.</p>
      <BookmarksView version={m.version} labels={{ types: labels.types, domains: labels.domains, topics: labels.topics }} />
    </div>
  );
}
