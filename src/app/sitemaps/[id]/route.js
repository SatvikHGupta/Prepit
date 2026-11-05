import { getSitemapUrls, SHARD } from '@/lib/data/sitemap.server.js';
import { abs } from '@/lib/site.js';

export const revalidate = 3600;

const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

export async function GET(_req, { params }) {
  const { id } = await params;
  const m = /^(\d{1,3})\.xml$/.exec(id);
  if (!m) return new Response('Not found', { status: 404 });
  const { urls, updated } = await getSitemapUrls();
  const part = urls.slice(Number(m[1]) * SHARD, (Number(m[1]) + 1) * SHARD);
  if (!part.length) return new Response('Not found', { status: 404 });
  const body = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${part.map((u) => `  <url><loc>${esc(abs(u))}</loc><lastmod>${updated}</lastmod></url>`).join('\n')}\n</urlset>\n`;
  return new Response(body, { headers: { 'content-type': 'application/xml; charset=utf-8' } });
}
