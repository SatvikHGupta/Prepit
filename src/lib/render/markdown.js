import { Marked } from 'marked';
import { escapeHtml } from './escape.js';
import { warmHighlighter, highlightSync } from './code.js';
import { renderMath, looksLikeMath } from './math.js';

const md = new Marked({ gfm: true, breaks: false });
md.use({
  renderer: {
    // raw html in the data is plain text (things like <id> or <timestamp> must stay visible)
    html({ text }) {
      return escapeHtml(text);
    },
    // generated content has no links or images; anything that slips in becomes plain text
    link({ tokens }) {
      return this.parser.parseInline(tokens);
    },
    image({ text }) {
      return escapeHtml(text || '');
    },
    code({ text, lang }) {
      return highlightSync(text, String(lang || '').split(/\s/)[0]);
    },
    // the page owns h1 and h2, so content headings start at h3
    heading({ tokens, depth }) {
      const d = Math.min(6, depth + 2);
      return `<h${d}>${this.parser.parseInline(tokens)}</h${d}>\n`;
    },
  },
  hooks: {
    postprocess(html) {
      return html.replaceAll('<table>', '<div class="table-scroll"><table>').replaceAll('</table>', '</table></div>');
    },
  },
});

const MATH = /\$\$([\s\S]+?)\$\$|\\\[([\s\S]+?)\\\]|\\\(([\s\S]+?)\\\)|(?<![\\$\w])\$([^$\n]{1,120}?)\$(?![\w$])/g;

// math spans are rendered first and parked behind private-use markers so markdown cannot touch them
function pullMath(src) {
  const code = [];
  const spans = [];
  let t = src.replace(/```[\s\S]*?```|`[^`\n]+`/g, (m) => `\uE002${code.push(m) - 1}\uE003`);
  t = t.replace(MATH, (m, dd, br, par, dollar) => {
    const tex = dd ?? br ?? par ?? dollar;
    if (dollar !== undefined && !looksLikeMath(dollar)) return m;
    const html = renderMath(tex.trim(), dd !== undefined || br !== undefined);
    if (html === null) return m;
    return `\uE000${spans.push(html) - 1}\uE001`;
  });
  t = t.replace(/\uE002(\d+)\uE003/g, (_, i) => code[i]);
  return { text: t, spans };
}

/** markdown -> safe html. Returns { html, hasMath }. */
export async function renderMarkdown(src, { inline = false } = {}) {
  await warmHighlighter();
  const { text, spans } = pullMath(String(src ?? ''));
  let html = inline ? md.parseInline(text) : md.parse(text);
  html = html.replace(/\uE000(\d+)\uE001/g, (_, i) => spans[i]);
  return { html, hasMath: spans.length > 0 };
}

// plain text for meta descriptions
export function plainText(src, max = 155) {
  const t = String(src ?? '')
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/\\\(|\\\)|\\\[|\\\]|\$\$/g, ' ')
    .replace(/[`*_#>|]/g, '')
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  if (t.length <= max) return t;
  const cut = t.slice(0, max);
  return cut.slice(0, Math.max(cut.lastIndexOf(' '), 60)).replace(/[\s,;:.-]+$/, '') + '…';
}
