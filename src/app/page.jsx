import Link from 'next/link';
import { getManifest, getLabels } from '@/lib/data/catalog.server.js';
import { pageMeta, abs, SITE_NAME } from '@/lib/site.js';
import { prettify } from '@/lib/data/normalize.js';
import Icon from '@/components/ui/Icon';
import JsonLd from '@/components/ui/JsonLd';
import DomainExplorer from '@/components/home/DomainExplorer';

export const revalidate = 600;
export const metadata = pageMeta({
  title: { absolute: 'Prepit: practice interview problems by topic, role and company' },
  description: 'Search thousands of free interview practice problems by topic, role, tag and difficulty: coding, system design, SQL, statistics, ML and behavioral. Every problem is AI-generated, original and labelled with how it was checked.',
  path: '/',
});

const n = (v) => Number(v || 0).toLocaleString('en-US');
const pct = (part, whole) => `${Math.round((part / Math.max(1, whole)) * 100)}%`;

export default async function Home() {
  const [m, labels] = await Promise.all([getManifest(), getLabels()]);
  const dims = labels.dims;
  const types = Object.entries(m.by_type || {}).sort((a, b) => b[1] - a[1]);
  // every domain with its biggest topics; the explorer shows one domain at a time
  const domains = [...(dims.domains || [])]
    .sort((a, b) => b.n_problems - a.n_problems)
    .map((d) => {
      const all = (dims.topics || []).filter((t) => t.domain === d.id).sort((a, b) => b.n_problems - a.n_problems);
      return { id: d.id, label: d.label, n_problems: d.n_problems, topic_count: all.length, topics: all.slice(0, 8).map((t) => ({ id: t.id, label: t.label, n_problems: t.n_problems || 0 })) };
    })
    .filter((d) => d.topic_count > 0);
  const companies = [...(dims.companies || [])].filter((c) => !c.low_data).sort((a, b) => b.n_reports - a.n_reports).slice(0, 12);
  const roles = [...(dims.roles || [])].sort((a, b) => b.n_reports - a.n_reports).slice(0, 8);
  const lv = m.by_level || {};
  const total = (lv.computed || 0) + (lv.executed || 0) + (lv.structural || 0);
  const proof = [
    { key: 'computed', title: 'Answer recomputed', cls: 's-a', text: 'Statistics and probability problems. Independent code recomputes the answer, and the page shows the working.' },
    { key: 'executed', title: 'Solution passes tests', cls: 's-b', text: 'Coding, debugging and SQL problems. A reference solution runs against hidden tests before the problem is published.' },
    { key: 'structural', title: 'Not independently verified', cls: 's-c', text: 'Written answers: design, behavioral and concept questions. Checked for format and wording only, so read them critically.' },
  ];
  const ld = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE_NAME,
    url: abs('/'),
    potentialAction: { '@type': 'SearchAction', target: { '@type': 'EntryPoint', urlTemplate: abs('/search?q={search_term_string}') }, 'query-input': 'required name=search_term_string' },
  };
  return (
    <div className="container">
      <JsonLd data={ld} />
      <section className="hero">
        <div className="hero-grid">
          <div>
            <h1>Interview practice you can search like a library.</h1>
            <p className="lead">{n(m.problems)} problems across coding, SQL, statistics, machine learning, system design and behavioral interviews. Each one says how it was checked, and says so plainly when it wasn&apos;t.</p>
            <form className="hero-search" action="/search" role="search">
              <label className="field field-lg">
                <Icon name="search" />
                <span className="sr-only">Search problems</span>
                <input type="search" name="q" placeholder="Try: sliding window, sql joins, a/b test" autoComplete="off" />
              </label>
              <button className="btn btn-primary" type="submit">Search</button>
            </form>
            <p className="hero-links">
              <Link href="/search">Browse all problems</Link>
              <Link href="/topics">By topic</Link>
              <Link href="/companies">By company</Link>
              <Link href="/roles">By role</Link>
            </p>
          </div>
          <aside className="hero-side" aria-label="Question types">
            <h2>Question types</h2>
            <ul className="index">
              {types.slice(0, 8).map(([id, count]) => <li key={id}><Link href={`/types/${id}`}>{labels.types[id] || prettify(id)}<span className="n">{n(count)}</span></Link></li>)}
            </ul>
            {types.length > 8 ? <p className="small" style={{ marginTop: 12 }}><Link href="/types">All {types.length} types</Link></p> : null}
          </aside>
        </div>
      </section>

      <section className="section" style={{ marginTop: 56 }}>
        <div className="section-head"><h2>Start with your role</h2><Link href="/roles">All {(dims.roles || []).length} roles</Link></div>
        <div className="role-band">
          {roles.map((r) => <Link key={r.id} href={`/roles/${r.id}`}><b>{r.label}</b><span>{n(r.n_reports)} reports</span></Link>)}
        </div>
      </section>

      <section className="section">
        <div className="section-head"><h2>Topics, by domain</h2><Link href="/topics">All {(dims.topics || []).length} topics</Link></div>
        <DomainExplorer domains={domains} />
      </section>

      <section className="section">
        <div className="section-head"><h2>Companies</h2><Link href="/companies">All {n(dims.totals?.companies ?? (dims.companies || []).length)}</Link></div>
        <ul className="index cols-2">
          {companies.map((c) => <li key={c.id}><Link href={`/companies/${c.id}`}>{c.name}<span className="n">{n(c.n_reports)} reports</span></Link></li>)}
        </ul>
        <p className="muted small" style={{ marginTop: 16 }}>Report counts come from interview experiences shared publicly. The practice problems are AI-generated and never claimed to be asked by a company.</p>
      </section>

      <section className="section">
        <div className="proof">
          <blockquote>{pct(lv.structural || 0, total)} of these problems are written answers no code can check. Every page says which kind it is.</blockquote>
          <div className="proof-rows">
            {proof.map((p) => (
              <div className="proof-row" key={p.key}>
                <h3><span>{p.title}</span><span className="num">{n(lv[p.key])} · {pct(lv[p.key] || 0, total)}</span></h3>
                <div className="stack" role="img" aria-label={`${p.title}: ${pct(lv[p.key] || 0, total)} of problems`}><i className={p.cls} style={{ flexGrow: lv[p.key] || 0 }} /><i style={{ flexGrow: total - (lv[p.key] || 0), background: 'transparent' }} /></div>
                <p>{p.text}</p>
              </div>
            ))}
          </div>
        </div>
        <p style={{ marginTop: 22 }}><Link href="/about">How the checking works</Link></p>
      </section>
    </div>
  );
}
