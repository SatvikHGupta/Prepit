// the loading screens, drawn with the same layout as the pages they stand in for
export function ListSkeleton() {
  return (
    <div className="container page" aria-busy="true">
      <p className="sr-only" role="status">Loading</p>
      <div className="sk sk-title" />
      <div className="sk sk-line" style={{ width: 'min(560px, 80%)' }} />
      <div className="sk-rows">
        {Array.from({ length: 7 }, (_, i) => <div className="sk sk-row" key={i} style={{ animationDelay: `${i * 60}ms` }} />)}
      </div>
    </div>
  );
}

export function ProfileSkeleton() {
  return (
    <div className="container page" aria-busy="true">
      <p className="sr-only" role="status">Loading</p>
      <div className="sk sk-title" style={{ width: 'min(380px, 70%)' }} />
      <div className="sk sk-line" style={{ width: 'min(620px, 90%)' }} />
      <div className="sk-facts">
        {Array.from({ length: 4 }, (_, i) => <div className="sk sk-fact" key={i} />)}
      </div>
      <div className="dash">
        <div className="sk sk-panel" />
        <div className="sk sk-panel" />
        <div className="sk sk-panel" />
        <div className="sk sk-panel" />
      </div>
    </div>
  );
}
