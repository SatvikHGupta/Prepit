// runs a SQL problem's schema and data in memory to draw the input tables and re-check the stored result
const FORBIDDEN = /\b(attach|detach|pragma|load_extension|vacuum)\b/i;
const norm = (v) => (typeof v === 'number' ? Math.round(v * 1e6) / 1e6 : v);

export async function sqlTables(row) {
  const scripts = [row.schema, row.data, row.query].filter((s) => typeof s === 'string');
  if (scripts.length < 3 || scripts.some((s) => FORBIDDEN.test(s))) return null;
  let db;
  try {
    const { DatabaseSync } = await import('node:sqlite');
    db = new DatabaseSync(':memory:');
    db.exec(row.schema);
    db.exec(row.data);
    const names = db.prepare("select name from sqlite_master where type = 'table' and name not like 'sqlite_%' order by name").all();
    const tables = names.map(({ name }) => {
      const q = `"${name.replace(/"/g, '""')}"`;
      const st = db.prepare(`select * from ${q} limit 12`);
      const columns = st.columns().map((c) => c.name);
      const rows = st.all().map((o) => columns.map((c) => o[c]));
      const total = db.prepare(`select count(*) as n from ${q}`).get().n;
      return { name, columns, rows, total };
    });
    let reproduced = false;
    try {
      const st = db.prepare(row.query);
      const columns = st.columns().map((c) => c.name);
      const got = st.all().map((o) => columns.map((c) => norm(o[c])));
      const want = (row.expected?.rows || []).map((r) => r.map(norm));
      const same = JSON.stringify(columns) === JSON.stringify(row.expected?.columns);
      const sort = (a) => a.map((r) => JSON.stringify(r)).sort();
      reproduced = same && (JSON.stringify(got) === JSON.stringify(want) || JSON.stringify(sort(got)) === JSON.stringify(sort(want)));
    } catch {
      reproduced = false;
    }
    return { tables, reproduced };
  } catch {
    return null;
  } finally {
    try {
      db?.close();
    } catch {}
  }
}
