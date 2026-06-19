import { Editor, Extension } from "@tiptap/core";
import { ElementType, FormatSpec, FORMATS, nextOnEnter, cycleForward, cycleBackward } from "../formats/formats";

export function currentElement(editor: Editor): ElementType {
  return editor.state.selection.$from.parent.type.name as ElementType;
}

export function setElement(editor: Editor, type: ElementType): boolean {
  return editor.chain().focus().setNode(type).run();
}

/**
 * Build the element-cycling keymap for a given active format. The format is read
 * lazily via getFormat() so switching document type takes effect without
 * rebuilding the editor.
 */
export function makeKeymap(getFormat: () => FormatSpec) {
  return Extension.create({
    name: "stageplayKeymap",
    addKeyboardShortcuts() {
      return {
        Enter: () => {
          const editor = this.editor;
          const fmt = getFormat();
          const next = nextOnEnter(fmt, currentElement(editor));
          return editor.chain().splitBlock().setNode(next).run();
        },
        Tab: () => {
          const editor = this.editor;
          return setElement(editor, cycleForward(getFormat(), currentElement(editor)));
        },
        "Shift-Tab": () => {
          const editor = this.editor;
          return setElement(editor, cycleBackward(getFormat(), currentElement(editor)));
        },
      };
    },
  });
}

/** Default keymap bound to the stage-play format (backward-compatible export). */
export const KeymapExtension = makeKeymap(() => FORMATS.stageplay);
