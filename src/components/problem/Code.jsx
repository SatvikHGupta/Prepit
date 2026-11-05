import { highlightCode } from '@/lib/render/code.js';

export default async function Code({ code, lang }) {
  if (!code) return null;
  return <div dangerouslySetInnerHTML={{ __html: await highlightCode(code, lang) }} />;
}
