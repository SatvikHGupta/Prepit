import { getSitemapUrls, SHARD } from '@/lib/data/sitemap.server.js';
import { abs } from '@/lib/site.js';

export const revalidate = 3600;

export async function GET() {
  const { urls, updated } = await getSitemapUrls();
  const n = Math.ceil(urls.length / SHARD);
  const body = `<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${Array.from({ length: n }, (_, i) => `  <sitemap><loc>${abs(`/sitemaps/${i}.xml`)}</loc><lastmod>${updated}</lastmod></sitemap>`).join('\n')}\n</sitemapindex>\n`;
  return new Response(body, { headers: { 'content-type': 'application/xml; charset=utf-8' } });
}
