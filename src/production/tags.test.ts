import { describe, it, expect } from "vitest";
import { breakdown, autoTagCast, Tag } from "./tags";
import { Block } from "../io/fountain";

describe("autoTagCast", () => {
  it("tags each unique character as Cast", () => {
    const blocks: Block[] = [
      { type: "character", text: "HAMLET" },
      { type: "dialogue", text: "x" },
      { type: "character", text: "HAMLET" },
      { type: "character", text: "OPHELIA" },
    ];
    expect(autoTagCast(blocks).map((t) => t.text)).toEqual(["HAMLET", "OPHELIA"]);
  });
});

describe("breakdown", () => {
  it("groups and dedupes tags by category in canonical order", () => {
    const tags: Tag[] = [
      { category: "Props", text: "sword", blockIndex: 1 },
      { category: "Cast", text: "HAMLET", blockIndex: 0 },
      { category: "Props", text: "sword", blockIndex: 5 },
      { category: "Props", text: "crown", blockIndex: 6 },
    ];
    expect(breakdown(tags)).toEqual([
      { category: "Cast", items: ["HAMLET"] },
      { category: "Props", items: ["crown", "sword"] },
    ]);
  });
});
