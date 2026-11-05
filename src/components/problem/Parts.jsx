import Md from './Md';
import Code from './Code';
import Reveal from '@/components/ui/Reveal';
import { pyRepr } from '@/lib/render/python-repr.js';

export function Block({ title, children }) {
  return (
    <section className="block">
      <h2>{title}</h2>
      {children}
    </section>
  );
}

export async function Constraints({ items }) {
  if (!items?.length) return null;
  return (
    <Block title="Constraints">
      <ul>
        {items.map((c, i) => (
          <li key={i}><Md inline text={String(c)} /></li>
        ))}
      </ul>
    </Block>
  );
}

export async function Hints({ items }) {
  if (!items?.length) return null;
  return (
    <Block title="Hints">
      {items.map((h, i) => (
        <Reveal key={i} title={`Hint ${i + 1}`}><Md inline text={String(h)} /></Reveal>
      ))}
    </Block>
  );
}

export async function Solution({ code, lang = 'python', explanation, complexity, title = 'Reference solution' }) {
  if (!code && !explanation) return null;
  return (
    <Block title="Solution">
      <Reveal title={title}>
        {code ? <Code code={code} lang={lang} /> : null}
        {complexity ? <p><strong>Complexity:</strong> <Md inline text={String(complexity)} /></p> : null}
        {explanation ? <Md text={explanation} /> : null}
      </Reveal>
    </Block>
  );
}

// call-style example: solve(3, [4, 2]) with the expected output underneath
export async function CallExample({ call, expected, index }) {
  return (
    <div className="example">
      <h3>Example {index + 1}</h3>
      <Code code={call} lang="python" />
      <div className="out"><span>Output </span>{pyRepr(expected)}</div>
    </div>
  );
}

export const argsOf = (args) => (Array.isArray(args) ? args.map(pyRepr).join(', ') : args && typeof args === 'object' ? Object.entries(args).map(([k, v]) => `${k}=${pyRepr(v)}`).join(', ') : pyRepr(args));

export function DataTable({ columns, rows, caption }) {
  return (
    <div className="table-scroll">
      <table>
        {caption ? <caption className="sr-only">{caption}</caption> : null}
        <thead>
          <tr>{columns.map((c) => <th key={c} scope="col">{c}</th>)}</tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i}>{r.map((v, j) => <td key={j}>{v === null ? <span className="muted">NULL</span> : String(v)}</td>)}</tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
