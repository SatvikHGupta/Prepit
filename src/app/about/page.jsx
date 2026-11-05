import Link from 'next/link';
import { pageMeta, CONTACT_EMAIL } from '@/lib/site.js';
import { getManifest } from '@/lib/data/catalog.server.js';

export const revalidate = 3600;
export const metadata = pageMeta({
  title: 'How Prepit works',
  description: 'Where Prepit problems come from, how each one is checked, what the labels mean and how company pages are built.',
  path: '/about',
});

export default async function About() {
  let m = null;
  try {
    m = await getManifest();
  } catch {}
  return (
    <div className="container narrow page">
      <h1>How Prepit works</h1>
      <div className="prose legal">
        <p>Prepit is a free place to practice for technical and behavioral interviews. You can search every problem by keyword, tag, topic, type and difficulty, save the ones you want to return to, and read what each one covers before you start.</p>
        <h2>Where the problems come from</h2>
        <p>Every problem on Prepit is written by an AI model. They are original: they are not copied from any company, book or website, and no problem claims to be a question a company asked.</p>
        <h2>How each problem is checked</h2>
        <p>Because AI makes mistakes, every problem page shows how it was checked{m ? ` (${m.problems.toLocaleString('en-US')} problems at the last update)` : ''}:</p>
        <ul>
          <li><strong>Answer recomputed by code.</strong> Statistics and probability problems: the final answer is recomputed by independent code. The explanation around it is still AI-written.</li>
          <li><strong>Reference solution passes its tests.</strong> Coding, class design, debugging and SQL problems: the reference solution passes its own tests in a sandbox. That does not prove the statement is perfect or that the stated complexity is right.</li>
          <li><strong>Not independently verified.</strong> System design, behavioral, product, experiment and concept questions are written answers. Only the format and wording are checked automatically, and some were also read once by a second model. They can contain mistakes, so treat them as practice material.</li>
        </ul>
        <h2>Company and role pages</h2>
        <p>Company, role, topic and tag pages combine two things. The numbers (reports per month, interview stages, outcomes, levels) come from interview reports shared publicly, aggregated so no single report is shown. The practice problems are AI-generated and matched to the topics and question types that come up most. A practice problem on a company page was not asked by that company.</p>
        <p>Counts show what people reported, not your chances. A value of &lsquo;&lt;5&rsquo; means fewer than five reports.</p>
        <h2>Updates</h2>
        <p>New problems are added every month. The site reads its data live, so new problems appear without a redesign. Problem links keep working when a title changes.</p>
        <h2>Found a mistake?</h2>
        <p>{CONTACT_EMAIL ? <>Write to <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a> with the problem link and what looks wrong.</> : <>Open the problem page and note its ID (shown at the bottom of the sidebar) so the problem can be found.</>}</p>
        <p><Link className="btn btn-primary" href="/search">Start practicing</Link></p>
      </div>
    </div>
  );
}
