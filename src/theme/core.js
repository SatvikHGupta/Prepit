// Theme engine core: pure, dependency-free. Runs in Node (build, tests, css route) and in the browser (store only).
// A theme = mode (light/dark) + accent. Everything else is derived from those two choices.

// ---------- colour maths ----------
export function parse(value) {
  const v = String(value).trim();
  let m = /^#([0-9a-f]{6})$/i.exec(v);
  if (m) {
    const n = parseInt(m[1], 16);
    return { r: n >> 16, g: (n >> 8) & 255, b: n & 255, a: 1 };
  }
  m = /^rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*([\d.]+)\s*)?\)$/i.exec(v);
  if (m) return { r: +m[1], g: +m[2], b: +m[3], a: m[4] === undefined ? 1 : +m[4] };
  return null;
}
const clamp = (n) => Math.max(0, Math.min(255, Math.round(n)));
const toHex = ({ r, g, b }) => '#' + [r, g, b].map((x) => clamp(x).toString(16).padStart(2, '0')).join('');
const triplet = (c) => `${c.r}, ${c.g}, ${c.b}`;
const rgba = (c, a) => `rgba(${c.r}, ${c.g}, ${c.b}, ${a})`;

function luminance({ r, g, b }) {
  const f = (v) => {
    v /= 255;
    return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
}
export function contrast(a, b) {
  const x = luminance(parse(a));
  const y = luminance(parse(b));
  return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05);
}
export function mix(a, b, t) {
  const x = parse(a);
  const y = parse(b);
  return toHex({ r: x.r + (y.r - x.r) * t, g: x.g + (y.g - x.g) * t, b: x.b + (y.b - x.b) * t });
}
// label colour for a filled button: whichever of white / near-black reads better on the fill
export const readableOn = (bg) => (contrast('#ffffff', bg) >= contrast('#0b0b10', bg) ? '#ffffff' : '#0b0b10');

// ---------- validation ----------
const MODE_KEYS = ['id', 'colors', 'extras'];
const COLOR_KEYS = ['bg', 'surface', 'text', 'textMuted', 'border'];
const ACCENT_KEYS = ['id', 'name', 'aliases', 'dark', 'light'];
const SHADE_KEYS = ['primary', 'hover', 'link'];
export const STATUS = ['easy', 'medium', 'hard', 'warn']; // each needs `<name>` and `<name>-soft` extras
const RAW_EXTRAS = new Set(['hue-l']); // extras that are not colours

