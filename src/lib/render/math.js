import katex from 'katex';

// returns html, or null when KaTeX cannot parse the source (the caller then keeps the original text)
export function renderMath(tex, display) {
  try {
    return katex.renderToString(tex, {
      displayMode: display,
      throwOnError: true,
      strict: 'ignore',
      trust: false,
      maxSize: 30,
      maxExpand: 300,
      output: 'htmlAndMathml',
    });
  } catch {
    return null;
  }
}

// single dollar signs are mostly money in this data, so they only count as math when the content looks like math
export function looksLikeMath(inner) {
  if (/^\s|\s$/.test(inner)) return false;
  const marked = /[\\^_{}]/.test(inner);
  if (/^\d[\d,.]*(\s|$)/.test(inner) && !marked) return false;
  return marked || /^[A-Za-z]\w*\s*[=<>+\-*/]\s*[\w(]/.test(inner) || /^[A-Za-z]$/.test(inner);
}
