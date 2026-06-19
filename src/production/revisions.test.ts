import { describe, it, expect } from "vitest";
import { REVISION_SETS, revisionAt, nextRevisionIndex, revisionName } from "./revisions";

describe("revisions", () => {
  it("starts at Production White", () => {
    expect(revisionName(0)).toBe("Production White");
  });
  it("advances Blue -> Pink in standard order", () => {
    expect(revisionName(1)).toBe("Blue Revision");
    expect(revisionName(nextRevisionIndex(1))).toBe("Pink Revision");
  });
  it("clamps at the last defined revision", () => {
    const last = REVISION_SETS.length - 1;
    expect(nextRevisionIndex(last)).toBe(last);
  });
  it("clamps out-of-range indices", () => {
    expect(revisionAt(-5)).toBe(REVISION_SETS[0]);
    expect(revisionAt(999)).toBe(REVISION_SETS[REVISION_SETS.length - 1]);
  });
});
