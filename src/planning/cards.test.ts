import { describe, it, expect } from "vitest";
import { buildCards } from "./cards";
import { Block } from "../io/fountain";

describe("buildCards", () => {
  it("creates one card per scene with a synopsis from the first action", () => {
    const blocks: Block[] = [
      { type: "scene_heading", text: "INT. HOUSE - DAY" },
      { type: "action", text: "A room, sunlit." },
      { type: "character", text: "HAMLET" },
      { type: "dialogue", text: "Hello." },
      { type: "scene_heading", text: "EXT. GARDEN - NIGHT" },
      { type: "action", text: "Rain falls." },
    ];
    const cards = buildCards(blocks);
    expect(cards).toEqual([
      { index: 0, heading: "INT. HOUSE - DAY", synopsis: "A room, sunlit." },
      { index: 4, heading: "EXT. GARDEN - NIGHT", synopsis: "Rain falls." },
    ]);
  });
  it("truncates long synopses", () => {
    const long = "x".repeat(200);
    const cards = buildCards([
      { type: "scene_heading", text: "INT. X" },
      { type: "action", text: long },
    ]);
    expect(cards[0].synopsis.endsWith("…")).toBe(true);
    expect(cards[0].synopsis.length).toBe(118);
  });
  it("returns no cards when there are no headings", () => {
    expect(buildCards([{ type: "action", text: "x" }])).toEqual([]);
  });
});
