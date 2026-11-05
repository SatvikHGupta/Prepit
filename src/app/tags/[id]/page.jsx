import Link from 'next/link';
import { getEntity, getTagById } from '@/lib/data/catalog.server.js';
import { loadEntityPage } from '@/lib/data/entity-load.server.js';
import { pageMeta } from '@/lib/site.js';
import { prettify } from '@/lib/data/normalize.js';
import Shell from '@/components/entity/Shell';
import { Facts, Section, ChipLinks, PracticeSet } from '@/components/entity/Parts';
import { MixBlocks } from '@/components/entity/MixBlocks';

export const revalidate = 3600;
export const dynamicParams = true;
export async function generateStaticParams() {
  return [];
}

export async function generateMetadata({ params }) {
  const { id } = await params;
  const e = await getEntity('tag', id);
  if (!e) return { title: 'Tag not found', robots: { index: false, follow: false } };
  return pageMeta({
    title: `${e.label} practice problems`,
    description: `${e.n_problems} AI-generated interview practice problems tagged ${e.label}.`,
    path: `/tags/${id}`,
  });
}

export default async function TagPage({ params }) {
  const { id } = await params;
  const [{ e, labels, rows, version, lite }, tagById] = await Promise.all([loadEntityPage('tag', id), getTagById()]);
  return (
    <Shell
      crumbs={[{ label: 'Home', href: '/' }, { label: 'Tags', href: '/tags' }, { label: e.label }]}
      facts={<Facts items={[{ label: "Practice problems", value: e.n_problems }]} />}
      title={e.label}
      lead={`${e.n_problems.toLocaleString('en-US')} AI-generated practice problems tagged ${e.label}.`}
      meta={e.parent ? <Link className="chip" href={`/topics/${e.parent}`}>{labels.topics[e.parent] || prettify(e.parent)}</Link> : null}
    >
      {e.related_tags?.length ? (
        <Section title="Related tags">
          <ChipLinks items={e.related_tags.slice(0, 12).map((r) => {
            const tid = Array.isArray(r) ? r[0] : r;
            const t = tagById.get(tid);
            return { label: t?.label || prettify(tid), href: t?.tier === 1 ? `/tags/${tid}` : undefined };
          })} />
        </Section>
      ) : null}
      <MixBlocks e={e} labels={labels} />
      <PracticeSet title={`${e.label} problems`} rows={rows} total={rows.length} labels={lite} version={version} />
    </Shell>
  );
}
