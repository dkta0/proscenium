import { describe, it, expect } from "vitest";
import { findMatches, replaceAll } from "./find";

describe("find/replace helpers", () => {
  it("finds all case-insensitive match offsets", () => {
    expect(findMatches("Hamlet and hamlet", "hamlet")).toEqual([0, 11]);
  });
  it("replaces all occurrences", () => {
    expect(replaceAll("a A a", "a", "b")).toBe("b b b");
  });
  it("returns empty for empty query", () => {
    expect(findMatches("text", "")).toEqual([]);
  });
});
