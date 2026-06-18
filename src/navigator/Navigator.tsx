import { buildOutline } from "./outline";

export function Navigator({ doc, onJump }: { doc: object; onJump: (index: number) => void }) {
  const outline = buildOutline(doc);
  return (
    <nav className="navigator">
      <h2>Scenes</h2>
      {outline.length === 0 && <p className="empty">No acts or scenes yet</p>}
      {outline.map((o) => (
        <button key={o.index} onClick={() => onJump(o.index)}>
          {o.text}
        </button>
      ))}
    </nav>
  );
}
