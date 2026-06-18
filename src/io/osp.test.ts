import { describe, it, expect } from "vitest";
import { serializeOsp, deserializeOsp, emptyOsp, OSP_SCHEMA_VERSION } from "./osp";

describe("osp round-trip", () => {
  it("serializes then deserializes to an equal document", () => {
    const d = emptyOsp();
    d.titlePage.title = "The Test";
    d.doc = { type: "doc", content: [{ type: "general", content: [{ type: "text", text: "hi" }] }] };
    const round = deserializeOsp(serializeOsp(d));
    expect(round).toEqual(d);
  });
  it("sets the current schema version", () => {
    expect(emptyOsp().schemaVersion).toBe(OSP_SCHEMA_VERSION);
  });
  it("rejects an unsupported schema version", () => {
    const bad = JSON.stringify({ ...emptyOsp(), schemaVersion: 999 });
    expect(() => deserializeOsp(bad)).toThrow(/schema version/i);
  });
  it("rejects malformed json", () => {
    expect(() => deserializeOsp("{not json")).toThrow();
  });
});
