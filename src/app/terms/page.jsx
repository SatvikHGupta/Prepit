import { pageMeta } from '@/lib/site.js';

export const metadata = pageMeta({ title: 'Terms of use', description: 'Terms for using Prepit: practice material is AI-generated, provided as is, and not a guarantee of any interview.', path: '/terms' });

export default function Terms() {
  return (
    <div className="container narrow page">
      <h1>Terms of use</h1>
      <div className="prose">
        <p>Prepit is free to use for personal learning.</p>
        <h2>Practice material only</h2>
        <p>All problems, solutions and explanations are AI-generated. They may contain errors. Each problem page says how it was checked, and none of it is a guarantee of correctness. Do not rely on it for anything where a mistake would matter.</p>
        <h2>No affiliation</h2>
        <p>Prepit is not affiliated with, endorsed by or connected to any company named on the site. Company names are used only to describe publicly reported interview information. No problem is a question that a company asked.</p>
        <h2>No guarantees</h2>
        <p>Prepit does not promise any interview result. Reported counts and outcomes describe what people shared publicly, not your chances.</p>
        <h2>Fair use</h2>
        <p>Do not scrape the site in a way that degrades it for others. The data is served from a static host that may rate-limit heavy automated use.</p>
      </div>
    </div>
  );
}
