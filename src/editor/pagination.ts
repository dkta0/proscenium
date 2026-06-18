import { ElementType } from "./elements";
import { Block } from "../io/fountain";

export const LINES_PER_PAGE = 54;

// Approx characters per line per element at Courier 12 within stage-play margins.
export const ELEMENT_WIDTHS: Record<ElementType, number> = {
  act_scene: 60,
  stage_direction: 55,
  character: 35,
  dialogue: 35,
  parenthetical: 25,
  transition: 60,
  general: 60,
};

export function blockLineCount(block: Block): number {
  const width = ELEMENT_WIDTHS[block.type];
  const text = block.text ?? "";
  if (text.length === 0) return 1;
  return Math.max(1, Math.ceil(text.length / width));
}

export function paginate(blocks: Block[]): number[] {
  const pages: number[] = [];
  let page = 1;
  let used = 0;
  for (const b of blocks) {
    const lines = blockLineCount(b);
    if (used + lines > LINES_PER_PAGE && used > 0) {
      page += 1;
      used = 0;
    }
    pages.push(page);
    used += lines;
  }
  return pages;
}

export function pageCount(blocks: Block[]): number {
  const pages = paginate(blocks);
  return pages.length ? pages[pages.length - 1] : 1;
}
