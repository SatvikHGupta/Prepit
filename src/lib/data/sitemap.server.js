import { getCatalog, getManifest, getLabels, getTags } from './catalog.server.js';
import { memo } from './memo.js';
import { problemPath } from '@/lib/slug';

export const SHARD = 5000;

// every indexable url; computed from the data, never listed by hand
export const getSitemapUrls = () =>
  memo('sitemap', 30 * 60 * 1000, async () => {
    const [catalog, m, labels, tags] = await Promise.all([getCatalog(), getManifest(), getLabels(), getTags()]);
    const d = labels.dims;
    const urls = ['/', '/search', '/topics', '/types', '/companies', '/roles', '/tags', '/about', '/privacy', '/terms'];
    for (const id of Object.keys(labels.types)) urls.push(`/types/${id}`);
    for (const id of Object.keys(labels.domains)) urls.push(`/domains/${id}`);
    for (const t of d.topics || []) urls.push(`/topics/${t.id}`);
    for (const r of d.roles || []) urls.push(`/roles/${r.id}`);
    for (const c of d.companies || []) if (!c.low_data) urls.push(`/companies/${c.id}`);
    for (const t of tags || []) if (t.tier === 1) urls.push(`/tags/${t.id}`);
    for (const r of catalog.rows) urls.push(problemPath(r.cid, r.title));
    return { urls, updated: m.updated };
  });
