import { levelOf } from '@/lib/data/normalize';

// every sentence about verification comes from here; never hand-written per page
export function verificationInfo(v, extra = {}) {
  const level = levelOf(v);
  const d = (v && typeof v === 'object' && v.details) || {};
  if (level === 'computed') {
    return {
      level,
      tone: 'ok',
      badge: 'Answer recomputed by code',
      note: 'The final answer was recomputed with independent code. The write-up around it is AI-generated.',
    };
  }
  if (level === 'executed') {
    if (extra.sqlReproduced) {
      return {
        level,
        tone: 'ok',
        badge: 'Query result reproduced',
        note: 'AI-generated. The query was run again on the stored data and produced the stored result. That does not prove the statement is perfect.',
      };
    }
    return {
      level,
      tone: 'ok',
      badge: 'Reference solution passes its tests',
      note: 'AI-generated. The reference solution passes its own tests in a sandbox. This does not prove the stated complexity or that the statement is perfect.',
    };
  }
  if (d.judge === 'judged') {
    return {
      level: 'structural',
      tone: 'warn',
      badge: 'AI-generated, reviewed once',
      note: 'AI-generated and read by a second model. Not independently verified, so it may still contain mistakes.',
    };
  }
  return {
    level: 'structural',
    tone: 'warn',
    badge: 'AI-generated, not independently verified',
    note: 'AI-generated. Only format and wording were checked automatically. It may contain errors, so treat it as practice material and check anything important.',
  };
}
