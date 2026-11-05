import Link from 'next/link';
import { getLabels, getEntity } from '@/lib/data/catalog.server.js';
import { pageMeta } from '@/lib/site.js';
import { prettify } from '@/lib/data/normalize.js';
import ChartCanvas from '@/components/charts/ChartCanvas';
import { Panel } from '@/components/charts/Dashboard';

export const revalidate = 3600;
export const metadata = pageMeta({
  title: 'Interview practice by role',
  description: 'Interview practice for software engineers, data scientists, ML engineers, product managers and more: the topics reported most for each role and matched practice problems.',
  path: '/roles',
});

const n0 = (v) => Number(v || 0).toLocaleString('en-US');

export default async function RolesPage() {
  const { dims, topics: topicLabels } = await getLabels();
  const roles = (dims.roles || []).slice().sort((a, b) => b.n_reports - a.n_reports);
  const totalReports = roles.reduce((s, r) => s + r.n_reports, 0) || 1;
  const max = Math.max(1, ...roles.map((r) => r.n_reports));
  const featured = roles.filter((r) => r.n_reports > 0).slice(0, 6);
  // the featured roles show their top topics and problem counts, read from each role's own file
  const detail = Object.fromEntries(await Promise.all(featured.map(async (r) => [r.id, await getEntity('role', r.id)])));

  const groups = new Map();
  for (const r of roles) (groups.get(r.group) || groups.set(r.group, []).get(r.group)).push(r);
  const ordered = [...groups.entries()].map(([g, list]) => ({ g, list, total: list.reduce((s, r) => s + r.n_reports, 0) })).sort((a, b) => b.total - a.total);
  const chart = { labels: ordered.map((o) => prettify(o.g)), values: ordered.map((o) => o.total), unit: 'reports' };

  return (
    <div className="container page">
      <header className="page-head">
        <h1>Roles</h1>
        <p className="lead">Pick the job you are interviewing for. Each role shows how interviews for it usually run, which topics come up, and a practice set built from them. {roles.length} roles, {n0(totalReports)} reports.</p>
      </header>

      <section>
        <div className="section-head"><h2>Most reported</h2><span className="muted">share of all reports</span></div>
        <div className="role-feature-grid">
          {featured.map((r, i) => {
            const d = detail[r.id];
            const tops = (d?.topics || []).slice(0, 3).map(([t]) => topicLabels[t] || prettify(t));
            return (
              <Link key={r.id} href={`/roles/${r.id}`} className={`role-feature${i === 0 ? ' lead' : ''}`}>
                <span className="group">{prettify(r.group)} · {Math.round((r.n_reports / totalReports) * 100)}% of reports</span>
                <h3>{r.label}</h3>
                {tops.length ? <p className="tops">{tops.join(' · ')}</p> : null}
                <span className="big">{n0(r.n_reports)}<span>reports{d?.n_problems ? ` · ${n0(d.n_problems)} practice problems` : ''}</span></span>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="section">
        <div className="section-head"><h2>By group</h2></div>
        <div className="dash">
          <Panel title="Reports by role group" sub="Where interview reports come from">
            <ChartCanvas kind="hbar" height={Math.max(150, ordered.length * 40 + 30)} label={`Reports by group: ${ordered.map((o) => `${prettify(o.g)} ${o.total}`).join(', ')}`} data={chart} table={{ head: ['Group', 'Reports'], rows: ordered.map((o) => [prettify(o.g), o.total]) }} />
          </Panel>
          <p className="muted" style={{ alignSelf: 'center', maxWidth: '42ch' }}>One role makes up most reports, so the lists below scale their bars by square root. A short bar still means fewer reports; the number on the right is exact.</p>
        </div>
      </section>

      <section className="section">
        <div className="section-head"><h2>All roles</h2></div>
        {ordered.map(({ g, list, total }) => (
          <div className="role-group" key={g}>
            <header>
              <h2>{prettify(g)}</h2>
              <span className="muted small">{n0(total)} reports</span>
            </header>
            {list.map((r) => (
              <Link key={r.id} href={`/roles/${r.id}`} className="role-row">
                <span className="name">{r.label}</span>
                <span className="bar" aria-hidden="true">{r.n_reports > 0 ? <i style={{ width: `${Math.max(3, Math.sqrt(r.n_reports / max) * 100)}%` }} /> : null}</span>
                <span className="n">{r.n_reports > 0 ? n0(r.n_reports) : 'no reports yet'}</span>
              </Link>
            ))}
          </div>
        ))}
      </section>
    </div>
  );
}
