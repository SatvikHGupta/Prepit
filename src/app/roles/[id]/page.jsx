import { getEntity } from '@/lib/data/catalog.server.js';
import { loadEntityPage } from '@/lib/data/entity-load.server.js';
import { pageMeta } from '@/lib/site.js';
import { prettify } from '@/lib/data/normalize.js';
import Shell from '@/components/entity/Shell';
import { Facts, Section, ChipLinks, PracticeSet, AsOf } from '@/components/entity/Parts';
import Dashboard, { dashboardToc } from '@/components/charts/Dashboard';
import { NOTICE } from '@/components/entity/format';

export const revalidate = 3600;
export const dynamicParams = true;
export async function generateStaticParams() {
  return [];
}

export async function generateMetadata({ params }) {
  const { id } = await params;
  const e = await getEntity('role', id);
  if (!e) return { title: 'Role not found', robots: { index: false, follow: false } };
  return pageMeta({
    title: `${e.label} interview practice: topics and practice problems`,
    description: `The topics and question types ${e.label} candidates report most across ${e.n_reports} public reports, with AI-generated practice problems matched to them.`,
    path: `/roles/${id}`,
  });
}

export default async function RolePage({ params }) {
  const { id } = await params;
  const { e, labels, rows, version, lite } = await loadEntityPage('role', id);
  const companies = await Promise.all((e.companies || []).slice(0, 10).map(async ([cid, n]) => ({ cid, n, has: Boolean(await getEntity('combo', `${cid}--${id}`)) })));
  const roleItems = companies.map((c) => ({ label: labels.companies[c.cid] || prettify(c.cid), n: c.n, href: c.has ? `/companies/${c.cid}/${id}` : `/companies/${c.cid}` }));
  const toc = dashboardToc(e, { roles: roleItems.length > 0, rolesLabel: 'Companies', practice: rows.length > 0, similar: Boolean(e.similar?.length) });
  return (
    <Shell
      crumbs={[{ label: 'Home', href: '/' }, { label: 'Roles', href: '/roles' }, { label: e.label }]}
      title={e.label}
      lead={`What ${e.label} candidates report, plus practice problems matched to the role.`}
      actions={rows.length ? <a className="btn btn-primary" href="#practice">Start practicing</a> : null}
      facts={<Facts items={[{ label: 'Interview reports', value: e.n_reports }, { label: 'Practice problems', value: e.n_problems }, { label: 'Reports with details', value: e.experiences?.n }]} />}
      toc={toc}
    >
      <Dashboard e={e} labels={labels} roleItems={roleItems} roleTitle={`Companies with the most ${e.label} reports`} roleSub="Reports per company" />
      <PracticeSet title={`Practice set for ${e.label}`} rows={rows} total={rows.length} labels={lite} version={version} notice={NOTICE('role')} typeMix={e.types || []} />
      {e.similar?.length ? (
        <Section id="similar" title="Related roles">
          <ChipLinks items={e.similar.slice(0, 6).map(([rid]) => ({ label: labels.roles[rid] || prettify(rid), href: `/roles/${rid}` }))} />
        </Section>
      ) : null}
      <AsOf labels={labels} />
    </Shell>
  );
}
