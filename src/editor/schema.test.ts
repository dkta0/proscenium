import { describe, it, expect } from "vitest";
import { Editor } from "@tiptap/core";
import { buildExtensions } from "./schema";
import { ELEMENT_TYPES } from "./elements";

describe("schema", () => {
  it("registers a node for every element type", () => {
    const editor = new Editor({ extensions: buildExtensions(), content: "" });
    for (const t of ELEMENT_TYPES) {
      expect(editor.schema.nodes[t]).toBeDefined();
    }
    editor.destroy();
  });

  it("round-trips a character block to HTML with data-element", () => {
    const editor = new Editor({
      extensions: buildExtensions(),
      content: {
        type: "doc",
        content: [{ type: "character", content: [{ type: "text", text: "HAMLET" }] }],
      },
    });
    expect(editor.getHTML()).toContain('data-element="character"');
    editor.destroy();
  });
});
