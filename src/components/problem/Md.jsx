import { renderMarkdown } from '@/lib/render/markdown.js';

// the katex stylesheet is only added on pages that actually contain math
export function MathCss() {
  // eslint-disable-next-line @next/next/no-css-tags -- conditional stylesheet, only math pages pay for it
  return <link rel="stylesheet" href="/vendor/katex/katex.min.css" precedence="katex" />;
}

export default async function Md({ text, inline = false, className = 'prose' }) {
  if (!text) return null;
  const { html, hasMath } = await renderMarkdown(text, { inline });
  const Tag = inline ? 'span' : 'div';
  return (
    <>
      {hasMath ? <MathCss /> : null}
      <Tag className={className} dangerouslySetInnerHTML={{ __html: html }} />
    </>
  );
}
