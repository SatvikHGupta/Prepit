import { createHighlighterCore, createCssVariablesTheme } from 'shiki/core';
import { createJavaScriptRegexEngine } from 'shiki/engine/javascript';
import { escapeHtml } from './escape.js';

const THEME = 'prepit';

const LANGS = {
  python: () => import('shiki/langs/python.mjs'),
  sql: () => import('shiki/langs/sql.mjs'),
  javascript: () => import('shiki/langs/javascript.mjs'),
  jsx: () => import('shiki/langs/jsx.mjs'),
  typescript: () => import('shiki/langs/typescript.mjs'),
  go: () => import('shiki/langs/go.mjs'),
  c: () => import('shiki/langs/c.mjs'),
  cpp: () => import('shiki/langs/cpp.mjs'),
  java: () => import('shiki/langs/java.mjs'),
  json: () => import('shiki/langs/json.mjs'),
  bash: () => import('shiki/langs/bash.mjs'),
};
const ALIAS = { py: 'python', python3: 'python', js: 'javascript', ts: 'typescript', sh: 'bash', shell: 'bash', 'c++': 'cpp', postgres: 'sql', postgresql: 'sql', mysql: 'sql', sqlite: 'sql' };

// token colour variable -> short class; the colours themselves live in styles/code.css for light and dark
const CLASS = {
  'token-keyword': 'k',
  'token-function': 'f',
  'token-constant': 'c',
  'token-string': 's',
  'token-string-expression': 's',
  'token-comment': 'm',
  'token-parameter': 'p',
  'token-punctuation': 'u',
  'token-link': 'l',
};

let ready;
export function ensureHighlighter() {
  ready ??= createHighlighterCore({
    themes: [createCssVariablesTheme({ name: THEME, variablePrefix: '--sh-', variableDefaults: {}, fontStyle: true })],
    langs: Object.values(LANGS).map((load) => load()),
    engine: createJavaScriptRegexEngine(),
  });
  return ready;
}

let hl = null;

// must be awaited once before highlightSync is used (markdown rendering does this)
export async function warmHighlighter() {
  hl = await ensureHighlighter();
  return hl;
}

export const normalizeLang = (lang) => {
  const l = String(lang || '').toLowerCase();
  const name = ALIAS[l] || l;
  return LANGS[name] ? name : '';
};

export function highlightSync(code, lang) {
  const name = normalizeLang(lang);
  const text = String(code ?? '').replace(/\n$/, '');
  if (!hl || !name) return `<pre class="code"><code>${escapeHtml(text)}</code></pre>`;
  let lines;
  try {
    lines = hl.codeToTokensBase(text, { lang: name, theme: THEME });
  } catch {
    return `<pre class="code"><code>${escapeHtml(text)}</code></pre>`;
  }
  const body = lines
    .map((line) => {
      let out = '';
      let cls = null;
      let buf = '';
      const flush = () => {
        if (!buf) return;
        out += cls ? `<span class="${cls}">${escapeHtml(buf)}</span>` : escapeHtml(buf);
        buf = '';
      };
      for (const t of line) {
        const m = /--sh-([a-z-]+)\)/.exec(t.color || '');
        const c = (m && CLASS[m[1]]) || null;
        if (c !== cls) {
          flush();
          cls = c;
        }
        buf += t.content;
      }
      flush();
      return out;
    })
    .join('\n');
  return `<pre class="code" data-lang="${name}"><code>${body}</code></pre>`;
}

export async function highlightCode(code, lang) {
  await warmHighlighter();
  return highlightSync(code, lang);
}
