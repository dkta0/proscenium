import { useState } from "react";
import { Editor } from "@tiptap/core";
import { findMatches } from "../editor/find";

export function FindBar({ editor, onClose }: { editor: Editor | null; onClose: () => void }) {
  const [query, setQuery] = useState("");
  const [replacement, setReplacement] = useState("");
  const [count, setCount] = useState<number | null>(null);

  const doFind = () => {
    if (!editor) return;
    setCount(findMatches(editor.getText(), query).length);
  };

  const doReplaceAll = () => {
    if (!editor || !query) return;
    const re = new RegExp(query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "gi");
    editor.state.doc.descendants((node, pos) => {
      if (!node.isText || !node.text) return;
      const replaced = node.text.replace(re, replacement);
      if (replaced !== node.text) {
        editor
          .chain()
          .insertContentAt({ from: pos, to: pos + node.text.length }, replaced)
          .run();
      }
    });
    setCount(0);
  };

  return (
    <div className="find-bar">
      <input placeholder="Find" value={query} onChange={(e) => setQuery(e.target.value)} onKeyUp={doFind} />
      <input placeholder="Replace" value={replacement} onChange={(e) => setReplacement(e.target.value)} />
      <button onClick={doFind}>Find</button>
      <button onClick={doReplaceAll}>Replace all</button>
      {count !== null && <span className="count">{count} match{count === 1 ? "" : "es"}</span>}
      <button onClick={onClose}>×</button>
    </div>
  );
}
