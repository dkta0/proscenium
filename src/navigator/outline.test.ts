import { describe, it, expect } from "vitest";
import { buildOutline } from "./outline";
import { blocksToDoc } from "../io/blocks";

describe("outline", () => {
  it("lists act/scene headings with their block index", () => {
    const doc = blocksToDoc([
      { type: "act_scene", text: "ACT ONE" },
      { type: "dialogue", text: "x" },
      { type: "act_scene", text: "ACT TWO" },
    ]);
    expect(buildOutline(doc)).toEqual([
      { index: 0, text: "ACT ONE" },
      { index: 2, text: "ACT TWO" },
    ]);
  });
});
