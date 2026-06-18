import { Block } from "./fountain";
import { ElementType } from "../editor/elements";

export function blocksToDoc(blocks: Block[]): object {
  const source = blocks.length ? blocks : [{ type: "general" as ElementType, text: "" }];
  const content = source.map((b) => ({
    type: b.type,
    content: b.text ? [{ type: "text", text: b.text }] : [],
  }));
  return { type: "doc", content };
}

export function docToBlocks(doc: any): Block[] {
  const nodes: any[] = doc?.content ?? [];
  return nodes.map((n) => ({
    type: n.type as ElementType,
    text: (n.content ?? []).map((c: any) => c.text ?? "").join(""),
  }));
}
