import { create } from 'zustand';

const KEY = 'prepit:v1:bookmarks';
const MAX = 2000;
const CID = /^[cg][0-9a-f]{10}$/;

function read() {
  try {
    const j = JSON.parse(localStorage.getItem(KEY) || 'null');
    if (j && j.v === 1 && Array.isArray(j.items)) {
      return j.items.filter((i) => i && CID.test(i.cid)).map((i) => ({ cid: i.cid, t: Number(i.t) || 0 })).slice(0, MAX);
    }
  } catch {}
  return [];
}

function write(items) {
  try {
    localStorage.setItem(KEY, JSON.stringify({ v: 1, items }));
    return true;
  } catch {
    return false; // storage blocked: bookmarks still work for this tab
  }
}

export const useBookmarks = create((set, get) => ({
  items: [],
  ready: false,
  persisted: true,
  load: () => set({ items: read(), ready: true }),
  toggle: (cid) => {
    const items = get().items;
    const next = items.some((i) => i.cid === cid) ? items.filter((i) => i.cid !== cid) : [{ cid, t: Date.now() }, ...items].slice(0, MAX);
    set({ items: next, persisted: write(next) });
  },
  clear: () => set({ items: [], persisted: write([]) }),
  importCids: (cids) => {
    const have = new Set(get().items.map((i) => i.cid));
    const add = [...new Set(cids)].filter((c) => CID.test(c) && !have.has(c)).map((cid) => ({ cid, t: Date.now() }));
    const next = [...add, ...get().items].slice(0, MAX);
    set({ items: next, persisted: write(next) });
    return add.length;
  },
}));
