// native details element: works without JavaScript and is keyboard and screen reader friendly
export default function Reveal({ title, children, open = false }) {
  return (
    <details className="reveal" open={open}>
      <summary>{title}</summary>
      <div className="inner">{children}</div>
    </details>
  );
}
