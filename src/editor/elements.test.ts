import { describe, it, expect } from "vitest";
import { nextOnEnter, cycleForward, cycleBackward, ELEMENT_TYPES } from "./elements";

describe("element transitions", () => {
  it("Enter from character goes to dialogue", () => {
    expect(nextOnEnter("character")).toBe("dialogue");
  });
  it("Enter from dialogue goes to stage_direction", () => {
    expect(nextOnEnter("dialogue")).toBe("stage_direction");
  });
  it("Enter from act_scene goes to stage_direction", () => {
    expect(nextOnEnter("act_scene")).toBe("stage_direction");
  });
  it("Tab cycles forward through all element types and wraps", () => {
    const start = ELEMENT_TYPES[0];
    let t = start;
    for (let i = 0; i < ELEMENT_TYPES.length; i++) t = cycleForward(t);
    expect(t).toBe(start);
  });
  it("Shift+Tab is the inverse of Tab", () => {
    expect(cycleBackward(cycleForward("character"))).toBe("character");
  });
});
