import { useEffect, useState } from "react";
import { Editor } from "@tiptap/core";
import { useEditor, EditorContent } from "@tiptap/react";
import { buildExtensions } from "./schema";
import { makeKeymap, currentElement } from "./keymap";
import { ElementType, FORMATS } from "../formats/formats";
import { harvest } from "../smarttype/harvest";
import { suggest } from "../smarttype/harvest";
import { SuggestionList } from "../smarttype/SmartType";
import { docToBlocks } from "../io/blocks";
import { SmartTypeLists } from "../io/osp";
import { Store } from "../state/store";
import "./elements.css";

const SMARTTYPE_ELEMENTS: Record<string, keyof SmartTypeLists> = {
  character: "characters",
  act_scene: "scenes",
  scene_heading: "scenes",
  transition: "transitions",
};

function currentWord(editor: Editor): string {
  const { $from } = editor.state.selection;
  return $from.parent.textContent.slice(0, $from.parentOffset);
}

export function StagePlayEditor({ store, onEditor }: { store: Store; onEditor?: (e: Editor) => void }) {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [active, setActive] = useState(0);

  const editor = useEditor({
    extensions: [...buildExtensions(), makeKeymap(() => FORMATS[store.getState().osp.format])],
    content: store.getState().osp.doc as any,
    editorProps: { attributes: { spellcheck: "true" } },
    onUpdate: ({ editor }) => {
      store.setDoc(editor.getJSON());
      store.getState().osp.smartTypeLists = harvest(docToBlocks(editor.getJSON()));
      refreshSuggestions(editor);
    },
    onSelectionUpdate: ({ editor }) => refreshSuggestions(editor),
  });

  function refreshSuggestions(ed: Editor) {
    const el = currentElement(ed) as ElementType;
    const listKey = SMARTTYPE_ELEMENTS[el];
    if (!listKey) {
      setSuggestions([]);
      return;
    }
    const prefix = currentWord(ed);
    const lists = store.getState().osp.smartTypeLists;
    setSuggestions(suggest(prefix, lists[listKey]));
    setActive(0);
  }

  function pick(value: string) {
    if (!editor) return;
    const prefixLen = currentWord(editor).length;
    editor
      .chain()
      .focus()
      .command(({ tr, state }) => {
        const pos = state.selection.from;
        tr.insertText(value, pos - prefixLen, pos);
        return true;
      })
      .run();
    setSuggestions([]);
  }

  useEffect(() => {
    if (editor && onEditor) onEditor(editor);
  }, [editor, onEditor]);

  return (
    <div className="editor-wrap">
      <EditorContent editor={editor} />
      <SuggestionList items={suggestions} active={active} onPick={pick} />
    </div>
  );
}
