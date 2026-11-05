// counts can be numbers or the string '<5' (small counts are hidden in the data); never do maths on strings
export const isNum = (v) => typeof v === 'number' && Number.isFinite(v);
export const fmt = (v) => (isNum(v) ? v.toLocaleString('en-US') : String(v ?? ''));

export function monthLabel(start, i) {
  const m = /^(\d{4})-(\d{2})$/.exec(start || '');
  if (!m) return '';
  const d = new Date(Date.UTC(Number(m[1]), Number(m[2]) - 1 + i, 1));
  return d.toLocaleDateString('en-US', { month: 'short', year: '2-digit', timeZone: 'UTC' });
}

export function monthsBetween(a, b) {
  const x = /^(\d{4})-(\d{2})$/.exec(a || '');
  const y = /^(\d{4})-(\d{2})$/.exec(b || '');
  if (!x || !y) return null;
  return (Number(y[1]) - Number(x[1])) * 12 + (Number(y[2]) - Number(x[2])) + 1;
}

export const NOTICE = (noun) => `These are AI-generated practice problems matched to this ${noun}'s mix of topics and question types. They are not questions that any ${noun} asked.`;
