// JSON.parse that also survives bare -Infinity / Infinity / NaN (written by older exports of the data).
// Those values become {"$float": "-inf" | "inf" | "nan"} instead of null.
export function parseLenient(text) {
  try {
    return JSON.parse(text);
  } catch (err) {
    if (!/Infinity|NaN/.test(text)) throw err;
  }
  let out = '';
  let inStr = false;
  let esc = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inStr) {
      out += c;
      if (esc) esc = false;
      else if (c === '\\') esc = true;
      else if (c === '"') inStr = false;
      continue;
    }
    if (c === '"') {
      inStr = true;
      out += c;
      continue;
    }
    const m = /^(-?Infinity|NaN)/.exec(text.slice(i, i + 10));
    if (m) {
      const kind = m[1] === 'NaN' ? 'nan' : m[1] === '-Infinity' ? '-inf' : 'inf';
      out += `{"$float":"${kind}"}`;
      i += m[1].length - 1;
      continue;
    }
    out += c;
  }
  return JSON.parse(out);
}
