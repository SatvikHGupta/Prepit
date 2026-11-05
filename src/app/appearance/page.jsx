import AppearanceEditor from '@/components/theme/AppearanceEditor';
import { ACCENTS, MODES } from '@/themes/data';
import { pageMeta } from '@/lib/site.js';

export const metadata = pageMeta({
  title: 'Appearance',
  description: 'Choose light or dark mode and an accent colour for Prepit. Saved in this browser only.',
  path: '/appearance',
  noindex: true,
});

export default function AppearancePage() {
  const combos = MODES.length * ACCENTS.length;
  return (
    <div className="container page">
      <h1>Appearance</h1>
      <p className="lead">Pick light, dark or system, and one accent colour. {combos} combinations, every one checked for readable contrast. Your choice stays in this browser.</p>
      <AppearanceEditor />
    </div>
  );
}
