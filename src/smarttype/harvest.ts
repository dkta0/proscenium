import { Block } from "../io/fountain";
import { SmartTypeLists } from "../io/osp";

function uniq(values: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const v of values) {
    const key = v.toUpperCase();
    if (v.trim() && !seen.has(key)) {
      seen.add(key);
      out.push(v);
    }
  }
  return out;
}

export function harvest(blocks: Block[]): SmartTypeLists {
  return {
    characters: uniq(blocks.filter((b) => b.type === "character").map((b) => b.text)),
    scenes: uniq(blocks.filter((b) => b.type === "act_scene").map((b) => b.text)),
    transitions: uniq(blocks.filter((b) => b.type === "transition").map((b) => b.text)),
  };
}

export function suggest(prefix: string, candidates: string[]): string[] {
  const p = prefix.trim().toLowerCase();
  if (!p) return [];
  return candidates.filter((c) => c.toLowerCase().startsWith(p)).slice(0, 8);
}
