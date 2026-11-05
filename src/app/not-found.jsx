import Link from 'next/link';

export const metadata = { title: 'Page not found', robots: { index: false, follow: false } };

export default function NotFound() {
  return (
    <div className="container narrow page">
      <h1>That page does not exist</h1>
      <p className="lead">The link may be old or mistyped. Problems keep working when a title changes, so a broken problem link usually means the problem was removed.</p>
      <p style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        <Link className="btn btn-primary" href="/search">Search problems</Link>
        <Link className="btn" href="/">Go home</Link>
      </p>
    </div>
  );
}
