import { describe, it, expect } from "vitest";
import { numberScenes, sceneCount } from "./sceneNumbers";
import { Block } from "../io/fountain";

const SCRIPT: Block[] = [
  { type: "scene_heading", text: "INT. A - DAY" },
  { type: "action", text: "x" },
  { type: "scene_heading", text: "EXT. B - NIGHT" },
  { type: "dialogue", text: "y" },
  { type: "act_scene", text: "ACT TWO" },
];

describe("numberScenes", () => {
  it("numbers headings sequentially and nulls non-headings", () => {
    expect(numberScenes(SCRIPT)).toEqual(["1", null, "2", null, "3"]);
  });
  it("counts scenes", () => {
    expect(sceneCount(SCRIPT)).toBe(3);
  });
  it("handles a script with no scenes", () => {
    expect(sceneCount([{ type: "action", text: "x" }])).toBe(0);
  });
});
