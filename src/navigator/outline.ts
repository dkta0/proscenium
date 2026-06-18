import { docToBlocks } from "../io/blocks";

export function buildOutline(doc: object): { index: number; text: string }[] {
  return docToBlocks(doc)
    .map((b, index) => ({ b, index }))
    .filter(({ b }) => b.type === "act_scene")
    .map(({ b, index }) => ({ index, text: b.text }));
}
