export const SITE_NAME = 'Prepit';
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000').replace(/\/+$/, '');
export const abs = (path = '/') => `${SITE_URL}${path.startsWith('/') ? path : `/${path}`}`;
export const CONTACT_EMAIL = process.env.NEXT_PUBLIC_CONTACT_EMAIL || '';

// every page builds its metadata through this so canonical, og and twitter always agree
const SHARE_ALT = 'Prepit: practice interview problems you can actually search';

export function pageMeta({ title, description, path, type = 'website', noindex = false }) {
  const url = abs(path);
  // a page that sets its own openGraph drops the share image Next adds from src/app, so it is named here once for every page
  const og = [{ url: abs('/opengraph-image.png'), width: 1200, height: 630, alt: SHARE_ALT }];
  return {
    title,
    description,
    alternates: { canonical: url },
    robots: noindex ? { index: false, follow: true } : undefined,
    openGraph: { title, description, url, type, siteName: SITE_NAME, images: og },
    twitter: { card: 'summary_large_image', title, description, images: [{ url: abs('/twitter-image.png'), alt: SHARE_ALT }] },
  };
}
