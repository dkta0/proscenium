// Final Draft .fdx interop. FDX is an XML format whose <Content> holds a flat
// list of <Paragraph Type="..."><Text>...</Text></Paragraph> entries. We map
// FDX paragraph types to our element types and back.

import { Block } from "./fountain";
import { ElementType } from "../formats/formats";

const FDX_TO_ELEMENT: Record<string, ElementType> = {
  "Scene Heading": "scene_heading",
  Action: "action",
  Character: "character",
  Dialogue: "dialogue",
  Parenthetical: "parenthetical",
  Transition: "transition",
  Shot: "shot",
  General: "general",
  "New Act": "act_scene",
  "End of Act": "transition",
};

const ELEMENT_TO_FDX: Record<ElementType, string> = {
  scene_heading: "Scene Heading",
  action: "Action",
  character: "Character",
  dialogue: "Dialogue",
  parenthetical: "Parenthetical",
  transition: "Transition",
  shot: "Shot",
  general: "General",
  act_scene: "Scene Heading",
  stage_direction: "Action",
};

export interface FdxImportResult {
  blocks: Block[];
  warnings: string[];
}

export function importFdx(xml: string): FdxImportResult {
  const blocks: Block[] = [];
  const warnings: string[] = [];
  const doc = new DOMParser().parseFromString(xml, "application/xml");

  if (doc.getElementsByTagName("parsererror").length > 0) {
    throw new Error("Invalid FDX: XML could not be parsed");
  }

  const paragraphs = Array.from(doc.getElementsByTagName("Paragraph"));
  for (const p of paragraphs) {
    const fdxType = p.getAttribute("Type") ?? "General";
    const element = FDX_TO_ELEMENT[fdxType];
    if (!element) {
      warnings.push(`Unknown FDX paragraph type "${fdxType}" mapped to General`);
    }
    const text = Array.from(p.getElementsByTagName("Text"))
      .map((t) => t.textContent ?? "")
      .join("");
    blocks.push({ type: element ?? "general", text: text.trim() });
  }

  return { blocks, warnings };
}

function escapeXml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function exportFdx(blocks: Block[]): string {
  const lines = [
    '<?xml version="1.0" encoding="UTF-8" standalone="no"?>',
    '<FinalDraft DocumentType="Script" Template="No" Version="5">',
    "  <Content>",
  ];
  for (const b of blocks) {
    const type = ELEMENT_TO_FDX[b.type] ?? "General";
    lines.push(`    <Paragraph Type="${type}">`);
    lines.push(`      <Text>${escapeXml(b.text)}</Text>`);
    lines.push("    </Paragraph>");
  }
  lines.push("  </Content>");
  lines.push("</FinalDraft>");
  return lines.join("\n");
}