// Throws one readable error listing every problem. Run it whenever the registry loads (build, tests).
export function validate(modes, accents, def) {
  const errors = [];
  const need = (label, fg, bg, min) => {
    const r = contrast(fg, bg);
    if (r < min) errors.push(`${label}: contrast ${r.toFixed(2)}, needs ${min}`);
  };
  const unknown = (label, obj, allowed) => {
    for (const k of Object.keys(obj)) if (!allowed.includes(k)) errors.push(`${label}: unknown key "${k}"`);
  };

  const ids = new Set();
  for (const m of modes) {
    if (ids.has(m.id)) errors.push(`duplicate mode id ${m.id}`);
    ids.add(m.id);
    unknown(`mode ${m.id}`, m, MODE_KEYS);
    unknown(`mode ${m.id} colors`, m.colors, COLOR_KEYS);
    const c = m.colors;
    const x = m.extras || {};
    const bad = [...['bg', 'surface', 'text', 'textMuted'].filter((k) => !parse(c[k])).map((k) => `colors.${k}`), ...Object.entries(x).filter(([k, v]) => !RAW_EXTRAS.has(k) && !parse(v)).map(([k]) => `extras.${k}`)];
    if (c.border !== undefined && !parse(c.border)) bad.push('colors.border');
    if (bad.length) {
      errors.push(`mode ${m.id}: not a colour: ${bad.join(', ')}`);
      continue;
    }
    need(`mode ${m.id} text on bg`, c.text, c.bg, 4.5);
    need(`mode ${m.id} textMuted on surface`, c.textMuted, c.surface, 4.5);
    need(`mode ${m.id} textMuted on bg`, c.textMuted, c.bg, 4.5);
    if (x['surface-2']) need(`mode ${m.id} textMuted on surface-2`, c.textMuted, x['surface-2'], 4.5);
    for (const s of STATUS) {
      if (!x[s] || !x[`${s}-soft`]) {
        errors.push(`mode ${m.id}: extras "${s}" and "${s}-soft" are required`);
        continue;
      }
      need(`mode ${m.id} ${s} on surface`, x[s], c.surface, 4.5);
      need(`mode ${m.id} ${s} on ${s}-soft`, x[s], x[`${s}-soft`], 4.5);
    }
    for (const [k, v] of Object.entries(x)) if (k.startsWith('sh-')) need(`mode ${m.id} code colour ${k} on surface`, v, c.surface, 4.5);
    if (x.focus) {
      need(`mode ${m.id} focus ring on bg`, x.focus, c.bg, 3);
      need(`mode ${m.id} focus ring on surface`, x.focus, c.surface, 3);
    }
  }

  const aids = new Set();
  const aliasSeen = new Map();
  for (const a of accents) {
    if (aids.has(a.id)) errors.push(`duplicate accent id ${a.id}`);
    aids.add(a.id);
    unknown(`accent ${a.id}`, a, ACCENT_KEYS);
  }
  for (const a of accents) {
    for (const al of a.aliases || []) {
      if (aids.has(al)) errors.push(`accent ${a.id}: alias "${al}" collides with a real id`);
      if (aliasSeen.has(al)) errors.push(`alias "${al}" used by ${aliasSeen.get(al)} and ${a.id}`);
      aliasSeen.set(al, a.id);
    }
    for (const m of modes) {
      const x = a[m.id];
      const tag = `accent ${a.id} on ${m.id}`;
      if (!x) {
        errors.push(`${tag}: missing`);
        continue;
      }
      unknown(tag, x, SHADE_KEYS);
      if (!SHADE_KEYS.every((k) => parse(x[k]))) {
        errors.push(`${tag}: missing or invalid colours`);
        continue;
      }
      const c = m.colors;
      need(`${tag}: primary on bg`, x.primary, c.bg, 3); // a coloured fill must be visible
      need(`${tag}: primary on surface`, x.primary, c.surface, 3);
      need(`${tag}: link on bg`, x.link, c.bg, 4.5); // the accent used as text
      need(`${tag}: link on surface`, x.link, c.surface, 4.5);
      need(`${tag}: link on accent tint`, x.link, mix(c.surface, x.primary, 0.12), 4.5); // active chips and badges
      need(`${tag}: button label`, readableOn(x.primary), x.primary, 4.5);
      need(`${tag}: button label on hover`, readableOn(x.primary), x.hover, 4.5); // the label colour is picked from primary, so hover must keep it readable
    }
  }
  if (def) {
    if (!ids.has(def.mode)) errors.push(`default mode "${def.mode}" is not registered`);
    if (!aids.has(def.accent)) errors.push(`default accent "${def.accent}" is not registered`);
  }
  if (errors.length) throw new Error('Invalid theme registry:\n - ' + errors.join('\n - '));
}

