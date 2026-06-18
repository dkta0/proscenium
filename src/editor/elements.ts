export type ElementType =
  | "act_scene"
  | "stage_direction"
  | "character"
  | "dialogue"
  | "parenthetical"
  | "transition"
  | "general";

export const ELEMENT_TYPES: ElementType[] = [
  "act_scene",
  "stage_direction",
  "character",
  "dialogue",
  "parenthetical",
  "transition",
  "general",
];

const ENTER_MAP: Record<ElementType, ElementType> = {
  act_scene: "stage_direction",
  stage_direction: "stage_direction",
  character: "dialogue",
  dialogue: "stage_direction",
  parenthetical: "dialogue",
  transition: "act_scene",
  general: "general",
};

export function nextOnEnter(current: ElementType): ElementType {
  return ENTER_MAP[current];
}

export function cycleForward(current: ElementType): ElementType {
  const i = ELEMENT_TYPES.indexOf(current);
  return ELEMENT_TYPES[(i + 1) % ELEMENT_TYPES.length];
}

export function cycleBackward(current: ElementType): ElementType {
  const i = ELEMENT_TYPES.indexOf(current);
  return ELEMENT_TYPES[(i - 1 + ELEMENT_TYPES.length) % ELEMENT_TYPES.length];
}
