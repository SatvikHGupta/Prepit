// Pure builders: (theme, data, options) -> Chart.js config. No DOM, so they are easy to test.
const tint = (t, a) => `rgba(${t.accentRgb}, ${a})`;
const SHADES = [1, 0.8, 0.64, 0.52, 0.42, 0.34, 0.28, 0.24];
const shorten = (s, n = 28) => (s.length > n ? `${s.slice(0, n - 1)}…` : s);

const tooltip = (t) => ({ backgroundColor: t.surface, titleColor: t.text, bodyColor: t.muted, borderColor: t.borderStrong, borderWidth: 1, padding: 10, cornerRadius: 6, boxPadding: 4, titleFont: { weight: '600' } });

function base(t, o = {}) {
  return {
    responsive: true,
    maintainAspectRatio: false,
    font: { family: t.font },
    animation: o.reduce || o.animate === false ? false : { duration: 750, easing: 'easeOutQuart' },
    plugins: { legend: { display: false }, tooltip: tooltip(t) },
  };
}
const axisY = (t) => ({ beginAtZero: true, ticks: { color: t.muted, precision: 0, maxTicksLimit: 5 }, grid: { color: t.border }, border: { display: false } });

// reports per month; the last month is usually unfinished, so its segment is dashed
export function trendConfig(t, d, o) {
  return {
    type: 'line',
    data: {
      labels: d.labels,
      datasets: [{
        label: d.unit,
        data: d.values,
        borderColor: t.accent,
        backgroundColor: tint(t, 0.14),
        fill: true,
        tension: 0.35,
        borderWidth: 2.5,
        pointRadius: 0,
        pointHoverRadius: 5,
        pointHoverBackgroundColor: t.accent,
        pointHoverBorderColor: t.surface,
        pointHoverBorderWidth: 2,
        segment: d.partial ? { borderDash: (c) => (c.p1DataIndex === d.values.length - 1 ? [5, 4] : undefined) } : undefined,
      }],
    },
    options: {
      ...base(t, o),
      interaction: { mode: 'index', intersect: false },
      scales: { x: { grid: { display: false }, border: { color: t.border }, ticks: { color: t.muted, maxRotation: 0, autoSkip: true, maxTicksLimit: 8 } }, y: axisY(t) },
    },
  };
}

// ranked horizontal bars; `display` holds the text to show for hidden small counts like "<5"
export function hbarConfig(t, d, o) {
  return {
    type: 'bar',
    data: {
      labels: d.labels,
      datasets: [{ label: d.unit, data: d.values, backgroundColor: tint(t, 0.85), hoverBackgroundColor: t.accent, borderRadius: 4, maxBarThickness: 22 }],
    },
    options: {
      ...base(t, o),
      indexAxis: 'y',
      plugins: { ...base(t, o).plugins, tooltip: { ...tooltip(t), callbacks: { label: (c) => `${d.display?.[c.dataIndex] ?? c.parsed.x} ${d.unit}` } } },
      scales: {
        x: { beginAtZero: true, ticks: { color: t.muted, precision: 0, maxTicksLimit: 5 }, grid: { color: t.border }, border: { display: false } },
        y: { grid: { display: false }, border: { display: false }, ticks: { color: t.text, font: { size: 12 }, callback(v) { return shorten(this.getLabelForValue(v)); } } },
      },
    },
  };
}

// outcomes read better with meaning: offers green, rejections red, the rest the accent's shades
function outcomeColor(t, name, i) {
  if (/offer|accept|hire|pass/i.test(name)) return t.easy;
  if (/reject|declin|fail|ghost|no offer/i.test(name)) return t.hard;
  if (/withdr|pending|wait/i.test(name)) return t.medium;
  return tint(t, SHADES[Math.min(i + 1, SHADES.length - 1)]);
}
export function doughnutConfig(t, d, o) {
  const colors = d.semantic ? d.labels.map((l, i) => outcomeColor(t, l, i)) : d.labels.map((l, i) => (l === 'Other' ? t.borderStrong : tint(t, SHADES[Math.min(i, SHADES.length - 1)])));
  return {
    type: 'doughnut',
    data: { labels: d.labels, datasets: [{ data: d.values, backgroundColor: colors, borderColor: t.surface, borderWidth: 2, hoverOffset: 6 }] },
    options: {
      ...base(t, o),
      cutout: '66%',
      plugins: {
        tooltip: { ...tooltip(t), callbacks: { label: (c) => ` ${c.parsed.toLocaleString('en-US')} ${d.unit}` } },
        legend: { display: true, position: 'bottom', labels: { color: t.text, boxWidth: 10, boxHeight: 10, usePointStyle: true, pointStyle: 'rectRounded', padding: 14, font: { size: 12 } } },
      },
    },
  };
}

// one stacked bar: easy / medium / hard
export function stackedConfig(t, d, o) {
  const colors = { easy: t.easy, medium: t.medium, hard: t.hard };
  return {
    type: 'bar',
    data: { labels: [''], datasets: d.series.map((s) => ({ label: s.label, data: [s.value], backgroundColor: colors[s.id] || t.accent, borderRadius: 4, borderSkipped: false, barThickness: 34 })) },
    options: {
      ...base(t, o),
      indexAxis: 'y',
      scales: { x: { stacked: true, display: false }, y: { stacked: true, display: false } },
      plugins: {
        tooltip: { ...tooltip(t), callbacks: { label: (c) => ` ${c.dataset.label}: ${c.parsed.x.toLocaleString('en-US')} ${d.unit}` } },
        legend: { display: true, position: 'bottom', labels: { color: t.text, boxWidth: 10, boxHeight: 10, usePointStyle: true, pointStyle: 'rectRounded', padding: 14, font: { size: 12 } } },
      },
    },
  };
}

export const CONFIGS = { trend: trendConfig, hbar: hbarConfig, doughnut: doughnutConfig, stacked: stackedConfig };