// ---------- token derivation ----------
export function modeTokens(m) {
  const c = m.colors;
  const dark = m.id === 'dark';
  const shadow = dark ? '0, 0, 0' : triplet(parse(c.text)); // black shadows look dirty on light pages
  const border = c.border ?? rgba(parse(c.text), 0.1);
  return {
    bg: c.bg,
    surface: c.surface,
    'surface-hover': mix(c.surface, c.text, 0.05),
    text: c.text,
    'text-muted': c.textMuted,
    border,
    'border-strong': mix(parse(border).a === 1 ? border : c.bg, c.text, 0.22),
    'shadow-sm': `0 1px 2px rgba(${shadow}, ${dark ? 0.45 : 0.08})`,
    'shadow-md': `0 6px 22px rgba(${shadow}, ${dark ? 0.4 : 0.1})`,
    'color-scheme': m.id,
    ...(m.extras || {}),
  };
}
export function accentTokens(m, a) {
  const x = a[m.id];
  const p = parse(x.primary);
  return {
    accent: x.primary,
    'accent-hover': x.hover,
    'accent-link': x.link,
    'accent-rgb': triplet(p), // rgba(var(--accent-rgb), .2) works in any component
    'accent-fg': readableOn(x.primary), // computed, never typed by hand
    'accent-subtle': rgba(p, 0.12),
  };
}

// ---------- CSS generation ----------
// Selectors carry no element name on purpose: a preview panel with the same three attributes gets the same tokens.
const decls = (t) => Object.entries(t).map(([k, v]) => `  --${k}: ${v};`).join('\n');
export function buildCss(modes, accents, def) {
  // the default is emitted first so that equal-specificity blocks for other modes win over its :root alias
  const ms = [...modes].sort((a, b) => (b.id === def.mode) - (a.id === def.mode));
  const as = [...accents].sort((a, b) => (b.id === def.accent) - (a.id === def.accent));
  const out = [];
  for (const m of ms) out.push(`${m.id === def.mode ? ':root,\n' : ''}[data-mode='${m.id}'] {\n${decls(modeTokens(m))}\n}`);
  for (const m of ms) {
    for (const a of as) {
      const pair = `[data-mode='${m.id}'][data-accent='${a.id}']`;
      out.push(`${m.id === def.mode && a.id === def.accent ? ':root,\n' : ''}${pair} {\n${decls(accentTokens(m, a))}\n}`);
    }
  }
  return out.join('\n\n') + '\n';
}

// ---------- resolving stored values ----------
// ids only are stored; anything unknown is ignored. This is the single rule; initScript() is its inline twin.
export function resolveTheme(stored, { modes, accents, aliases = {}, def, prefersDark = false }) {
  const s = stored || {};
  const legacy = s.legacy === 'light' || s.legacy === 'dark' ? s.legacy : null;
  const raw = s.mode ?? legacy;
  const pref = raw === 'system' || modes.includes(raw) ? raw : 'system';
  const mode = pref === 'system' ? (prefersDark && modes.includes('dark') ? 'dark' : modes.includes('light') ? 'light' : def.mode) : pref;
  const id = (v) => (v && Object.prototype.hasOwnProperty.call(aliases, v) ? aliases[v] : v);
  const accent = accents.includes(id(s.accent)) ? id(s.accent) : def.accent;
  return { pref, mode, accent };
}

// blocking script for <head>: applies the saved theme before first paint so nothing flashes
export function initScript({ modes, accents, aliases = {}, def, keys }) {
  const j = JSON.stringify;
  return (
    `(function(){var d=document.documentElement,M=${j(modes)},A=${j(accents)},L=${j(aliases)},K=${j(keys)},s,m=null,a=null,g=null;` +
    `try{s=window.localStorage;m=s.getItem(K.mode);a=s.getItem(K.accent);g=s.getItem(K.legacy)}catch(e){}` +
    `if(m===null&&(g==='light'||g==='dark'))m=g;` +
    `var f=function(v){return v&&Object.prototype.hasOwnProperty.call(L,v)?L[v]:v};` +
    `var pf=(m==='system'||M.indexOf(m)>-1)?m:'system',` +
    `rm=pf==='system'?(window.matchMedia&&window.matchMedia('(prefers-color-scheme: dark)').matches&&M.indexOf('dark')>-1?'dark':M.indexOf('light')>-1?'light':${j(def.mode)}):pf,` +
    `ra=A.indexOf(f(a))>-1?f(a):${j(def.accent)};` +
    `d.setAttribute('data-mode',rm);d.setAttribute('data-pref',pf);d.setAttribute('data-accent',ra)})()`
  );
}

