// "more like this" computed from the index: shared topics and tags, same type, close difficulty
const RANK = { easy: 0, medium: 1, hard: 2 };

export function relatedFor(row, catalog, n = 6) {
  const topics = new Set(row.topics);
  const tags = new Set(row.tags);
  const seen = new Map();
  for (const t of row.topics.slice(0, 3)) {
    for (const c of catalog.topicBuckets.get(t) || []) {
      if (c.cid === row.cid || seen.has(c.cid)) continue;
      let score = 0;
      for (const x of c.topics) if (topics.has(x)) score += 2;
      for (const x of c.tags) if (tags.has(x)) score += 1.5;
      if (c.type === row.type) score += 2;
      score -= Math.abs((RANK[c.difficulty] ?? 1) - (RANK[row.difficulty] ?? 1)) * 0.5;
      seen.set(c.cid, { c, score });
    }
  }
  return [...seen.values()]
    .sort((a, b) => b.score - a.score || (a.c.cid < b.c.cid ? -1 : 1))
    .slice(0, n)
    .map((x) => x.c);
}
