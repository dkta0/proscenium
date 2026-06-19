import { Block } from "../io/fountain";
import { ElementType } from "../formats/formats";

const HEADING_ELEMENTS: ElementType[] = ["act_scene", "scene_heading"];
const SYNOPSIS_ELEMENTS: ElementType[] = ["stage_direction", "action"];

export interface Card {
  index: number;
  heading: string;
  synopsis: string;
}

/**
 * Build index cards from the document: one card per scene heading, with a
 * synopsis drawn from the first action/stage-direction line in that scene.
 */
export function buildCards(blocks: Block[]): Card[] {
  const cards: Card[] = [];
  let current: Card | null = null;

  blocks.forEach((b, index) => {
    if (HEADING_ELEMENTS.includes(b.type)) {
      current = { index, heading: b.text, synopsis: "" };
      cards.push(current);
    } else if (current && !current.synopsis && SYNOPSIS_ELEMENTS.includes(b.type)) {
      const text = b.text.trim();
      current.synopsis = text.length > 120 ? text.slice(0, 117) + "…" : text;
    }
  });

  return cards;
}
