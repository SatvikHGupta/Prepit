import { readFile } from 'node:fs/promises';
import http from 'node:http';
import https from 'node:https';
import zlib from 'node:zlib';
import path from 'node:path';
import { parseLenient } from './lenient-json.js';

// production reads the Cloudflare Pages project; with no base url set it reads the local ./data folder
const REMOTE = (process.env.DATA_BASE_URL || '').replace(/\/+$/, '');
// the local folder is only for development; the ignore comment stops the bundler from tracing the whole project
const LOCAL_DIR = path.resolve(/* turbopackIgnore: true */ process.env.DATA_DIR || path.join(/* turbopackIgnore: true */ process.cwd(), 'data'));
const SAFE = /^[A-Za-z0-9_\-./]+$/;

// Cloudflare's bot rules answer 403 to requests without a normal User-Agent, so every data request sends one
const UA = 'Mozilla/5.0 (compatible; PrepitSite/1.0)';

// shared secret that the locked data host (deploy/_worker.js) checks; server-side only, never NEXT_PUBLIC, never sent to browsers
const KEY = process.env.DATA_KEY || '';
const authHeaders = () => (KEY ? { 'x-prepit-key': KEY } : {});

export class DataError extends Error {}


// plain node request: the 2 MB index is too big for Next's fetch cache (it logs a warning and drops it),
// and cache: 'no-store' would turn every page that reads it into a dynamic page
function rawGet(url, hops = 0) {
  return new Promise((resolve, reject) => {
    const lib = url.startsWith('https:') ? https : http;
    const req = lib.get(url, { headers: { 'accept-encoding': 'br, gzip', accept: 'application/json', 'user-agent': UA, ...authHeaders() }, timeout: 20000 }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location && hops < 3) {
        res.resume();
        resolve(rawGet(new URL(res.headers.location, url).toString(), hops + 1));
        return;
      }
      if (res.statusCode === 404) {
        res.resume();
        resolve(null);
        return;
      }
      if (res.statusCode !== 200) {
        res.resume();
        reject(new DataError(`${url} answered ${res.statusCode}`));
        return;
      }
      const enc = res.headers['content-encoding'];
      const stream = enc === 'br' ? res.pipe(zlib.createBrotliDecompress()) : enc === 'gzip' ? res.pipe(zlib.createGunzip()) : res;
      const chunks = [];
      stream.on('data', (c) => chunks.push(c));
      stream.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
      stream.on('error', reject);
    });
    req.on('timeout', () => req.destroy(new DataError(`${url} timed out`)));
    req.on('error', reject);
  });
}

export const dataMode = () => (REMOTE ? 'remote' : 'local');

// returns the file text, or null when the file does not exist
export async function readText(rel, { version, revalidate = 3600, raw = false } = {}) {
  if (!SAFE.test(rel) || rel.includes('..')) throw new DataError(`bad data path: ${rel}`);
  if (REMOTE) {
    const url = `${REMOTE}/${rel}${version ? `?v=${version}` : ''}`;
    if (raw) return rawGet(url);
    // cache: 'no-store' would make every page that reads data fully dynamic; urls carry ?v=<version>, so caching them is safe
    const res = await fetch(url, { signal: AbortSignal.timeout(20000), headers: { 'user-agent': UA, ...authHeaders() }, next: { revalidate } });
    if (res.status === 404) return null;
    if (!res.ok) throw new DataError(`${url} answered ${res.status}`);
    return res.text();
  }
  try {
    return await readFile(path.join(/* turbopackIgnore: true */ LOCAL_DIR, rel), 'utf8');
  } catch (err) {
    if (err.code === 'ENOENT') return null;
    throw err;
  }
}

export async function readJson(rel, opts) {
  const text = await readText(rel, opts);
  return text == null ? null : parseLenient(text);
}
