import { Block } from "../io/fountain";
import { ElementType, FormatSpec } from "../formats/formats";
import { paginate } from "../editor/pagination";

export interface CharacterStat {
  name: string;
  speeches: number;
  words: number;
}

export interface SceneStat {
  heading: string;
  page: number;
  index: number;
}

const HEADING_ELEMENTS: ElementType[] = ["act_scene", "scene_heading"];

function countWords(text: string): number {
  const t = text.trim();
  return t ? t.split(/\s+/).length : 0;
}

/**
 * Character report: for each speaking character, the number of speeches and
 * total words spoken. A "speech" is a run of dialogue following a character cue.
 */
export function characterReport(blocks: Block[]): CharacterStat[] {
  const stats = new Map<string, CharacterStat>();
  let current: string | null = null;

  for (const b of blocks) {
    if (b.type === "character") {
      current = b.text.trim().toUpperCase();
      if (current && !stats.has(current)) {
        stats.set(current, { name: current, speeches: 0, words: 0 });
      }
      if (current) stats.get(current)!.speeches += 1;
    } else if (b.type === "dialogue" && current) {
      stats.get(current)!.words += countWords(b.text);
    } else if (HEADING_ELEMENTS.includes(b.type)) {
      current = null;
    }
  }

  return [...stats.values()].sort((a, b) => b.words - a.words);
}

/** Scene report: each heading with the page it falls on. */
export function sceneReport(blocks: Block[], format?: FormatSpec): SceneStat[] {
  const pages = paginate(blocks, format?.widths);
  const out: SceneStat[] = [];
  blocks.forEach((b, index) => {
    if (HEADING_ELEMENTS.includes(b.type)) {
      out.push({ heading: b.text, page: pages[index], index });
    }
  });
  return out;
}

/**
 * Location report: extracts location names from scene headings. Strips a leading
 * INT./EXT. prefix and a trailing "- TIME" suffix, returning unique locations
 * with their occurrence counts.
 */
export function locationReport(blocks: Block[]): { location: string; count: number }[] {
  const counts = new Map<string, number>();
  for (const b of blocks) {
    if (!HEADING_ELEMENTS.includes(b.type)) continue;
    let loc = b.text.trim();
    loc = loc.replace(/^(INT\.\/EXT\.|INT\.|EXT\.)\s*/i, "");
    loc = loc.replace(/\s*[-–]\s*[^-–]*$/, "");
    loc = loc.trim().toUpperCase();
    if (!loc) continue;
    counts.set(loc, (counts.get(loc) ?? 0) + 1);
  }
  return [...counts.entries()]
    .map(([location, count]) => ({ location, count }))
    .sort((a, b) => b.count - a.count);
}
