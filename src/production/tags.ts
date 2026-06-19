// Production breakdown tagging. Each tag assigns a piece of the script to a
// breakdown category (Cast, Props, Wardrobe, …). The breakdown groups tags by
// category for scheduling/budget reports.

import { Block } from "../io/fountain";
import { ElementType } from "../formats/formats";

export const TAG_CATEGORIES = [
  "Cast",
  "Background",
  "Props",
  "Wardrobe",
  "Makeup",
  "Vehicles",
  "Sound",
  "Special Effects",
  "Set Dressing",
] as const;

export type TagCategory = (typeof TAG_CATEGORIES)[number];

export interface Tag {
  category: TagCategory;
  text: string;
  blockIndex: number;
}

const HEADING_ELEMENTS: ElementType[] = ["act_scene", "scene_heading"];

export interface BreakdownGroup {
  category: TagCategory;
  items: string[];
}

/** Group tags by category, deduping item text within a category. */
export function breakdown(tags: Tag[]): BreakdownGroup[] {
  const byCat = new Map<TagCategory, Set<string>>();
  for (const t of tags) {
    if (!byCat.has(t.category)) byCat.set(t.category, new Set());
    byCat.get(t.category)!.add(t.text);
  }
  return TAG_CATEGORIES.filter((c) => byCat.has(c)).map((category) => ({
    category,
    items: [...byCat.get(category)!].sort((a, b) => a.localeCompare(b)),
  }));
}

/**
 * Auto-tag a script's Cast category from its character cues — a useful starting
 * breakdown that mirrors Final Draft's "tag all characters" helper.
 */
export function autoTagCast(blocks: Block[]): Tag[] {
  const tags: Tag[] = [];
  const seen = new Set<string>();
  blocks.forEach((b, blockIndex) => {
    if (b.type !== "character") return;
    void HEADING_ELEMENTS;
    const name = b.text.trim().toUpperCase();
    if (name && !seen.has(name)) {
      seen.add(name);
      tags.push({ category: "Cast", text: name, blockIndex });
    }
  });
  return tags;
}
