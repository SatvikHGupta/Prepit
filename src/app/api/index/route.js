import { getManifest, getIndexText } from '@/lib/data/catalog.server.js';
import { guardDataRequest } from '@/lib/security/guard.js';

export const dynamic = 'force-dynamic';

// the search index for our own pages; the data host itself is private (see SECURITY.md)
export async function GET(req) {
  const blocked = guardDataRequest(req, { name: 'index', limit: 20 });
  if (blocked) return blocked;
  try {
    const m = await getManifest();
    const text = await getIndexText(m.version);
    return new Response(text, {
      headers: {
        'content-type': 'application/json; charset=utf-8',
        // private: a shared cache must never answer for us, or the checks above would be skipped
        'cache-control': 'private, max-age=3600',
        'x-robots-tag': 'noindex',
        'cross-origin-resource-policy': 'same-origin',
      },
    });
  } catch {
    return new Response('Unavailable', { status: 503, headers: { 'cache-control': 'no-store' } });
  }
}
