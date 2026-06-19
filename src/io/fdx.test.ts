import { describe, it, expect } from "vitest";
import { importFdx, exportFdx } from "./fdx";
import { Block } from "./fountain";

const SAMPLE_FDX = `<?xml version="1.0" encoding="UTF-8" standalone="no"?>
<FinalDraft DocumentType="Script" Template="No" Version="5">
  <Content>
    <Paragraph Type="Scene Heading"><Text>INT. HOUSE - DAY</Text></Paragraph>
    <Paragraph Type="Action"><Text>A room.</Text></Paragraph>
    <Paragraph Type="Character"><Text>HAMLET</Text></Paragraph>
    <Paragraph Type="Dialogue"><Text>To be or not to be.</Text></Paragraph>
  </Content>
</FinalDraft>`;

describe("fdx import", () => {
  it("maps FDX paragraph types to element types", () => {
    const { blocks } = importFdx(SAMPLE_FDX);
    expect(blocks.map((b) => b.type)).toEqual(["scene_heading", "action", "character", "dialogue"]);
    expect(blocks[0].text).toBe("INT. HOUSE - DAY");
    expect(blocks[3].text).toBe("To be or not to be.");
  });
  it("throws on invalid xml", () => {
    expect(() => importFdx("<not valid")).toThrow();
  });
});

describe("fdx export", () => {
  it("round-trips through import to the same blocks", () => {
    const blocks: Block[] = [
      { type: "scene_heading", text: "EXT. PARK - DAY" },
      { type: "character", text: "OPHELIA" },
      { type: "dialogue", text: "My lord & friend" },
    ];
    const reimported = importFdx(exportFdx(blocks)).blocks;
    expect(reimported).toEqual(blocks);
  });
  it("escapes special characters", () => {
    const xml = exportFdx([{ type: "action", text: "a < b & c" }]);
    expect(xml).toContain("a &lt; b &amp; c");
  });
});
