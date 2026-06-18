import { Editor, Extension } from "@tiptap/core";
import { ElementType } from "./elements";
import { nextOnEnter, cycleForward, cycleBackward } from "./elements";

export function currentElement(editor: Editor): ElementType {
  return editor.state.selection.$from.parent.type.name as ElementType;
}

export function setElement(editor: Editor, type: ElementType): boolean {
  return editor.chain().focus().setNode(type).run();
}

export const KeymapExtension = Extension.create({
  name: "stageplayKeymap",
  addKeyboardShortcuts() {
    return {
      Enter: () => {
        const editor = this.editor;
        const cur = currentElement(editor);
        const next = nextOnEnter(cur);
        return editor.chain().splitBlock().setNode(next).run();
      },
      Tab: () => {
        const editor = this.editor;
        return setElement(editor, cycleForward(currentElement(editor)));
      },
      "Shift-Tab": () => {
        const editor = this.editor;
        return setElement(editor, cycleBackward(currentElement(editor)));
      },
    };
  },
});
