// prints JSON values the way Python would, so examples read like the code they belong to
export function pyRepr(v) {
  if (v === null || v === undefined) return 'None';
  if (v === true) return 'True';
  if (v === false) return 'False';
  if (typeof v === 'number') return Number.isFinite(v) ? String(v) : v > 0 ? "float('inf')" : v < 0 ? "float('-inf')" : "float('nan')";
  if (typeof v === 'string') return pyStr(v);
  if (Array.isArray(v)) return `[${v.map(pyRepr).join(', ')}]`;
  if (typeof v === 'object') {
    if (typeof v.$float === 'string') return `float('${v.$float}')`;
    return `{${Object.entries(v).map(([k, x]) => `${pyStr(k)}: ${pyRepr(x)}`).join(', ')}}`;
  }
  return String(v);
}

function pyStr(s) {
  const q = s.includes("'") && !s.includes('"') ? '"' : "'";
  let out = '';
  for (const ch of s) {
    if (ch === '\\') out += '\\\\';
    else if (ch === '\n') out += '\\n';
    else if (ch === '\t') out += '\\t';
    else if (ch === '\r') out += '\\r';
    else if (ch === q) out += `\\${q}`;
    else out += ch;
  }
  return q + out + q;
}

export function funcName(signature, fallback = 'solve') {
  const m = /def\s+([A-Za-z_]\w*)\s*\(/.exec(signature || '');
  return m ? m[1] : fallback;
}
