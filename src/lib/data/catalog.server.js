import { cache } from 'react';
import { readJson, readText, DataError } from './source.server.js';
import { parseLenient } from './lenient-json.js';
import { memo } from './memo.js';
import { typeId, topicIds, levelOf } from './normalize.js';
import { shardKey, isCid, isEntityId } from '@/lib/slug';

const MIN = 60 * 1000;

export const getManifest = () =>
  memo('manifest', 5 * MIN, async () => {
    const m = await readJson('manifest.json', { revalidate: 300 });
    if (!m) throw new DataError('manifest.json is missing from the data source');
    return m;
  });

// raw index text, shared by the server catalog and the guarded /api/index route (one fetch for both)
export const getIndexText = (version) =>
  memo(`indextext:${version}`, 10 * MIN, async () => {
    const text = await readText('index/all.json', { version, raw: true });
    if (!text) throw new DataError('index/all.json is missing from the data source');
    return text;
  }, 4);

export const getEntitiesText = () => memo('entitiestext', 30 * MIN, () => readText('public/search_entities.json', { revalidate: 3600 }), 2);

export const getDims = () => memo('dims', 30 * MIN, () => readJson('public/dims.json', { revalidate: 3600 }));
export const getTags = () => memo('tags', 30 * MIN, () => readJson('public/tags.json', { revalidate: 3600 }));

// one row per problem, normalized; built once per server instance and refreshed every 10 minutes
export const getCatalog = () =>
  memo('catalog', 10 * MIN, async () => {
    const m = await getManifest();
    const raw = parseLenient(await getIndexText(m.version));
    const ix = Object.fromEntries(raw.fields.map((f, i) => [f, i]));
    const rows = raw.rows.map((r) => ({
      cid: r[ix.cid],
      title: r[ix.title] || '',
      type: typeId(r[ix.type]),
      domain: r[ix.domain] || '',
      difficulty: r[ix.difficulty] || '',
      topics: topicIds(r[ix.topics]),
      tags: Array.isArray(r[ix.tags]) ? r[ix.tags] : [],
      level: levelOf(r[ix.level]),
    }));
    const byCid = new Map(rows.map((r) => [r.cid, r]));
    return { version: m.version, rows, byCid, topicBuckets: bucket(rows) };
  });

function bucket(rows) {
  const map = new Map();
  for (const r of rows) for (const t of r.topics) (map.get(t) || map.set(t, []).get(t)).push(r);
  return map;
}

// the full problem row lives in one of at most 256 shards
export async function getProblem(cid) {
  if (!isCid(cid)) return null;
  const m = await getManifest();
  const key = shardKey(cid);
  const shard = await memo(`shard:${key}:${m.version}`, 10 * MIN, () => readJson(`shard/${key}.json`, { version: m.version }), 80);
  const row = shard?.[cid];
  if (!row) return null;
  // hidden tests must never reach a page, even if an old export still carries them
  const { tests: _t, check_code: _c, ...safe } = row;
  return safe;
}

export const getProblemCached = cache(getProblem);

// kind: company | role | combo | topic | tag
export async function getEntity(kind, id) {
  if (!isEntityId(id)) return null;
  return memo(`entity:${kind}:${id}`, 30 * MIN, () => readJson(`public/${kind}/${id}.json`, { revalidate: 3600 }), 600);
}

// problems for an entity page: [[cid, score], ...] -> catalog rows, in score order
export function resolvePairs(pairs, catalog) {
  const out = [];
  for (const [cid] of pairs || []) {
    const r = catalog.byCid.get(cid);
    if (r) out.push(r);
  }
  return out;
}

// id -> label maps from dims.json (types, domains, topics, companies, roles)
export const getLabels = () =>
  memo('labels', 30 * MIN, async () => {
    const d = (await getDims()) || {};
    const map = (list, key = 'label') => Object.fromEntries((list || []).map((x) => [x.id, x[key] ?? x.name ?? x.id]));
    return {
      asOf: d.as_of || '',
      types: map(d.types),
      domains: map(d.domains),
      topics: map(d.topics),
      companies: map(d.companies, 'name'),
      roles: map(d.roles),
      rounds: map(d.rounds),
      dims: d,
    };
  });

// tag label (as stored on problems) -> { id, tier }; only tier 1 tags have pages
export const getTagLookup = () =>
  memo('taglookup', 30 * MIN, async () => {
    const tags = (await getTags()) || [];
    return new Map(tags.map((t) => [t.label, { id: t.id, tier: t.tier, parent: t.parent, n: t.n_problems }]));
  });

// tag id -> { label, tier, parent }
export const getTagById = () =>
  memo('tagbyid', 30 * MIN, async () => {
    const tags = (await getTags()) || [];
    return new Map(tags.map((t) => [t.id, { label: t.label, tier: t.tier, parent: t.parent, n: t.n_problems }]));
  });
