import { abs } from '@/lib/site';

export default function robots() {
  return { rules: [{ userAgent: '*', allow: '/', disallow: ['/bookmarks', '/appearance', '/data/'] }], sitemap: abs('/sitemap.xml') };
}
