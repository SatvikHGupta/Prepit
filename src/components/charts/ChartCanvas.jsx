'use client';
import { useEffect, useRef } from 'react';
import { readTheme } from '@/lib/charts/theme';
import { CONFIGS } from '@/lib/charts/configs';

// Draws one chart. The library loads only when the chart scrolls near the screen, and the chart is rebuilt
// whenever mode or accent changes, so it always matches the page. `table` is the same data for screen readers.
export default function ChartCanvas({ kind, data, label, height = 260, table }) {
  const canvas = useRef(null);
  useEffect(() => {
    let chart = null;
    let alive = true;
    let mo = null;
    let first = true;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const mount = async () => {
      const { Chart } = await import('@/lib/charts/register');
      if (!alive || !canvas.current) return;
      const draw = () => {
        chart?.destroy();
        chart = new Chart(canvas.current, CONFIGS[kind](readTheme(), data, { reduce, animate: first }));
        first = false;
      };
      draw();
      mo = new MutationObserver(draw);
      mo.observe(document.documentElement, { attributes: true, attributeFilter: ['data-mode', 'data-accent'] });
    };
    const io = new IntersectionObserver((entries) => {
      if (!entries[0].isIntersecting) return;
      io.disconnect();
      mount().catch(() => {});
    }, { rootMargin: '240px' });
    io.observe(canvas.current);
    return () => {
      alive = false;
      io.disconnect();
      mo?.disconnect();
      chart?.destroy();
    };
  }, [kind, data]);

  return (
    <>
      <div className="chart" style={{ height }}>
        <canvas ref={canvas} role="img" aria-label={label} />
      </div>
      {table ? (
        <table className="sr-only">
          <caption>{label}</caption>
          <thead><tr>{table.head.map((h) => <th key={h}>{h}</th>)}</tr></thead>
          <tbody>{table.rows.map((r, i) => <tr key={i}>{r.map((c, j) => <td key={j}>{c}</td>)}</tr>)}</tbody>
        </table>
      ) : null}
    </>
  );
}
