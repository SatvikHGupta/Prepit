import Link from 'next/link';
import { getLabels } from '@/lib/data/catalog.server.js';
import { pageMeta } from '@/lib/site.js';
import CompanyBrowser from '@/components/entity/CompanyBrowser';

export const revalidate = 3600;
export const metadata = pageMeta({
  title: 'Company interview practice',
  description: 'Pick a company to see what candidates report about its interviews and get AI-generated practice problems matched to the topics that come up most.',
  path: '/companies',
});

export default async function CompaniesPage() {
  const { dims } = await getLabels();
  const companies = (dims.companies || []).map((c) => ({ id: c.id, name: c.name, n_reports: c.n_reports, low_data: Boolean(c.low_data) }));
  const top = companies.filter((c) => !c.low_data).sort((a, b) => b.n_reports - a.n_reports).slice(0, 10);
  const max = Math.max(1, ...top.map((c) => c.n_reports));
  return (
    <div className="container page">
      <header className="page-head">
        <h1>Companies</h1>
        <p className="lead">{companies.length.toLocaleString('en-US')} companies, each with the interview reports shared about it and practice problems matched to what comes up. The problems are AI-generated; no company asked them.</p>
      </header>

      <section>
        <div className="section-head"><h2>Most reported</h2><span className="muted">interview reports</span></div>
        <ol className="ledger-rank">
          {top.map((c) => (
            <li key={c.id}>
              <Link href={`/companies/${c.id}`}>
                <span className="name">{c.name}</span>
                <span className="bar" aria-hidden="true"><i style={{ width: `${Math.max(3, (c.n_reports / max) * 100)}%` }} /></span>
                <span className="n">{c.n_reports.toLocaleString('en-US')}</span>
              </Link>
            </li>
          ))}
        </ol>
      </section>

      <section className="section">
        <div className="section-head"><h2>All companies</h2></div>
        <CompanyBrowser companies={companies} />
      </section>
    </div>
  );
}
