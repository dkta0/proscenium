import { buildCards } from "./cards";
import { numberScenes } from "../production/sceneNumbers";
import { docToBlocks } from "../io/blocks";
import { Store } from "../state/store";

export function CardsPanel({
  store,
  onJump,
  onClose,
}: {
  store: Store;
  onJump: (index: number) => void;
  onClose: () => void;
}) {
  const blocks = docToBlocks(store.getState().osp.doc);
  const cards = buildCards(blocks);
  const numbers = numberScenes(blocks);

  return (
    <div className="cards-overlay" onClick={onClose}>
      <div className="cards" onClick={(e) => e.stopPropagation()}>
        <header>
          <h2>Index Cards</h2>
          <button onClick={onClose}>×</button>
        </header>
        <div className="card-grid">
          {cards.map((c) => (
            <button key={c.index} className="card" onClick={() => onJump(c.index)}>
              <span className="card-no">{numbers[c.index] ?? ""}</span>
              <strong>{c.heading}</strong>
              <p>{c.synopsis || <em>No synopsis</em>}</p>
            </button>
          ))}
          {cards.length === 0 && <p className="empty">No scenes yet</p>}
        </div>
      </div>
    </div>
  );
}
