'use client';

export default function GlobalError({ reset }) {
  return (
    <html lang="en">
      <body style={{ fontFamily: 'system-ui, sans-serif', padding: '48px 20px', maxWidth: 560, margin: '0 auto' }}>
        <h1>Something went wrong</h1>
        <p>Prepit could not load. Please try again.</p>
        <button type="button" onClick={() => reset()}>Try again</button>
      </body>
    </html>
  );
}
