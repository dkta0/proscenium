// Final Draft-style revision drafts. Productions iterate through a standard
// ordered sequence of named, colored revision sets ("Blue Revision", "Pink
// Revision", …). The first draft is white/unrevised.

export interface RevisionSet {
  name: string;
  color: string; // CSS color
}

// Standard Final Draft revision order.
export const REVISION_SETS: RevisionSet[] = [
  { name: "Production White", color: "#ffffff" },
  { name: "Blue Revision", color: "#bcd9ff" },
  { name: "Pink Revision", color: "#ffc8e0" },
  { name: "Yellow Revision", color: "#fff4b0" },
  { name: "Green Revision", color: "#bdf0c4" },
  { name: "Goldenrod Revision", color: "#ffd95e" },
  { name: "Buff Revision", color: "#f0e2c0" },
  { name: "Salmon Revision", color: "#ffb59e" },
  { name: "Cherry Revision", color: "#f6a8b8" },
];

export function revisionAt(index: number): RevisionSet {
  return REVISION_SETS[Math.max(0, Math.min(index, REVISION_SETS.length - 1))];
}

/** Advance to the next revision draft; clamps at the last defined set. */
export function nextRevisionIndex(index: number): number {
  return Math.min(index + 1, REVISION_SETS.length - 1);
}

export function revisionName(index: number): string {
  return revisionAt(index).name;
}
