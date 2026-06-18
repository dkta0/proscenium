import { describe, it, expect } from "vitest";
import { harvest, suggest } from "./harvest";

describe("smarttype harvest", () => {
  it("collects unique character names", () => {
    const lists = harvest([
      { type: "character", text: "HAMLET" },
      { type: "dialogue", text: "x" },
      { type: "character", text: "HAMLET" },
      { type: "character", text: "OPHELIA" },
    ]);
    expect(lists.characters).toEqual(["HAMLET", "OPHELIA"]);
  });
  it("collects scenes and transitions", () => {
    const lists = harvest([
      { type: "act_scene", text: "ACT ONE" },
      { type: "transition", text: "BLACKOUT" },
    ]);
    expect(lists.scenes).toContain("ACT ONE");
    expect(lists.transitions).toContain("BLACKOUT");
  });
});

describe("suggest", () => {
  it("prefix matches case-insensitively", () => {
    expect(suggest("ham", ["HAMLET", "OPHELIA"])).toEqual(["HAMLET"]);
  });
  it("returns at most 8", () => {
    const many = Array.from({ length: 20 }, (_, i) => `NAME${i}`);
    expect(suggest("name", many).length).toBe(8);
  });
});
