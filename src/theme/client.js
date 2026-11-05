'use client';
import { useEffect, useSyncExternalStore } from 'react';
import { createStore } from './core.js';
import { MODE_IDS, ACCENT_IDS, ALIASES, DEFAULTS, KEYS } from '@/themes/data.js';

let store = null;

// created on first use in the browser; storage errors are swallowed inside the store
export function getThemeStore() {
  store ??= createStore({
    doc: document,
    win: window,
    storage: { getItem: (k) => window.localStorage.getItem(k), setItem: (k, v) => window.localStorage.setItem(k, v), removeItem: (k) => window.localStorage.removeItem(k) },
    modes: MODE_IDS,
    accents: ACCENT_IDS,
    aliases: ALIASES,
    def: DEFAULTS,
    keys: KEYS,
  });
  return store;
}

// server and hydration render the default theme, so markup always matches; the real value follows right after
const SERVER_SNAPSHOT = { pref: 'system', mode: DEFAULTS.mode, accent: DEFAULTS.accent };
const subscribe = (f) => getThemeStore().subscribe(f);
const getSnapshot = () => getThemeStore().get();

export function useTheme() {
  return useSyncExternalStore(subscribe, getSnapshot, () => SERVER_SNAPSHOT);
}

// mounted once in the layout: repairs stored values, migrates the old key, syncs tabs and the OS setting
export function ThemeSync() {
  useEffect(() => getThemeStore().start(), []);
  return null;
}
