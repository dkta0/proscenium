import { describe, it, expect } from "vitest";
import { FORMATS, nextOnEnter, cycleForward, cycleBackward, ALL_ELEMENT_TYPES } from "./formats";

describe("screenplay format", () => {
  const sp = FORMATS.screenplay;
  it("Enter from scene_heading goes to action", () => {
    expect(nextOnEnter(sp, "scene_heading")).toBe("action");
  });
  it("Enter from character goes to dialogue", () => {
    expect(nextOnEnter(sp, "character")).toBe("dialogue");
  });
  it("Enter from dialogue goes to action", () => {
    expect(nextOnEnter(sp, "dialogue")).toBe("action");
  });
  it("Tab cycles through screenplay elements and wraps", () => {
    const start = sp.elements[0];
    let t = start;
    for (let i = 0; i < sp.elements.length; i++) t = cycleForward(sp, t);
    expect(t).toBe(start);
  });
  it("Shift+Tab is the inverse of Tab", () => {
    expect(cycleBackward(sp, cycleForward(sp, "action"))).toBe("action");
  });
  it("uses scene_heading as the heading element", () => {
    expect(sp.headingElement).toBe("scene_heading");
  });
});

describe("stageplay format", () => {
  const sp = FORMATS.stageplay;
  it("Enter from character goes to dialogue", () => {
    expect(nextOnEnter(sp, "character")).toBe("dialogue");
  });
  it("Enter from dialogue goes to stage_direction", () => {
    expect(nextOnEnter(sp, "dialogue")).toBe("stage_direction");
  });
  it("uses act_scene as the heading element", () => {
    expect(sp.headingElement).toBe("act_scene");
  });
});

describe("teleplay format", () => {
  const tp = FORMATS.teleplay;
  it("includes act/teaser breaks", () => {
    expect(tp.elements).toContain("act_scene");
    expect(tp.labels["act_scene"]).toBe("Act/Teaser");
  });
  it("Enter from act_scene goes to scene_heading", () => {
    expect(nextOnEnter(tp, "act_scene")).toBe("scene_heading");
  });
});

describe("comic + manuscript formats", () => {
  it("comic relabels elements as pages/panels/balloons", () => {
    const c = FORMATS.comic;
    expect(c.labels["act_scene"]).toBe("Page");
    expect(c.labels["shot"]).toBe("Panel");
    expect(c.labels["dialogue"]).toBe("Balloon");
  });
  it("manuscript uses chapters and paragraphs", () => {
    const m = FORMATS.manuscript;
    expect(m.labels["act_scene"]).toBe("Chapter");
    expect(m.labels["general"]).toBe("Paragraph");
    expect(nextOnEnter(m, "general")).toBe("general");
  });
});

describe("element union", () => {
  it("contains every element used by every format", () => {
    for (const fmt of Object.values(FORMATS)) {
      for (const el of fmt.elements) {
        expect(ALL_ELEMENT_TYPES).toContain(el);
      }
    }
  });
});
