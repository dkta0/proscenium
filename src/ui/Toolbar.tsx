import { Editor } from "@tiptap/core";
import * as files from "../io/files";
import * as cmd from "./commands";
import { ELEMENT_TYPES, ElementType } from "../editor/elements";
import { setElement } from "../editor/keymap";
import { Store } from "../state/store";

const ELEMENT_LABELS: Record<ElementType, string> = {
  act_scene: "Act/Scene",
  stage_direction: "Stage Direction",
  character: "Character",
  dialogue: "Dialogue",
  parenthetical: "Parenthetical",
  transition: "Transition",
  general: "General",
};

export function Toolbar({
  store,
  editor,
  onView,
  onToggleFind,
  onChanged,
}: {
  store: Store;
  editor: Editor | null;
  onView: (v: "script" | "title") => void;
  onToggleFind: () => void;
  onChanged: () => void;
}) {
  const run = async (fn: () => Promise<void>) => {
    await fn();
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
        <button onClick={() => run(() => cmd.exportPdfFile(store, files))}>Export PDF</button>
      </div>
      <div className="group">
        <select
          value={editor ? (editor.state.selection.$from.parent.type.name as ElementType) : "general"}
          onChange={(e) => editor && setElement(editor, e.target.value as ElementType)}
        >
          {ELEMENT_TYPES.map((t) => (
            <option key={t} value={t}>
              {ELEMENT_LABELS[t]}
            </option>
          ))}
        </select>
      </div>
      <div className="group">
        <button onClick={() => onView("script")}>Script</button>
        <button onClick={() => onView("title")}>Title Page</button>
        <button onClick={onToggleFind}>Find</button>
      </div>
    </div>
  );
}
