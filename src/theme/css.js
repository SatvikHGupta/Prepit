// Server only: the generated stylesheet, its content hash (cache key) and the pre-paint script.
import { createHash } from 'node:crypto';
import { buildCss, initScript } from './core.js';
import { MODES, ACCENTS, DEFAULTS, REGISTRY } from '@/themes/index.js';

export const THEME_CSS = buildCss(MODES, ACCENTS, DEFAULTS);
export const THEME_HASH = createHash('sha1').update(THEME_CSS).digest('hex').slice(0, 10);
// the hash changes whenever a colour changes, so a year-long immutable cache never goes stale
export const THEME_HREF = `/theme.css?v=${THEME_HASH}`;
export const THEME_INIT = initScript(REGISTRY);
