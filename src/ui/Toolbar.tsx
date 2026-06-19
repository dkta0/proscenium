import { Editor } from "@tiptap/core";
import * as files from "../io/files";
import * as cmd from "./commands";
import { setElement } from "../editor/keymap";
import { ElementType, FormatId, FORMATS } from "../formats/formats";
import { Store } from "../state/store";

export function Toolbar({
  store,
  editor,
  onView,
  onToggleFind,
  onToggleReports,
  onChanged,
}: {
  store: Store;
  editor: Editor | null;
  onView: (v: "script" | "title") => void;
  onToggleFind: () => void;
  onToggleReports: () => void;
  onChanged: () => void;
}) {
  const run = async (fn: () => Promise<void>) => {
    await fn();
    onChanged();
  };

  const format = FORMATS[store.getState().osp.format];
  const currentType = editor
    ? (editor.state.selection.$from.parent.type.name as ElementType)
    : format.elements[0];

  const setFormat = (id: FormatId) => {
    store.getState().osp.format = id;
    store.markDirty();
    onChanged();
  };

  return (
    <div className="toolbar">
      <div className="group">
        <button onClick={() => run(() => cmd.openOsp(store, files))}>Open</button>
        <button onClick={() => run(() => cmd.saveOsp(store, files))}>Save</button>
      </div>
      <div className="group">
        <button onClick={() => run(() => cmd.importFountainFile(store, files))}>Import .fountain</button>
        <button onClick={() => run(() => cmd.exportFountainFile(store, files))}>Export .fountain</button>
        <button onClick={() => run(() => cmd.importFdxFile(store, files))}>Import .fdx</button>
        <button onClick={() => run(() => cmd.exportFdxFile(store, files))}>Export .fdx</button>
        <button onClick={() => run(() => cmd.exportPdfFile(store, files))}>Export PDF</button>
      </div>
      <div className="group">
        <label className="field">
          Format
          <select value={format.id} onChange={(e) => setFormat(e.target.value as FormatId)}>
            {Object.values(FORMATS).map((f) => (
              <option key={f.id} value={f.id}>
                {f.label}
              </option>
            ))}
          </select>
        </label>
      </div>
      <div className="group">
        <select
          value={currentType}
          onChange={(e) => editor && setElement(editor, e.target.value as ElementType)}
        >
          {format.elements.map((t) => (
            <option key={t} value={t}>
              {format.labels[t] ?? t}
            </option>
          ))}
        </select>
      </div>
      <div className="group">
        <button onClick={() => onView("script")}>Script</button>
        <button onClick={() => onView("title")}>Title Page</button>
        <button onClick={onToggleFind}>Find</button>
        <button onClick={onToggleReports}>Reports</button>
      </div>
    </div>
  );
}
