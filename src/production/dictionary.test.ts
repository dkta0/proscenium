import { describe, it, expect } from "vitest";
import { addWord, removeWord, isKnown, unknownWords } from "./dictionary";

describe("custom dictionary", () => {
  it("adds words case-insensitively without duplicates, sorted", () => {
    let d: string[] = [];
    d = addWord(d, "Zorro");
    d = addWord(d, "Ada");
    d = addWord(d, "ada");
    expect(d).toEqual(["Ada", "Zorro"]);
  });
  it("removes words case-insensitively", () => {
    expect(removeWord(["Ada", "Zorro"], "ADA")).toEqual(["Zorro"]);
  });
  it("knows added words regardless of case", () => {
    expect(isKnown(["Ada"], "ada")).toBe(true);
    expect(isKnown(["Ada"], "bob")).toBe(false);
  });
  it("reports unknown words from text", () => {
    expect(unknownWords(["the", "cat"], "The cat sat")).toEqual(["sat"]);
  });
});
