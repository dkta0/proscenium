import { Block } from "./fountain";

export function exportFountain(blocks: Block[]): string {
  const out: string[] = [];
  let prev: string | null = null;
  for (const b of blocks) {
    // Blank line before block-starting elements for Fountain readability.
    if (prev && b.type !== "dialogue" && b.type !== "parenthetical") out.push("");
    switch (b.type) {
      case "parenthetical":
        out.push(b.text.startsWith("(") ? b.text : `(${b.text})`);
        break;
      case "character":
        out.push(b.text.toUpperCase());
        break;
      default:
        out.push(b.text);
    }
    prev = b.type;
  }
  return out.join("\n");
}
