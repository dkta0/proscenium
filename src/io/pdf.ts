import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { Block } from "./fountain";
import { TitlePage } from "./osp";
import { LINES_PER_PAGE, blockLineCount, ELEMENT_WIDTHS } from "../editor/pagination";

const PAGE_W = 612; // 8.5in * 72
const PAGE_H = 792; // 11in * 72
const MARGIN = 72; // 1in
const FONT_SIZE = 12;
const LINE_H = (PAGE_H - 2 * MARGIN) / LINES_PER_PAGE;

function wrap(text: string, width: number): string[] {
  if (!text) return [""];
  const out: string[] = [];
  for (let i = 0; i < text.length; i += width) out.push(text.slice(i, i + width));
  return out;
}

export async function exportPdf(blocks: Block[], titlePage: TitlePage): Promise<Uint8Array> {
  const pdf = await PDFDocument.create();
  const font = await pdf.embedFont(StandardFonts.Courier);

  // Title page.
  const tp = pdf.addPage([PAGE_W, PAGE_H]);
  tp.drawText(titlePage.title || "Untitled", {
    x: MARGIN,
    y: PAGE_H / 2,
    size: 18,
    font,
    color: rgb(0, 0, 0),
  });
  if (titlePage.author) {
    tp.drawText(`by ${titlePage.author}`, { x: MARGIN, y: PAGE_H / 2 - 30, size: 12, font });
  }

  let page = pdf.addPage([PAGE_W, PAGE_H]);
  let line = 0;
  const newPage = () => {
    page = pdf.addPage([PAGE_W, PAGE_H]);
    line = 0;
  };
  for (const b of blocks) {
    const needed = blockLineCount(b);
    if (line + needed > LINES_PER_PAGE && line > 0) newPage();
    const indent = b.type === "dialogue" || b.type === "parenthetical" ? MARGIN + 72 : MARGIN;
    const text = b.type === "character" ? b.text.toUpperCase() : b.text;
    for (const seg of wrap(text, ELEMENT_WIDTHS[b.type])) {
      const y = PAGE_H - MARGIN - line * LINE_H;
      page.drawText(seg, { x: indent, y, size: FONT_SIZE, font });
      line += 1;
    }
  }

  // Page numbers on content pages (skip title page at index 0).
  const pages = pdf.getPages();
  for (let i = 1; i < pages.length; i++) {
    pages[i].drawText(String(i), { x: PAGE_W - MARGIN, y: PAGE_H - MARGIN / 2, size: 10, font });
  }
  return pdf.save();
}
