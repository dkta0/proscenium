import { ElementType } from "../editor/elements";

export interface Block {
  type: ElementType;
  text: string;
}
export interface ImportResult {
  blocks: Block[];
  warnings: string[];
}

const TRANSITIONS = new Set(["BLACKOUT", "END OF ACT", "CURTAIN"]);

function isCaps(line: string): boolean {
  return line.length > 0 && line === line.toUpperCase() && /[A-Z]/.test(line);
}
function isSceneHeading(line: string): boolean {
  return /^(INT\.|EXT\.|INT\.\/EXT\.|ACT\b|SCENE\b)/i.test(line.trim());
}
function isTransition(line: string): boolean {
  const t = line.trim();
  return (isCaps(t) && t.endsWith("TO:")) || TRANSITIONS.has(t.toUpperCase());
}
function isParenthetical(line: string): boolean {
  const t = line.trim();
  return t.startsWith("(") && t.endsWith(")");
}

export function importFountain(text: string): ImportResult {
  const lines = text.replace(/\r\n/g, "\n").split("\n");
  const blocks: Block[] = [];
  const warnings: string[] = [];
  let prev: ElementType | null = null;

  for (let i = 0; i < lines.length; i++) {
    const raw = lines[i];
    const line = raw.trimEnd();
    if (line.trim() === "") {
      prev = null;
      continue;
    }
    const hasNext = !!(lines[i + 1] && lines[i + 1].trim() !== "");
    let type: ElementType;
    if (isSceneHeading(line)) {
      type = "act_scene";
    } else if (isTransition(line)) {
      type = "transition";
    } else if (isParenthetical(line)) {
      type = "parenthetical";
    } else if (isCaps(line) && hasNext) {
      type = "character";
    } else if (prev === "character" || prev === "parenthetical") {
      type = "dialogue";
    } else {
      type = "stage_direction";
    }
    if (isCaps(line) && !hasNext && !isSceneHeading(line) && !isTransition(line)) {
      warnings.push(`Line ${i + 1}: CAPS line with no dialogue following`);
    }
    blocks.push({ type, text: line.trim() });
    prev = type;
  }
  return { blocks, warnings };
}
