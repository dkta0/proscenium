import { describe, it, expect } from "vitest";
import { Editor } from "@tiptap/core";
import { buildExtensions } from "./schema";
import { KeymapExtension, setElement, currentElement } from "./keymap";

function makeEditor() {
  return new Editor({
    extensions: [...buildExtensions(), KeymapExtension],
    content: { type: "doc", content: [{ type: "general", content: [] }] },
  });
}

describe("element commands", () => {
  it("setElement converts the current block type", () => {
    const editor = makeEditor();
    editor.commands.focus();
    expect(setElement(editor, "character")).toBe(true);
    expect(currentElement(editor)).toBe("character");
    editor.destroy();
  });
});
