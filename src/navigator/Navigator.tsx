import { buildOutline } from "./outline";
import { ElementType } from "../formats/formats";

export function Navigator({
  doc,
  onJump,
  headingElement = "act_scene",
}: {
  doc: object;
  onJump: (index: number) => void;
  headingElement?: ElementType;
}) {
  const outline = buildOutline(doc, headingElement);
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
