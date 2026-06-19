import { describe, it, expect } from "vitest";
import { characterReport, sceneReport, locationReport } from "./reports";
import { Block } from "../io/fountain";

const SCRIPT: Block[] = [
  { type: "scene_heading", text: "INT. HOUSE - DAY" },
  { type: "character", text: "HAMLET" },
  { type: "dialogue", text: "To be or not to be" },
  { type: "character", text: "OPHELIA" },
  { type: "dialogue", text: "My lord" },
  { type: "scene_heading", text: "EXT. GARDEN - NIGHT" },
  { type: "character", text: "HAMLET" },
  { type: "dialogue", text: "Get thee to a nunnery now" },
];

describe("characterReport", () => {
  it("counts speeches and words per character, sorted by words", () => {
    const r = characterReport(SCRIPT);
    expect(r[0]).toEqual({ name: "HAMLET", speeches: 2, words: 12 });
    expect(r.find((c) => c.name === "OPHELIA")).toEqual({ name: "OPHELIA", speeches: 1, words: 2 });
  });
});

describe("sceneReport", () => {
  it("lists each heading with its page", () => {
    const r = sceneReport(SCRIPT);
    expect(r.map((s) => s.heading)).toEqual(["INT. HOUSE - DAY", "EXT. GARDEN - NIGHT"]);
    expect(r[0].page).toBe(1);
  });
});

describe("locationReport", () => {
  it("extracts unique locations from headings", () => {
    const r = locationReport(SCRIPT);
    expect(r).toEqual([
      { location: "HOUSE", count: 1 },
      { location: "GARDEN", count: 1 },
    ]);
  });
  it("merges repeated locations", () => {
    const r = locationReport([
      { type: "scene_heading", text: "INT. OFFICE - DAY" },
      { type: "scene_heading", text: "INT. OFFICE - NIGHT" },
    ]);
    expect(r).toEqual([{ location: "OFFICE", count: 2 }]);
  });
});
