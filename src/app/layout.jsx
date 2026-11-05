import '@fontsource-variable/plus-jakarta-sans/wght.css';
import '@fontsource-variable/jetbrains-mono/wght.css';
import '@fontsource-variable/newsreader/wght.css';
import '@/styles/base.css';
import '@/styles/layout.css';
import '@/styles/ui.css';
import '@/styles/code.css';
import '@/styles/content.css';
import '@/styles/search.css';
import '@/styles/appearance.css';
import '@/styles/motion.css';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import BookmarksSync from '@/components/layout/BookmarksSync';
import NavProgress from '@/components/layout/NavProgress';
import { ThemeSync } from '@/theme/client';
import { THEME_HREF, THEME_INIT } from '@/theme/css';
import { DEFAULTS } from '@/themes/data';
import { SITE_NAME, SITE_URL } from '@/lib/site';

const DESCRIPTION = 'Search thousands of free interview practice problems by topic, role, tag and difficulty: coding, system design, SQL, statistics, ML and behavioral. Every problem is AI-generated, original and labelled with how it was checked.';

export const metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: `${SITE_NAME}: practice interview problems by topic, role and company`, template: `%s | ${SITE_NAME}` },
  description: DESCRIPTION,
  applicationName: SITE_NAME,
  openGraph: { siteName: SITE_NAME, type: 'website', locale: 'en_US' },
  twitter: { card: 'summary_large_image' },
};

export const viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#f5f5f5' },
    { media: '(prefers-color-scheme: dark)', color: '#0d0f11' },
  ],
  colorScheme: 'light dark',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" data-mode={DEFAULTS.mode} data-pref="system" data-accent={DEFAULTS.accent} suppressHydrationWarning>
      <head>
        {/* plain blocking script: it must run before first paint, so no defer, async or module */}
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT }} />
        <link rel="stylesheet" href={THEME_HREF} precedence="theme" />
      </head>
      <body>
        <a href="#main" className="skip-link">Skip to content</a>
        <NavProgress />
        <ThemeSync />
        <BookmarksSync />
        <Header />
        <main id="main">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
