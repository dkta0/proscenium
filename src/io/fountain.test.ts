import { describe, it, expect } from "vitest";
import { importFountain } from "./fountain";

describe("fountain import", () => {
  it("maps a scene heading", () => {
    const { blocks } = importFountain("INT. HOUSE - DAY");
    expect(blocks[0]).toEqual({ type: "act_scene", text: "INT. HOUSE - DAY" });
  });
  it("maps character then dialogue", () => {
    const { blocks } = importFountain("HAMLET\nTo be or not to be.");
    expect(blocks[0].type).toBe("character");
    expect(blocks[1]).toEqual({ type: "dialogue", text: "To be or not to be." });
  });
  it("maps a parenthetical", () => {
    const { blocks } = importFountain("HAMLET\n(aside)\nWords.");
    expect(blocks[1].type).toBe("parenthetical");
    expect(blocks[2].type).toBe("dialogue");
  });
  it("maps a transition", () => {
    const { blocks } = importFountain("BLACKOUT");
    expect(blocks[0].type).toBe("transition");
  });
  it("falls back to stage_direction for plain prose", () => {
    const { blocks } = importFountain("The lights dim slowly.");
    expect(blocks[0].type).toBe("stage_direction");
  });
});
