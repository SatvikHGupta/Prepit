const CID = /^[cg][0-9a-f]{10}$/;

export const isCid = (s) => typeof s === 'string' && CID.test(s);

// data shard of a problem id (same rule as the monthly job)
export const shardKey = (cid) => (isCid(cid) ? cid.slice(1, 3) : 'zz');

export function kebab(input, max = 64) {
  const k = String(input || '')
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  if (k.length <= max) return k;
  const cut = k.slice(0, max);
  const i = cut.lastIndexOf('-');
  return (i > 20 ? cut.slice(0, i) : cut).replace(/-+$/, '');
}

export function problemSlug(cid, title) {
  const k = kebab(title);
  return k ? `${k}-${cid}` : cid;
}

export const problemPath = (cid, title) => `/problems/${problemSlug(cid, title)}`;

// only the trailing id matters, so a changed title never breaks an old link
export function cidFromSlug(slug) {
  if (typeof slug !== 'string' || slug.length > 120) return null;
  const m = /(?:^|-)([cg][0-9a-f]{10})$/.exec(slug);
  return m ? m[1] : null;
}

// ids used in public entity files (companies, topics, tags, combos)
export const isEntityId = (s) => typeof s === 'string' && /^[a-z0-9][a-z0-9._-]{0,90}$/.test(s) && !s.includes('..');
