import { describe, it, expect } from "vitest";
import { exportFountain } from "./fountainExport";
import { importFountain } from "./fountain";

describe("fountain export", () => {
  it("re-imports to the same block types (round-trip stable)", () => {
    const src = "INT. HOUSE - DAY\n\nHAMLET\n(aside)\nWords.\n\nBLACKOUT";
    const blocks = importFountain(src).blocks;
    const reblocks = importFountain(exportFountain(blocks)).blocks;
    expect(reblocks.map((b) => b.type)).toEqual(blocks.map((b) => b.type));
  });
});
