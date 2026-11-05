// copies the KaTeX stylesheet and woff2 fonts into public/vendor so only math pages load them
import { cpSync, mkdirSync, readFileSync, writeFileSync, existsSync, readdirSync } from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';

const require = createRequire(import.meta.url);
const dist = path.join(path.dirname(require.resolve('katex/package.json')), 'dist');
const out = path.join(process.cwd(), 'public', 'vendor', 'katex');

mkdirSync(path.join(out, 'fonts'), { recursive: true });
for (const f of readdirSync(path.join(dist, 'fonts'))) {
  if (f.endsWith('.woff2')) cpSync(path.join(dist, 'fonts', f), path.join(out, 'fonts', f));
}
// keep only the woff2 source of every @font-face so browsers never see the heavier fallbacks
let css = readFileSync(path.join(dist, 'katex.min.css'), 'utf8');
css = css.replace(/,url\([^)]*\.woff\) format\("woff"\)/g, '').replace(/,url\([^)]*\.ttf\) format\("truetype"\)/g, '');
writeFileSync(path.join(out, 'katex.min.css'), css);
if (!existsSync(path.join(out, 'katex.min.css'))) throw new Error('katex css copy failed');
console.log('katex assets copied to public/vendor/katex');
