import Md from './Md';
import Code from './Code';
import Reveal from '@/components/ui/Reveal';
import { Block, Constraints, Hints, Solution, CallExample, argsOf, DataTable } from './Parts';
import { pyRepr, funcName } from '@/lib/render/python-repr.js';
import { lineDiff } from '@/lib/render/line-diff.js';

export async function CodeBody({ row }) {
  const fn = funcName(row.signature);
  return (
    <>
      <Block title="Function signature"><Code code={row.signature} lang="python" /></Block>
      <Constraints items={row.constraints} />
      {row.examples?.length ? (
        <Block title="Examples">
          <div className="examples">
            {row.examples.map((e, i) => <CallExample key={i} index={i} call={`${fn}(${argsOf(e.args)})`} expected={e.expected} />)}
          </div>
        </Block>
      ) : null}
      <Hints items={row.hints} />
      <Solution code={row.solution} explanation={row.solution_text} complexity={row.complexity} />
    </>
  );
}

export async function LldBody({ row }) {
  return (
    <>
      <Block title={`Class ${row.class_name}`}>
        <Code code={(row.api || []).join('\n')} lang="python" />
      </Block>
      {row.examples?.length ? (
        <Block title="Example">
          <div className="examples">
            {row.examples.map((e, i) => (
              <div className="example" key={i}>
                <h3>Example {i + 1}</h3>
                <Code code={`obj = ${row.class_name}(${argsOf(e.init)})`} lang="python" />
                <DataTable
                  caption="Calls and the value each one returns"
                  columns={['Call', 'Returns']}
                  rows={(e.calls || []).map(([name, args], j) => [`obj.${name}(${argsOf(args)})`, pyRepr(e.expect?.[j])])}
                />
              </div>
            ))}
          </div>
        </Block>
      ) : null}
      <Hints items={row.hints} />
      <Solution code={row.solution} explanation={row.solution_text} complexity={row.complexity} />
    </>
  );
}

export async function DebugBody({ row }) {
  const fn = funcName(row.signature);
  const diff = lineDiff(row.buggy_code, row.solution);
  return (
    <>
      <Block title="Buggy code"><Code code={row.buggy_code} lang="python" /></Block>
      {row.examples?.length ? (
        <Block title="Expected behaviour">
          <div className="examples">
            {row.examples.map((e, i) => <CallExample key={i} index={i} call={`${fn}(${argsOf(e.args)})`} expected={e.expected} />)}
          </div>
        </Block>
      ) : null}
      <Block title="Solution">
        <Reveal title="Show the fix">
          {diff ? (
            <>
              <h3>What changed</h3>
              <pre className="code diff" aria-label="Line by line difference">
                {diff.map((l, i) => (
                  <span key={i} className={`ln ${l.t === '+' ? 'add' : l.t === '-' ? 'del' : ''}`} data-t={l.t === ' ' ? '' : l.t}>{l.s || ' '}</span>
                ))}
              </pre>
            </>
          ) : null}
          <h3>Fixed code</h3>
          <Code code={row.solution} lang="python" />
          {row.solution_text ? <Md text={row.solution_text} /> : null}
        </Reveal>
      </Block>
    </>
  );
}

export async function SqlBody({ row, tables }) {
  return (
    <>
      <Block title="Schema"><Code code={row.schema} lang="sql" /></Block>
      {tables?.tables?.length ? (
        <Block title="Sample data">
          {tables.tables.map((t) => (
            <div key={t.name}>
              <h3>{t.name}{t.total > t.rows.length ? <span className="muted" style={{ fontWeight: 500 }}> (first {t.rows.length} of {t.total} rows)</span> : null}</h3>
              <DataTable columns={t.columns} rows={t.rows} caption={`Rows of table ${t.name}`} />
            </div>
          ))}
        </Block>
      ) : row.data ? (
        <Block title="Sample data"><Code code={row.data} lang="sql" /></Block>
      ) : null}
      {row.expected ? (
        <Block title="Expected result">
          <DataTable columns={row.expected.columns || []} rows={row.expected.rows || []} caption="Expected query result" />
        </Block>
      ) : null}
      <Block title="Solution">
        <Reveal title="Reference query">
          <Code code={row.query} lang="sql" />
          {row.solution_text ? <Md text={row.solution_text} /> : null}
        </Reveal>
      </Block>
    </>
  );
}

export async function StatsBody({ row }) {
  return (
    <Block title="Answer">
      <Reveal title="Show the answer and derivation">
        <p>
          <strong>Answer: </strong>
          <code>{String(row.answer)}</code> <span className="badge plain">{row.answer_kind === 'approx' || row.answer_kind === 'approximate' ? 'Approximate' : 'Exact'}</span>
        </p>
        <Md text={row.solution} />
      </Reveal>
    </Block>
  );
}

export async function ProseBody({ row }) {
  return (
    <>
      {row.outline ? (
        <Block title="What a strong answer covers"><Md text={row.outline} /></Block>
      ) : null}
      {row.rubric ? (
        <Block title="How an answer is judged">
          <Reveal title="Show the rubric"><Md text={row.rubric} /></Reveal>
        </Block>
      ) : null}
      {row.follow_ups?.length ? (
        <Block title="Follow-up questions">
          <ol>
            {row.follow_ups.map((f, i) => <li key={i}><Md inline text={String(f)} /></li>)}
          </ol>
        </Block>
      ) : null}
    </>
  );
}
