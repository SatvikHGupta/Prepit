'use client';
import { useState } from 'react';
import RadioGroup from './RadioGroup';
import { DifficultyBadge } from '@/components/ui/Badges';
import { useTheme, getThemeStore } from '@/theme/client';
import { readableOn } from '@/theme/core';
import { ACCENTS } from '@/themes/data';

const MODE_OPTIONS = [
  { id: 'light', label: 'Light', hint: 'Warm paper' },
  { id: 'dark', label: 'Dark', hint: 'Easy on the eyes' },
  { id: 'system', label: 'System', hint: 'Follows your device' },
];

const systemMode = () => (typeof window !== 'undefined' && window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');

// Draft editor: choices stay in a draft, the preview panel carries its own attributes (so the page does not change),
// and Apply commits both in one step.
export default function AppearanceEditor() {
  const saved = useTheme();
  const [edits, setEdits] = useState({});
  const [note, setNote] = useState('');
  const draft = { pref: saved.pref, accent: saved.accent, ...edits };
  const dirty = ['pref', 'accent'].some((k) => draft[k] !== saved[k]);
  const previewMode = draft.pref === 'system' ? (saved.pref === 'system' ? saved.mode : systemMode()) : draft.pref;
  const edit = (patch) => {
    setNote('');
    setEdits((e) => ({ ...e, ...patch }));
  };

  const accentOptions = ACCENTS.map((a) => ({ id: a.id, label: a.name, hint: a[previewMode].primary, color: a[previewMode].primary, fg: readableOn(a[previewMode].primary) }));

  function apply() {
    getThemeStore().apply({ mode: draft.pref, accent: draft.accent });
    setEdits({});
    setNote('Theme applied.');
  }
  function reset() {
    getThemeStore().reset();
    setEdits({});
    setNote('Back to the default theme.');
  }

  return (
    <div className="appearance">
      <div className="appearance-controls">
        <section>
          <h2>Mode</h2>
          <RadioGroup label="Mode" options={MODE_OPTIONS} value={draft.pref} onChange={(id) => edit({ pref: id })} className="choices-3" />
        </section>
        <section>
          <h2>Accent colour</h2>
          <p className="muted small">Buttons, links and active states.</p>
          <RadioGroup label="Accent colour" options={accentOptions} value={draft.accent} onChange={(id) => edit({ accent: id })} className="choices-swatch" />
        </section>
      </div>

      <aside className="appearance-side" aria-label="Preview">
        <div className="preview" data-mode={previewMode} data-accent={draft.accent}>
          <div className="preview-glow" aria-hidden="true" />
          <p className="eyebrow">Preview</p>
          <h3>Two Sum, but faster</h3>
          <p>Practice problems that follow your colours. <a href="#preview" onClick={(e) => e.preventDefault()}>This is a link</a>.</p>
          <div className="preview-row">
            <span className="btn btn-primary" aria-hidden="true">Start practicing</span>
            <span className="btn" aria-hidden="true">Save</span>
          </div>
          <div className="preview-row">
            <DifficultyBadge value="easy" />
            <DifficultyBadge value="medium" />
            <DifficultyBadge value="hard" />
            <span className="chip on">Active chip</span>
          </div>
          <div className="preview-bar" aria-hidden="true" />
          <pre className="code preview-code"><code><span className="k">def</span> <span className="f">solve</span>(<span className="p">nums</span>): <span className="k">return</span> <span className="c">0</span></code></pre>
        </div>
        <div className="appearance-actions">
          <button type="button" className="btn btn-primary" onClick={apply} disabled={!dirty}>Apply</button>
          <button type="button" className="btn" onClick={() => { setEdits({}); setNote(''); }} disabled={!dirty}>Cancel</button>
          <button type="button" className="btn btn-ghost" onClick={reset}>Reset</button>
        </div>
        <p role="status" aria-live="polite" className="muted small">{note || (dirty ? 'You have changes that are not applied yet.' : '')}</p>
      </aside>
    </div>
  );
}
