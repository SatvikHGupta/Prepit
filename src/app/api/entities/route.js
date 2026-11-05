import { getEntitiesText } from '@/lib/data/catalog.server.js';
import { guardDataRequest } from '@/lib/security/guard.js';

export const dynamic = 'force-dynamic';

export async function GET(req) {
  const blocked = guardDataRequest(req, { name: 'entities', limit: 30 });
  if (blocked) return blocked;
  try {
    const text = await getEntitiesText();
    if (!text) return new Response('Not found', { status: 404, headers: { 'cache-control': 'no-store' } });
    return new Response(text, {
      headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'private, max-age=3600', 'x-robots-tag': 'noindex', 'cross-origin-resource-policy': 'same-origin' },
    });
  } catch {
    return new Response('Unavailable', { status: 503, headers: { 'cache-control': 'no-store' } });
  }
}
