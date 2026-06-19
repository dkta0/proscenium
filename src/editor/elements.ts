// Backward-compatible stage-play surface over the format-aware module in
// src/formats/formats.ts. New code should prefer importing FormatSpec-aware
// helpers from "../formats/formats"; these bound-to-stageplay exports remain
// for existing call sites and tests.
import { FORMATS, ElementType as FmtElementType } from "../formats/formats";
import * as formats from "../formats/formats";

export type ElementType = FmtElementType;

const STAGEPLAY = FORMATS.stageplay;

export const ELEMENT_TYPES: ElementType[] = STAGEPLAY.elements;

export function nextOnEnter(current: ElementType): ElementType {
  return formats.nextOnEnter(STAGEPLAY, current);
}

export function cycleForward(current: ElementType): ElementType {
  return formats.cycleForward(STAGEPLAY, current);
}

export function cycleBackward(current: ElementType): ElementType {
  return formats.cycleBackward(STAGEPLAY, current);
}
