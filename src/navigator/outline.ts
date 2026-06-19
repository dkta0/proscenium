import { docToBlocks } from "../io/blocks";
import { ElementType } from "../formats/formats";

export function buildOutline(
  doc: object,
  headingElement: ElementType = "act_scene"
): { index: number; text: string }[] {
  return docToBlocks(doc)
    .map((b, index) => ({ b, index }))
    .filter(({ b }) => b.type === headingElement)
    .map(({ b, index }) => ({ index, text: b.text }));
}
