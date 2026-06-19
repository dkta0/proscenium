import { useRef, useState } from "react";
import { Editor } from "@tiptap/core";
import { StagePlayEditor } from "./editor/Editor";
import { Toolbar } from "./ui/Toolbar";
import { FindBar } from "./ui/FindBar";
import { Navigator } from "./navigator/Navigator";
import { TitlePageEditor } from "./ui/TitlePageEditor";
import { createStore } from "./state/store";
import { FORMATS } from "./formats/formats";
import "./App.css";

export default function App() {
  const store = useRef(createStore()).current;
  const [editor, setEditor] = useState<Editor | null>(null);
  const [view, setView] = useState<"script" | "title">("script");
  const [showFind, setShowFind] = useState(false);
  const [, forceRender] = useState(0);
  const rerender = () => forceRender((n) => n + 1);

  const jumpToBlock = (index: number) => {
    if (!editor) return;
    let pos = 0;
    const doc = editor.state.doc;
    for (let i = 0; i < index && i < doc.childCount; i++) {
      pos += doc.child(i).nodeSize;
    }
    editor.chain().focus().setTextSelection(pos + 1).scrollIntoView().run();
  };

  return (
    <div className="app">
      <Toolbar
        store={store}
        editor={editor}
        onView={(v) => {
          setView(v);
          rerender();
        }}
        onToggleFind={() => setShowFind((s) => !s)}
        onChanged={rerender}
      />
      {showFind && <FindBar editor={editor} onClose={() => setShowFind(false)} />}
      <div className="body">
        <Navigator
          doc={store.getState().osp.doc}
          onJump={jumpToBlock}
          headingElement={FORMATS[store.getState().osp.format].headingElement}
        />
        <main>
          {view === "script" ? (
            <StagePlayEditor store={store} onEditor={setEditor} />
          ) : (
            <TitlePageEditor store={store} />
          )}
        </main>
      </div>
    </div>
  );
}
