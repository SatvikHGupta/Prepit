import { getEntity } from '@/lib/data/catalog.server.js';
import { loadEntityPage } from '@/lib/data/entity-load.server.js';
import { pageMeta } from '@/lib/site.js';
import { prettify } from '@/lib/data/normalize.js';
import Shell from '@/components/entity/Shell';
import { Facts, Section, LinkList, PracticeSet, AsOf } from '@/components/entity/Parts';
import Dashboard, { dashboardToc } from '@/components/charts/Dashboard';
import { NOTICE, monthsBetween, monthLabel } from '@/components/entity/format';

export const revalidate = 3600;
export const dynamicParams = true;
export async function generateStaticParams() {
  return [];
}

export async function generateMetadata({ params }) {
  const { id } = await params;
  const e = await getEntity('company', id);
  if (!e) return { title: 'Company not found', robots: { index: false, follow: false } };
  return pageMeta({
    title: `${e.name} interview practice: topics, stages and practice problems`,
    description: `What candidates report about ${e.name} interviews across ${e.n_reports} public reports, with AI-generated practice problems matched to the topics and question types that come up most.`,
    path: `/companies/${id}`,
    noindex: Boolean(e.low_data),
  });
}

const list = (a) => (a.length > 1 ? `${a.slice(0, -1).join(', ')} and ${a.at(-1)}` : a[0] || '');

export default async function CompanyPage({ params }) {
  const { id } = await params;
  const { e, labels, rows, version, lite } = await loadEntityPage('company', id);
  const fams = await Promise.all((e.families || []).slice(0, 8).map(async ([fam, n]) => ({ fam, n, has: Boolean(await getEntity('combo', `${id}--${fam}`)) })));
  const roleItems = fams.map((f) => ({ label: labels.roles[f.fam] || prettify(f.fam), n: f.n, href: f.has ? `/companies/${id}/${f.fam}` : undefined }));
  const reports = new Map((labels.dims.companies || []).map((c) => [c.id, c.n_reports]));
  const similar = (e.similar || []).slice(0, 8).map(([cid]) => ({ label: labels.companies[cid] || prettify(cid), n: reports.has(cid) ? `${reports.get(cid).toLocaleString('en-US')} reports` : undefined, href: `/companies/${cid}` }));
  const months = monthsBetween(e.first_month, e.last_month);
  const span = e.first_month && e.last_month ? ` from ${monthLabel(e.first_month, 0)} to ${monthLabel(e.last_month, 0)}` : '';
  const topTopics = (e.topics || []).slice(0, 3).map(([t]) => labels.topics[t] || prettify(t));
  const path = e.experiences?.typical_stages || [];
  const toc = dashboardToc(e, { roles: roleItems.length > 0, practice: rows.length > 0, similar: similar.length > 0 });
  return (
    <Shell
      crumbs={[{ label: 'Home', href: '/' }, { label: 'Companies', href: '/companies' }, { label: e.name }]}
      title={e.name}
      lead={`${e.n_reports.toLocaleString('en-US')} public interview ${e.n_reports === 1 ? 'report' : 'reports'}${span}, and ${e.n_problems.toLocaleString('en-US')} practice problems matched to what comes up.`}
      aka={e.aliases?.length ? `Also reported as ${e.aliases.slice(0, 4).join(', ')}.` : null}
      actions={rows.length ? <a className="btn btn-primary" href="#practice">Start practicing</a> : null}
      facts={<Facts items={[{ label: 'Interview reports', value: e.n_reports }, { label: 'Practice problems', value: e.n_problems }, { label: 'Months covered', value: months }, { label: 'Reports with details', value: e.experiences?.n }]} />}
      toc={toc}
    >
      {e.low_data ? <div className="callout warn"><strong>Limited data</strong><p>Only a few reports exist for {e.name}, so the numbers below can swing a lot.</p></div> : null}
      {topTopics.length || path.length ? (
        <p className="summary">
          {topTopics.length ? <>Candidates most often report <strong>{list(topTopics)}</strong>. </> : null}
          {path.length ? <>The usual path is {path.join(' → ')}.</> : null}
        </p>
      ) : null}
      <Dashboard e={e} labels={labels} roleItems={roleItems} roleTitle="By role" roleSub="Reports per role family" />
      <PracticeSet title={`Practice set for ${e.name}`} rows={rows} total={rows.length} labels={lite} version={version} notice={NOTICE('company')} typeMix={e.types || []} />
      {similar.length ? (
        <Section id="similar" title="Similar companies">
          <LinkList items={similar} cols={2} />
        </Section>
      ) : null}
      <AsOf labels={labels} />
    </Shell>
  );
}