// ---------- runtime store (framework-agnostic) ----------
// Root-element attributes are the source of truth; storage remembers the choice; subscribers are told about changes.
export function createStore({ doc, win, storage, modes, accents, aliases = {}, def, keys }) {
  const subs = new Set();
  const root = () => doc.documentElement;
  const read = (k) => {
    try {
      return storage.getItem(k);
    } catch {
      return null;
    }
  };
  const write = (k, v) => {
    try {
      if (v === null) storage.removeItem(k);
      else storage.setItem(k, v);
    } catch {
      /* private mode: the attributes still apply for this session */
    }
  };
  const prefersDark = () => Boolean(win?.matchMedia?.('(prefers-color-scheme: dark)').matches);
  const attrs = (t) => {
    root().setAttribute('data-mode', t.mode);
    root().setAttribute('data-pref', t.pref);
    root().setAttribute('data-accent', t.accent);
  };

  let snap = null;
  const snapshot = () => {
    const r = root();
    const next = {
      pref: r.getAttribute('data-pref') || 'system',
      mode: r.getAttribute('data-mode') || def.mode,
      accent: r.getAttribute('data-accent') || def.accent,
    };
    // same object until something really changes, so useSyncExternalStore never loops
    if (!snap || snap.pref !== next.pref || snap.mode !== next.mode || snap.accent !== next.accent) snap = next;
    return snap;
  };
  const emit = () => subs.forEach((f) => f());
  const persist = (t) => {
    write(keys.mode, t.pref);
    write(keys.accent, t.accent);
  };
  const commit = (t) => {
    attrs(t);
    persist(t);
    emit();
    return true;
  };
  const current = () => ({ ...snapshot() });
  const withMode = (pref) => resolveTheme({ mode: pref, accent: current().accent }, { modes, accents, aliases, def, prefersDark: prefersDark() });

  const store = {
    get: snapshot,
    subscribe(f) {
      subs.add(f);
      return () => subs.delete(f);
    },
    setMode: (pref) => (pref === 'system' || modes.includes(pref)) && commit({ ...current(), ...withMode(pref) }),
    setAccent: (id) => accents.includes(id) && commit({ ...current(), accent: id }),
    // several choices in one step: one write, one notification
    apply(next) {
      const t = resolveTheme({ mode: next.mode ?? current().pref, accent: next.accent ?? current().accent }, { modes, accents, aliases, def, prefersDark: prefersDark() });
      return commit(t);
    },
    reset: () => commit(resolveTheme({}, { modes, accents, aliases, def, prefersDark: prefersDark() })),
    stored: () => ({ mode: read(keys.mode), accent: read(keys.accent) }),
    // after mount: repair bad stored values, migrate the old single key, keep tabs and the OS setting in step
    start() {
      const t = resolveTheme({ mode: read(keys.mode), accent: read(keys.accent), legacy: read(keys.legacy) }, { modes, accents, aliases, def, prefersDark: prefersDark() });
      attrs(t);
      persist(t);
      if (keys.legacy) write(keys.legacy, null);
      emit();
      const onStorage = (e) => {
        if (e.key && !Object.values(keys).includes(e.key)) return;
        attrs(resolveTheme({ mode: read(keys.mode), accent: read(keys.accent) }, { modes, accents, aliases, def, prefersDark: prefersDark() }));
        emit();
      };
      const mq = win?.matchMedia?.('(prefers-color-scheme: dark)');
      const onSystem = () => {
        if (current().pref === 'system') {
          attrs({ ...current(), mode: prefersDark() ? 'dark' : 'light' });
          emit();
        }
      };
      win?.addEventListener?.('storage', onStorage);
      mq?.addEventListener?.('change', onSystem);
      return () => {
        win?.removeEventListener?.('storage', onStorage);
        mq?.removeEventListener?.('change', onSystem);
      };
    },
  };
  return store;
}
