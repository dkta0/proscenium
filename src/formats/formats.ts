// Document-type format definitions. Each format declares its element set,
// Enter-transition map, Tab cycle order, line widths, and display labels.
// The schema registers the UNION of all element types so one editor can render
// any format; the active FormatSpec governs editing behavior and layout.

export type ElementType =
  | "act_scene"
  | "scene_heading"
  | "stage_direction"
  | "action"
  | "character"
  | "dialogue"
  | "parenthetical"
  | "transition"
  | "shot"
  | "general";

export const ALL_ELEMENT_TYPES: ElementType[] = [
  "act_scene",
  "scene_heading",
  "stage_direction",
  "action",
  "character",
  "dialogue",
  "parenthetical",
  "transition",
  "shot",
  "general",
];

export type FormatId = "stageplay" | "screenplay";

export interface FormatSpec {
  id: FormatId;
  label: string;
  /** Elements offered in this format, in Tab-cycle order. */
  elements: ElementType[];
  /** Element produced when Enter is pressed from a given element. */
  enter: Record<string, ElementType>;
  /** Approx characters per line per element at Courier 12 within format margins. */
  widths: Record<string, number>;
  /** Display labels for the element picker. */
  labels: Record<string, string>;
  /** The "heading" element this format uses for the navigator/outline. */
  headingElement: ElementType;
}

const STAGEPLAY: FormatSpec = {
  id: "stageplay",
  label: "Stage Play",
  elements: ["act_scene", "stage_direction", "character", "dialogue", "parenthetical", "transition", "general"],
  enter: {
    act_scene: "stage_direction",
    stage_direction: "stage_direction",
    character: "dialogue",
    dialogue: "stage_direction",
    parenthetical: "dialogue",
    transition: "act_scene",
    general: "general",
  },
  widths: {
    act_scene: 60,
    stage_direction: 55,
    character: 35,
    dialogue: 35,
    parenthetical: 25,
    transition: 60,
    general: 60,
  },
  labels: {
    act_scene: "Act/Scene",
    stage_direction: "Stage Direction",
    character: "Character",
    dialogue: "Dialogue",
    parenthetical: "Parenthetical",
    transition: "Transition",
    general: "General",
  },
  headingElement: "act_scene",
};

const SCREENPLAY: FormatSpec = {
  id: "screenplay",
  label: "Screenplay",
  elements: ["scene_heading", "action", "character", "dialogue", "parenthetical", "transition", "shot", "general"],
  enter: {
    scene_heading: "action",
    action: "action",
    character: "dialogue",
    dialogue: "action",
    parenthetical: "dialogue",
    transition: "scene_heading",
    shot: "action",
    general: "general",
  },
  widths: {
    scene_heading: 60,
    action: 60,
    character: 38,
    dialogue: 35,
    parenthetical: 28,
    transition: 16,
    shot: 60,
    general: 60,
  },
  labels: {
    scene_heading: "Scene Heading",
    action: "Action",
    character: "Character",
    dialogue: "Dialogue",
    parenthetical: "Parenthetical",
    transition: "Transition",
    shot: "Shot",
    general: "General",
  },
  headingElement: "scene_heading",
};

export const FORMATS: Record<FormatId, FormatSpec> = {
  stageplay: STAGEPLAY,
  screenplay: SCREENPLAY,
};

export function nextOnEnter(fmt: FormatSpec, current: ElementType): ElementType {
  return fmt.enter[current] ?? current;
}

export function cycleForward(fmt: FormatSpec, current: ElementType): ElementType {
  const i = fmt.elements.indexOf(current);
  if (i === -1) return fmt.elements[0];
  return fmt.elements[(i + 1) % fmt.elements.length];
}

export function cycleBackward(fmt: FormatSpec, current: ElementType): ElementType {
  const i = fmt.elements.indexOf(current);
  if (i === -1) return fmt.elements[0];
  return fmt.elements[(i - 1 + fmt.elements.length) % fmt.elements.length];
}

/** Union of widths across all formats — used as a default for pagination. */
export const UNION_WIDTHS: Record<ElementType, number> = {
  act_scene: 60,
  scene_heading: 60,
  stage_direction: 55,
  action: 60,
  character: 38,
  dialogue: 35,
  parenthetical: 28,
  transition: 60,
  shot: 60,
  general: 60,
};
