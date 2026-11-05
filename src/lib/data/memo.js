// tiny in-process cache with a ttl and one shared in-flight promise per key
const store = new Map();

export function memo(key, ttlMs, loader, max = 400) {
  const hit = store.get(key);
  const now = Date.now();
  if (hit && hit.exp > now) return hit.p;
  const p = Promise.resolve()
    .then(loader)
    .catch((err) => {
      if (store.get(key)?.p === p) store.delete(key);
      throw err;
    });
  store.set(key, { p, exp: now + ttlMs });
  if (store.size > max) store.delete(store.keys().next().value);
  return p;
}
