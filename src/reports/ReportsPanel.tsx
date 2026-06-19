import { characterReport, sceneReport, locationReport } from "./reports";
import { breakdown, autoTagCast } from "../production/tags";
import { docToBlocks } from "../io/blocks";
import { FORMATS } from "../formats/formats";
import { Store } from "../state/store";

export function ReportsPanel({ store, onClose }: { store: Store; onClose: () => void }) {
  const blocks = docToBlocks(store.getState().osp.doc);
  const format = FORMATS[store.getState().osp.format];
  const characters = characterReport(blocks);
  const scenes = sceneReport(blocks, format);
  const locations = locationReport(blocks);
  const groups = breakdown(autoTagCast(blocks));

  return (
    <div className="reports-overlay" onClick={onClose}>
      <div className="reports" onClick={(e) => e.stopPropagation()}>
        <header>
          <h2>Reports</h2>
          <button onClick={onClose}>×</button>
        </header>

        <section>
          <h3>Characters</h3>
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Speeches</th>
                <th>Words</th>
              </tr>
            </thead>
            <tbody>
              {characters.map((c) => (
                <tr key={c.name}>
                  <td>{c.name}</td>
                  <td>{c.speeches}</td>
                  <td>{c.words}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {characters.length === 0 && <p className="empty">No characters yet</p>}
        </section>

        <section>
          <h3>Scenes</h3>
          <ol>
            {scenes.map((s) => (
              <li key={s.index}>
                <span className="scene-no">{s.number}</span> {s.heading}{" "}
                <span className="page">p.{s.page}</span>
              </li>
            ))}
          </ol>
          {scenes.length === 0 && <p className="empty">No scenes yet</p>}
        </section>

        <section>
          <h3>Locations</h3>
          <ul>
            {locations.map((l) => (
              <li key={l.location}>
                {l.location} <span className="page">×{l.count}</span>
              </li>
            ))}
          </ul>
          {locations.length === 0 && <p className="empty">No locations yet</p>}
        </section>

        <section>
          <h3>Production Breakdown</h3>
          {groups.map((g) => (
            <div key={g.category}>
              <strong>{g.category}</strong>: {g.items.join(", ")}
            </div>
          ))}
          {groups.length === 0 && <p className="empty">Nothing to break down yet</p>}
        </section>
      </div>
    </div>
  );
}
