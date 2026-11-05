import { pageMeta } from '@/lib/site.js';

export const metadata = pageMeta({ title: 'Privacy', description: 'Prepit has no accounts, no tracking and no cookies. Saved problems and your theme stay in your own browser.', path: '/privacy' });

export default function Privacy() {
  return (
    <div className="container narrow page">
      <h1>Privacy</h1>
      <div className="prose">
        <p>Prepit does not have accounts, does not use cookies and does not run analytics or advertising scripts.</p>
        <h2>What is stored in your browser</h2>
        <ul>
          <li>Your appearance choices (mode and accent colour).</li>
          <li>The problems you save, as a list of problem IDs.</li>
        </ul>
        <p>This lives only in your browser&rsquo;s local storage. It is never sent to a server and you can clear it by clearing site data or with the Clear button on the Saved page.</p>
        <h2>What the servers see</h2>
        <p>Like any website, the host sees technical request data (address, browser, page requested) while serving pages. Prepit does not combine it with anything or share it with advertisers. Problem data is loaded from a separate static data host, which sees the same kind of request data.</p>
        <p>No third-party fonts, trackers or embeds are loaded.</p>
      </div>
    </div>
  );
}
