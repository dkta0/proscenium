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
  titlePage: TitlePage;
  doc: object;
  smartTypeLists: SmartTypeLists;
}

export function emptyOsp(): OspDocument {
  return {
    schemaVersion: OSP_SCHEMA_VERSION,
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
  return parsed;
}
