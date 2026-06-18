import { describe, it, expect } from "vitest";
import { PDFDocument } from "pdf-lib";
import { exportPdf } from "./pdf";

describe("pdf export", () => {
  it("produces a valid multi-page PDF with a title page", async () => {
    const blocks = Array.from({ length: 60 }, () => ({
      type: "dialogue" as const,
      text: "A line of dialogue.",
    }));
    const bytes = await exportPdf(blocks, { title: "My Play", author: "Me", contact: "", draftDate: "" });
    const pdf = await PDFDocument.load(bytes);
    // 1 title page + at least 2 content pages
    expect(pdf.getPageCount()).toBeGreaterThanOrEqual(3);
  });
});
