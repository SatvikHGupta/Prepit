// Gatekeeping for the two data routes the browser may call. They exist only so our own pages can load the search index;
// a plain visit, a cross-site fetch or a hot-linked script gets nothing.
const buckets = new Map();

export function clientIp(req) {
  const fwd = req.headers.get('x-forwarded-for');
  return (fwd ? fwd.split(',')[0] : req.headers.get('x-real-ip') || 'unknown').trim().slice(0, 64);
}

// fixed window per client; best effort on serverless (each instance counts for itself), so also add a platform rule (see SECURITY.md)
export function rateLimit(key, { limit = 20, windowMs = 60_000, now = Date.now() } = {}) {
  let b = buckets.get(key);
  if (!b || b.reset <= now) {
    b = { count: 0, reset: now + windowMs };
    buckets.set(key, b);
    if (buckets.size > 5000) for (const [k, v] of buckets) if (v.reset <= now) buckets.delete(k);
  }
  b.count += 1;
  return { ok: b.count <= limit, retry: Math.max(1, Math.ceil((b.reset - now) / 1000)) };
}
export const resetRateLimits = () => buckets.clear();

const deny = (status, extra = {}) => new Response(status === 429 ? 'Too many requests' : 'Not found', { status, headers: { 'cache-control': 'no-store', ...extra } });

// returns a Response to send back, or null when the request may continue
export function guardDataRequest(req, opts) {
  if (req.method !== 'GET') return deny(405);
  // browsers label every request; only a fetch() made by one of our own pages says same-origin
  // (address-bar visits say "none", other sites say "cross-site", scripts and curl say nothing)
  if (req.headers.get('sec-fetch-site') !== 'same-origin') return deny(404);
  const origin = req.headers.get('origin');
  if (origin) {
    try {
      if (new URL(origin).host !== req.headers.get('host')) return deny(404);
    } catch {
      return deny(404);
    }
  }
  const r = rateLimit(`${opts?.name || 'data'}:${clientIp(req)}`, opts);
  if (!r.ok) return deny(429, { 'retry-after': String(r.retry) });
  return null;
}
