import { Block } from "../io/fountain";
import { ElementType } from "../formats/formats";

const HEADING_ELEMENTS: ElementType[] = ["act_scene", "scene_heading"];

/**
 * Assign sequential scene numbers to heading blocks. Returns an array aligned to
 * `blocks`: heading blocks get their number as a string ("1", "2", …); every
 * other block gets null.
 */
export function numberScenes(blocks: Block[]): (string | null)[] {
  let n = 0;
  return blocks.map((b) => {
    if (HEADING_ELEMENTS.includes(b.type)) {
      n += 1;
      return String(n);
    }
    return null;
  });
}

/** Total scene count. */
export function sceneCount(blocks: Block[]): number {
  return numberScenes(blocks).filter((x) => x !== null).length;
}
