import Link from 'next/link';
import { getEntity } from '@/lib/data/catalog.server.js';
import { loadEntityPage } from '@/lib/data/entity-load.server.js';
import { pageMeta } from '@/lib/site.js';
import { prettify } from '@/lib/data/normalize.js';
import Shell from '@/components/entity/Shell';
import { Facts, PracticeSet, AsOf } from '@/components/entity/Parts';
import Dashboard, { dashboardToc } from '@/components/charts/Dashboard';
import { NOTICE } from '@/components/entity/format';

export const revalidate = 3600;
export const dynamicParams = true;
export async function generateStaticParams() {
  return [];
}

export async function generateMetadata({ params }) {
  const { id, role } = await params;
  const e = await getEntity('combo', `${id}--${role}`);
  if (!e) return { title: 'Page not found', robots: { index: false, follow: false } };
  const label = prettify(role);
  return pageMeta({
    title: `${e.name} ${label} interview practice`,
    description: `What ${label} candidates report about ${e.name} interviews, with AI-generated practice problems matched to the topics and question types that come up most.`,
    path: `/companies/${id}/${role}`,
    noindex: e.n_reports < 10,
  });
}

export default async function ComboPage({ params }) {
  const { id, role } = await params;
  const { e, labels, rows, version, lite } = await loadEntityPage('combo', `${id}--${role}`);
  const roleLabel = labels.roles[role] || prettify(role);
  const toc = dashboardToc(e, { practice: rows.length > 0 });
  return (
    <Shell
      crumbs={[{ label: 'Home', href: '/' }, { label: 'Companies', href: '/companies' }, { label: e.name, href: `/companies/${id}` }, { label: roleLabel }]}
      title={`${e.name}, ${roleLabel}`}
      lead={`What ${roleLabel} candidates report about ${e.name} interviews, plus practice problems matched to it.`}
      actions={<><Link className="btn" href={`/companies/${id}`}>All of {e.name}</Link><Link className="btn" href={`/roles/${role}`}>All {roleLabel}</Link></>}
      facts={<Facts items={[{ label: 'Interview reports', value: e.n_reports }, { label: 'Practice problems', value: e.n_problems }, { label: 'Reports with details', value: e.experiences?.n }]} />}
      toc={toc}
    >
      <Dashboard e={e} labels={labels} />
      <PracticeSet title={`Practice set for ${e.name} ${roleLabel}`} rows={rows} total={rows.length} labels={lite} version={version} notice={NOTICE('company')} typeMix={e.types || []} />
      <AsOf labels={labels} />
    </Shell>
  );
}
