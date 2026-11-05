import { DIFFICULTY_ORDER } from '@/lib/data/normalize';

// lowercase words separated by single spaces; + and # stay so c++ and c# are searchable
export const norm = (s) => String(s || '').toLowerCase().replace(/[^a-z0-9+#]+/g, ' ').trim();

export const EMPTY = { q: '', type: [], domain: [], difficulty: [], level: [], topic: [], tag: [], sort: '' };
const OR_DIMS = ['type', 'domain', 'difficulty', 'level'];
const AND_DIMS = ['topic', 'tag'];
export const DIMS = [...OR_DIMS, ...AND_DIMS];

/** rows from index/all.json + label maps -> searchable rows */
export function prepare(raw, labels = {}) {
  const ix = Object.fromEntries(raw.fields.map((f, i) => [f, i]));
  const id = (x) => (x && typeof x === 'object' ? x.id : x);
  return raw.rows.map((r) => {
    const type = id(r[ix.type]) || '';
    const topics = (r[ix.topics] || []).map(id).filter(Boolean);
    const tags = r[ix.tags] || [];
    const lvl = r[ix.level];
    const meta = [labels.types?.[type], labels.domains?.[r[ix.domain]], ...topics.map((t) => labels.topics?.[t])].join(' ');
    return {
      cid: r[ix.cid],
      title: r[ix.title] || '',
      type,
      domain: r[ix.domain] || '',
      difficulty: r[ix.difficulty] || '',
      topics,
      tags,
      level: (lvl && typeof lvl === 'object' ? lvl.level : lvl) || '',
      hTitle: ` ${norm(r[ix.title])} `,
      hTags: ` ${norm(tags.join(' '))} `,
      hMeta: ` ${norm(meta)} `,
      sortTitle: String(r[ix.title] || '').toLowerCase(),
    };
  });
}

// every query word must prefix-match a word of the title, tags, topics, type or domain
export function scoreAll(rows, q) {
  const toks = norm(q).split(' ').filter(Boolean);
  if (!toks.length) return null;
  const phrase = ` ${toks.join(' ')}`;
  const out = new Int16Array(rows.length);
  for (let i = 0; i < rows.length; i++) {
    const r = rows[i];
    let score = 0;
    let ok = true;
    for (const t of toks) {
      const p = ` ${t}`;
      const w = `${p} `;
      let s = 0;
      if (r.hTitle.includes(w)) s = 4;
      else if (r.hTitle.includes(p)) s = 3;
      else if (r.hTags.includes(w)) s = 3;
      else if (r.hTags.includes(p)) s = 2;
      else if (r.hMeta.includes(p)) s = 1;
      if (!s) {
        ok = false;
        break;
      }
      score += s;
    }
    if (!ok) continue;
    if (toks.length > 1 && r.hTitle.includes(phrase)) score += 4;
    if (r.hTitle.startsWith(phrase)) score += 3;
    out[i] = score;
  }
  return out;
}

// ---------- typo help ----------
// words of titles, tags and topic labels with how many problems use them
export function buildVocab(rows) {
  const vocab = new Map();
  for (const r of rows) for (const w of new Set(`${r.hTitle}${r.hTags}${r.hMeta}`.split(' '))) if (w.length > 2) vocab.set(w, (vocab.get(w) || 0) + 1);
  return vocab;
}

// edit distance with swaps counted as one edit; gives up (returns max + 1) once it must exceed max
export function editDistance(a, b, max) {
  if (Math.abs(a.length - b.length) > max) return max + 1;
  let prev2 = null;
  let prev = Array.from({ length: b.length + 1 }, (_, j) => j);
  for (let i = 1; i <= a.length; i++) {
    const cur = [i];
    let min = i;
    for (let j = 1; j <= b.length; j++) {
      let v = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
      if (prev2 && i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) v = Math.min(v, prev2[j - 2] + 1);
      cur[j] = v;
      if (v < min) min = v;
    }
    if (min > max) return max + 1;
    prev2 = prev;
    prev = cur;
  }
  return prev[b.length];
}

// "slidng windw" -> "sliding window"; null when nothing needs or can be corrected
export function suggestQuery(vocab, q) {
  const toks = norm(q).split(' ').filter(Boolean);
  let changed = false;
  const fixed = toks.map((t) => {
    if (t.length < 4 || vocab.has(t)) return t;
    let prefixHit = false;
    let best = null;
    const max = t.length >= 8 ? 2 : 1;
    for (const [w, n] of vocab) {
      if (w.startsWith(t)) {
        prefixHit = true;
        break;
      }
      const d = editDistance(t, w, max);
      if (d <= max && (!best || d < best.d || (d === best.d && n > best.n))) best = { w, d, n };
    }
    if (prefixHit || !best) return t;
    changed = true;
    return best.w;
  });
  return changed ? fixed.join(' ') : null;
}

function passes(r, i, f, qs, skip) {
  if (qs && qs[i] === 0) return false;
  for (const d of OR_DIMS) {
    if (d === skip || !f[d].length) continue;
    if (!f[d].includes(r[d])) return false;
  }
  for (const d of AND_DIMS) {
    if (d === skip || !f[d].length) continue;
    const have = d === 'topic' ? r.topics : r.tags;
    for (const v of f[d]) if (!have.includes(v)) return false;
  }
  return true;
}

export function filterIndices(rows, f, qs, skip = null) {
  const out = [];
  for (let i = 0; i < rows.length; i++) if (passes(rows[i], i, f, qs, skip)) out.push(i);
  return out;
}

// counts for every facet option, each computed with all the OTHER filters applied
export function facetCounts(rows, f, qs) {
  const counts = {};
  for (const d of DIMS) {
    const m = new Map();
    for (const i of filterIndices(rows, f, qs, d)) {
      const r = rows[i];
      if (d === 'topic') for (const v of r.topics) m.set(v, (m.get(v) || 0) + 1);
      else if (d === 'tag') for (const v of r.tags) m.set(v, (m.get(v) || 0) + 1);
      else m.set(r[d], (m.get(r[d]) || 0) + 1);
    }
    counts[d] = m;
  }
  return counts;
}

export function sortIndices(rows, idx, sort, qs) {
  const byTitle = (a, b) => (rows[a].sortTitle < rows[b].sortTitle ? -1 : rows[a].sortTitle > rows[b].sortTitle ? 1 : 0);
  const rank = (i) => DIFFICULTY_ORDER[rows[i].difficulty] ?? 1;
  const s = sort || (qs ? 'relevance' : 'title');
  const out = idx.slice();
  if (s === 'relevance' && qs) out.sort((a, b) => qs[b] - qs[a] || byTitle(a, b));
  else if (s === 'easy') out.sort((a, b) => rank(a) - rank(b) || byTitle(a, b));
  else if (s === 'hard') out.sort((a, b) => rank(b) - rank(a) || byTitle(a, b));
  else out.sort(byTitle);
  return out;
}

export const activeCount = (f) => DIMS.reduce((n, d) => n + f[d].length, 0);
