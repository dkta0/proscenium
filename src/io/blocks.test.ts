import { describe, it, expect } from "vitest";
import { blocksToDoc, docToBlocks } from "./blocks";

describe("block <-> doc", () => {
  it("round-trips blocks through a doc", () => {
    const blocks = [
      { type: "act_scene" as const, text: "ACT ONE" },
      { type: "character" as const, text: "HAMLET" },
      { type: "dialogue" as const, text: "Words." },
    ];
    expect(docToBlocks(blocksToDoc(blocks))).toEqual(blocks);
  });
  it("produces a doc node with element-typed children", () => {
    const doc = blocksToDoc([{ type: "character", text: "OPHELIA" }]) as any;
    expect(doc.type).toBe("doc");
    expect(doc.content[0].type).toBe("character");
  });
});
