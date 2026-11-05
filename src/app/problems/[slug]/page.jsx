import Link from 'next/link';
import { notFound, permanentRedirect } from 'next/navigation';
import { getProblemCached, getCatalog, getLabels, getTagLookup } from '@/lib/data/catalog.server.js';
import { relatedFor } from '@/lib/data/related.js';
import { sqlTables } from '@/lib/data/sql-tables.server.js';
import { kindOf, prettify } from '@/lib/data/normalize.js';
import { cidFromSlug, problemSlug, problemPath } from '@/lib/slug.js';
import { verificationInfo } from '@/lib/verification.js';
import { plainText } from '@/lib/render/markdown.js';
import { abs, pageMeta, SITE_NAME } from '@/lib/site.js';
import Md from '@/components/problem/Md';
import { CodeBody, LldBody, DebugBody, SqlBody, StatsBody, ProseBody } from '@/components/problem/Bodies';
import BookmarkButton from '@/components/problem/BookmarkButton';
import CopyLinkButton from '@/components/problem/CopyLinkButton';
import { breadcrumbLd } from '@/components/ui/Breadcrumbs';
import JsonLd from '@/components/ui/JsonLd';
import { DifficultyBadge, LevelBadge } from '@/components/ui/Badges';

// pages are built on first visit and cached for an hour, so new data never needs a rebuild
export const revalidate = 3600;
export const dynamicParams = true;
export async function generateStaticParams() {
  return [];
}

async function load(slug) {
  const cid = cidFromSlug(slug);
  if (!cid) return null;
  const row = await getProblemCached(cid);
  return row ? { cid, row } : null;
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const p = await load(slug);
  if (!p) return { title: 'Problem not found', robots: { index: false, follow: false } };
  const { row, cid } = p;
  const labels = await getLabels();
  const type = labels.types[row.type?.id ?? row.type] || prettify(row.type?.id ?? row.type);
  const desc = `${type} practice problem. ${plainText(row.statement, 150)}`;
  return pageMeta({ title: row.title, description: desc, path: problemPath(cid, row.title), type: 'article' });
}

export default async function ProblemPage({ params }) {
  const { slug } = await params;
  const p = await load(slug);
  if (!p) notFound();
  const { row, cid } = p;
  const canonical = problemSlug(cid, row.title);
  if (slug !== canonical) permanentRedirect(`/problems/${canonical}`);

  const kind = kindOf(row);
  const typeId = row.type?.id ?? row.type;
  const topicIds = (row.topics || []).map((t) => (typeof t === 'object' ? t.id : t));
  const [labels, catalog, tagLookup, tables] = await Promise.all([getLabels(), getCatalog(), getTagLookup(), kind === 'sql' ? sqlTables(row) : null]);
  const info = verificationInfo(row.verification, { sqlReproduced: tables?.reproduced });
  const related = relatedFor({ cid, type: typeId, difficulty: row.difficulty, topics: topicIds, tags: row.tags || [] }, catalog);
  const typeLabel = labels.types[typeId] || prettify(typeId);
  const domainLabel = labels.domains[row.domain] || prettify(row.domain);
  const crumbs = [{ label: 'Home', href: '/' }, { label: typeLabel, href: `/types/${typeId}` }, { label: row.title }];

  const ld = {
    '@context': 'https://schema.org',
    '@type': 'LearningResource',
    name: row.title,
    description: plainText(row.statement, 300),
    url: abs(`/problems/${canonical}`),
    learningResourceType: 'Practice problem',
    educationalLevel: row.difficulty,
    isAccessibleForFree: true,
    inLanguage: 'en',
    keywords: (row.tags || []).join(', '),
    about: topicIds.map((t) => ({ '@type': 'Thing', name: labels.topics[t] || prettify(t) })),
    datePublished: String(row.generated_at || '').slice(0, 10) || undefined,
    publisher: { '@type': 'Organization', name: SITE_NAME, url: abs('/') },
  };

  const Body = { code: CodeBody, lld: LldBody, debug: DebugBody, sql: SqlBody, stats: StatsBody, prose: ProseBody }[kind];

  return (
    <div className="container page">
      <JsonLd data={ld} />
      <JsonLd data={breadcrumbLd(crumbs, abs)} />
      <div className="problem-grid">
        <article>
          <header className="problem-head">
            <h1>{row.title}</h1>
            <div className="meta">
              <DifficultyBadge value={row.difficulty} />
              <span className="badge plain">{typeLabel}</span>
              <LevelBadge info={info} />
              <span className="badge plain">AI-generated</span>
            </div>
            <div className="problem-actions">
              <BookmarkButton cid={cid} label />
              <CopyLinkButton />
            </div>
          </header>

          <div className={`callout${info.tone === 'warn' ? ' warn' : ''}`} role="note">
            <strong>How this was checked</strong>
            <p>{info.note}</p>
          </div>

          <section className="block" style={{ marginTop: 26 }}>
            <h2>Problem</h2>
            <Md text={row.statement} />
          </section>

          <Body row={row} tables={tables} />
        </article>

        <aside className="side" aria-label="About this problem">
          <section>
            <h2>Details</h2>
            <dl className="kv">
              <dt>Type</dt><dd><Link href={`/types/${typeId}`}>{typeLabel}</Link></dd>
              <dt>Domain</dt><dd><Link href={`/domains/${row.domain}`}>{domainLabel}</Link></dd>
              <dt>Level</dt><dd><DifficultyBadge value={row.difficulty} /></dd>
              {row.concept ? <><dt>Concept</dt><dd>{row.concept}</dd></> : null}
            </dl>
          </section>
          {topicIds.length ? (
            <section>
              <h2>Topics</h2>
              <ul className="chips">
                {topicIds.map((t) => <li key={t}><Link className="chip" href={`/topics/${t}`}>{labels.topics[t] || prettify(t)}</Link></li>)}
              </ul>
            </section>
          ) : null}
          {row.tags?.length ? (
            <section>
              <h2>Tags</h2>
              <ul className="chips">
                {row.tags.map((t) => {
                  const hit = tagLookup.get(t);
                  return <li key={t}>{hit?.tier === 1 ? <Link className="chip" href={`/tags/${hit.id}`}>{t}</Link> : <span className="chip">{t}</span>}</li>;
                })}
              </ul>
            </section>
          ) : null}
          {related.length ? (
            <section>
              <h2>More like this</h2>
              <div className="rel">
                {related.map((r) => (
                  <Link key={r.cid} href={problemPath(r.cid, r.title)}>
                    <b>{r.title}</b>
                    <span>{labels.types[r.type] || prettify(r.type)} · {prettify(r.difficulty)}</span>
                  </Link>
                ))}
              </div>
            </section>
          ) : null}
          <section>
            <p className="muted" style={{ fontSize: '0.82rem', margin: 0 }}>
              Generated by {row.model || 'an AI model'}{row.generated_at ? ` on ${String(row.generated_at).slice(0, 10)}` : ''}. ID {cid}.
            </p>
          </section>
        </aside>
      </div>
    </div>
  );
}
