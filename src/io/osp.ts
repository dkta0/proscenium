import { FormatId } from "../formats/formats";

export const OSP_SCHEMA_VERSION = 1;

export interface TitlePage {
  title: string;
  author: string;
  contact: string;
  draftDate: string;
}

export interface SmartTypeLists {
  characters: string[];
  scenes: string[];
  transitions: string[];
}

export interface OspDocument {
  schemaVersion: number;
  format: FormatId;
  revisionIndex: number;
  titlePage: TitlePage;
  doc: object;
  smartTypeLists: SmartTypeLists;
}

export function emptyOsp(format: FormatId = "stageplay"): OspDocument {
  return {
    schemaVersion: OSP_SCHEMA_VERSION,
    format,
    revisionIndex: 0,
    titlePage: { title: "", author: "", contact: "", draftDate: "" },
    doc: { type: "doc", content: [{ type: "general", content: [] }] },
    smartTypeLists: { characters: [], scenes: [], transitions: [] },
  };
}

export function serializeOsp(d: OspDocument): string {
  return JSON.stringify(d, null, 2);
}

export function deserializeOsp(json: string): OspDocument {
  const parsed = JSON.parse(json) as OspDocument;
  if (parsed.schemaVersion !== OSP_SCHEMA_VERSION) {
    throw new Error(`Unsupported schema version: ${parsed.schemaVersion}`);
  }
  if (!parsed.format) parsed.format = "stageplay";
  if (typeof parsed.revisionIndex !== "number") parsed.revisionIndex = 0;
  return parsed;
}
