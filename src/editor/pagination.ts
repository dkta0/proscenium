import { Block } from "../io/fountain";
import { UNION_WIDTHS } from "../formats/formats";

export const LINES_PER_PAGE = 54;

// Default widths cover every element type across all formats. A specific format
// can pass its own widths (FormatSpec.widths) for exact per-format pagination.
export const ELEMENT_WIDTHS = UNION_WIDTHS;

type Widths = Record<string, number>;

export function blockLineCount(block: Block, widths: Widths = ELEMENT_WIDTHS): number {
  const width = widths[block.type] ?? ELEMENT_WIDTHS[block.type] ?? 60;
  const text = block.text ?? "";
  if (text.length === 0) return 1;
  return Math.max(1, Math.ceil(text.length / width));
}

export function paginate(blocks: Block[], widths: Widths = ELEMENT_WIDTHS): number[] {
  const pages: number[] = [];
  let page = 1;
  let used = 0;
  for (const b of blocks) {
    const lines = blockLineCount(b, widths);
    if (used + lines > LINES_PER_PAGE && used > 0) {
      page += 1;
      used = 0;
    }
    pages.push(page);
    used += lines;
  }
  return pages;
}

export function pageCount(blocks: Block[], widths: Widths = ELEMENT_WIDTHS): number {
  const pages = paginate(blocks, widths);
  return pages.length ? pages[pages.length - 1] : 1;
}
