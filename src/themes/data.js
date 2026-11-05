// Plain data and ids shared by server and browser. No validation here, so the browser bundle stays small.
import { MODES } from './modes.js';
import { ACCENTS } from './accents.js';

export { MODES, ACCENTS };
export const MODE_IDS = MODES.map((m) => m.id);
export const ACCENT_IDS = ACCENTS.map((a) => a.id);
export const DEFAULTS = { mode: 'light', accent: 'teal' };
// first-time visitors follow their device (system); DEFAULTS.mode is only the no-JavaScript fallback
export const KEYS = { mode: 'prepit-mode', accent: 'prepit-accent', legacy: 'prepit:theme' };
export const ALIASES = Object.fromEntries(ACCENTS.flatMap((a) => (a.aliases || []).map((al) => [al, a.id])));
export const REGISTRY = { modes: MODE_IDS, accents: ACCENT_IDS, aliases: ALIASES, def: DEFAULTS, keys: KEYS };
