import { describe, it, expect } from "vitest";
import { blockLineCount, paginate, pageCount, LINES_PER_PAGE } from "./pagination";

describe("pagination", () => {
  it("counts one line for short text", () => {
    expect(blockLineCount({ type: "dialogue", text: "Short." })).toBe(1);
  });
  it("wraps long dialogue across multiple lines", () => {
    const long = "x".repeat(200);
    expect(blockLineCount({ type: "dialogue", text: long })).toBeGreaterThan(1);
  });
  it("puts everything on page 1 when it fits", () => {
    const blocks = Array.from({ length: 10 }, () => ({ type: "dialogue" as const, text: "line" }));
    expect(paginate(blocks).every((p) => p === 1)).toBe(true);
    expect(pageCount(blocks)).toBe(1);
  });
  it("breaks to page 2 when lines exceed a page", () => {
    const blocks = Array.from({ length: LINES_PER_PAGE + 5 }, () => ({ type: "dialogue" as const, text: "line" }));
    const pages = paginate(blocks);
    expect(pages[pages.length - 1]).toBe(2);
    expect(pageCount(blocks)).toBe(2);
  });
});
