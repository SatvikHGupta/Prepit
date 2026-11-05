'use client';

export default function Error({ reset }) {
  return (
    <div className="container narrow page">
      <h1>Something went wrong</h1>
      <p className="lead">The page could not be loaded. This is usually temporary.</p>
      <p><button type="button" className="btn btn-primary" onClick={() => reset()}>Try again</button></p>
    </div>
  );
}
