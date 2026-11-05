import { notFound } from 'next/navigation';
import { getEntity, getCatalog, getLabels, resolvePairs, getManifest } from './catalog.server.js';

// shared loader for entity pages: entity file + catalog + labels, or a 404
export async function loadEntityPage(kind, id) {
  const e = await getEntity(kind, id);
  if (!e) notFound();
  const [catalog, labels, m] = await Promise.all([getCatalog(), getLabels(), getManifest()]);
  const rows = resolvePairs(e.problems, catalog);
  return { e, catalog, labels, rows, version: m.version, lite: { types: labels.types, domains: labels.domains, topics: labels.topics } };
}
