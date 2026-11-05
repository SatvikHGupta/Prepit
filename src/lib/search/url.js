import { EMPTY, DIMS } from './engine.js';

const OK = /^[\w .+#&/'-]{1,80}$/;
export const SORTS = ['relevance', 'title', 'easy', 'hard'];

// repeated keys (?tag=a&tag=b) so values may contain any normal character
export function parseFilters(params) {
  const get = (k) => params.getAll(k).filter((v) => OK.test(v)).slice(0, 12);
  const f = { ...EMPTY, q: (params.get('q') || '').slice(0, 120) };
  for (const d of DIMS) f[d] = [...new Set(get(d))];
  const s = params.get('sort');
  f.sort = SORTS.includes(s) ? s : '';
  return f;
}

export function filtersToQuery(f) {
  const p = new URLSearchParams();
  if (f.q.trim()) p.set('q', f.q.trim());
  for (const d of DIMS) for (const v of f[d]) p.append(d, v);
  if (f.sort) p.set('sort', f.sort);
  return p.toString();
}
