import { getLabels } from '@/lib/data/catalog.server.js';
import { pageMeta } from '@/lib/site.js';
import TopicBrowser from '@/components/entity/TopicBrowser';

export const revalidate = 3600;
export const metadata = pageMeta({
  title: 'Interview practice topics',
  description: 'Browse interview practice problems by topic: arrays, graphs, caching, SQL joins, experiment design, leadership stories and more.',
  path: '/topics',
});

export default async function TopicsPage() {
  const { dims } = await getLabels();
  const domains = (dims.domains || []).map((d) => ({ id: d.id, label: d.label, n_problems: d.n_problems }));
  const topics = (dims.topics || []).map((t) => ({ id: t.id, label: t.label, domain: t.domain, n_problems: t.n_problems || 0, n_reports: t.n_reports || 0 }));
  return (
    <div className="container page">
      <header className="page-head">
        <h1>Topics</h1>
        <p className="lead">{topics.length} topics in {domains.length} domains. Each topic collects its problems, the companies that ask about it and the tags inside it.</p>
      </header>
      <TopicBrowser domains={domains} topics={topics} />
    </div>
  );
}
