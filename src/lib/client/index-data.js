import { prepare } from '@/lib/search/engine';

let indexCache = null;
let entityCache = null;

// same-origin only: the browser never talks to the data host, which is private
export function loadIndex(version, labels) {
  if (indexCache?.key === version) return indexCache.p;
  const p = fetch(`/api/index?v=${encodeURIComponent(version)}`)
    .then((r) => {
      if (!r.ok) throw new Error(`index answered ${r.status}`);
      return r.json();
    })
    .then((raw) => prepare(raw, labels));
  indexCache = { key: version, p };
  p.catch(() => {
    if (indexCache?.p === p) indexCache = null;
  });
  return p;
}

export function loadEntities() {
  if (entityCache) return entityCache;
  entityCache = fetch('/api/entities')
    .then((r) => {
      if (!r.ok) throw new Error(`entities answered ${r.status}`);
      return r.json();
    })
    .then((all) => all.filter((e) => e.t === 'company' || e.t === 'topic' || e.t === 'role'))
    .catch(() => {
      entityCache = null;
      return [];
    });
  return entityCache;
}
