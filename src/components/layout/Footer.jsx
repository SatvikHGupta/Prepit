import Link from 'next/link';
import { getManifest } from '@/lib/data/catalog.server.js';

export default async function Footer() {
  let m = null;
  try {
    m = await getManifest();
  } catch {}
  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-row">
          <span className="footer-brand">Prepit</span>
          <nav className="footer-links" aria-label="Footer">
            <Link href="/about">About</Link>
            <Link href="/privacy">Privacy</Link>
            <Link href="/terms">Terms</Link>
            {m ? <span>Updated {m.updated}</span> : null}
          </nav>
        </div>
        <p className="footer-note">Every problem is AI-generated and original. None is copied from, or claimed to be asked by, any company, and each page says how it was checked.</p>
      </div>
    </footer>
  );
}
