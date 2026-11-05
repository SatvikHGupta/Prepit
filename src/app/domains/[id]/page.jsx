import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getCatalog, getLabels } from '@/lib/data/catalog.server.js';
import { isEntityId } from '@/lib/slug.js';
import { pageMeta } from '@/lib/site.js';
import { prettify } from '@/lib/data/normalize.js';
import Shell from '@/components/entity/Shell';
import { ProblemRow, ChipLinks, Section } from '@/components/entity/Parts';

export const revalidate = 3600;
export const dynamicParams = true;
export async function generateStaticParams() {
  return [];
}
const SHOW = 60;

async function load(id) {
  if (!isEntityId(id)) return null;
  const [catalog, labels] = await Promise.all([getCatalog(), getLabels()]);
  const rows = catalog.rows.filter((r) => r.domain === id);
  if (!rows.length && !labels.domains[id]) return null;
  return { rows: rows.sort((a, b) => a.title.localeCompare(b.title)), labels, label: labels.domains[id] || prettify(id) };
}

export async function generateMetadata({ params }) {
  const { id } = await params;
  const d = await load(id);
  if (!d) return { title: 'Not found', robots: { index: false, follow: false } };
  return pageMeta({
    title: `${d.label} interview practice`,
    description: `${d.rows.length.toLocaleString('en-US')} free AI-generated ${d.label} practice problems across ${(d.labels.dims.topics || []).filter((t) => t.domain === id).length} topics.`,
    path: `/domains/${id}`,
  });
}

export default async function DomainPage({ params }) {
  const { id } = await params;
  const d = await load(id);
  if (!d) notFound();
  const lite = { types: d.labels.types, domains: d.labels.domains, topics: d.labels.topics };
  const topics = (d.labels.dims.topics || []).filter((t) => t.domain === id).sort((a, b) => b.n_problems - a.n_problems);
  return (
    <Shell
      crumbs={[{ label: 'Home', href: '/' }, { label: 'Topics', href: '/topics' }, { label: d.label }]}
      title={`${d.label} interview practice`}
      lead={`${d.rows.length.toLocaleString('en-US')} AI-generated problems.`}
      meta={<Link className="btn btn-primary" href={`/search?domain=${encodeURIComponent(id)}`}>Filter these in search</Link>}
    >
      {topics.length ? <Section title="Topics"><ChipLinks items={topics.map((t) => ({ label: t.label, href: `/topics/${t.id}`, n: t.n_problems }))} /></Section> : null}
      <Section title="Problems">
        <div>{d.rows.slice(0, SHOW).map((r) => <ProblemRow key={r.cid} row={r} labels={lite} />)}</div>
        {d.rows.length > SHOW ? <p style={{ marginTop: 20 }}><Link className="btn" href={`/search?domain=${encodeURIComponent(id)}`}>See all {d.rows.length.toLocaleString('en-US')} in search</Link></p> : null}
      </Section>
    </Shell>
  );
}
