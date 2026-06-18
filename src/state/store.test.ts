import { describe, it, expect } from "vitest";
import { createStore } from "./store";
import { emptyOsp, serializeOsp } from "../io/osp";

describe("document store", () => {
  it("starts clean", () => {
    expect(createStore().getState().dirty).toBe(false);
  });
  it("markDirty sets dirty and notifies subscribers", () => {
    const s = createStore();
    let notified = false;
    s.subscribe(() => (notified = true));
    s.markDirty();
    expect(s.getState().dirty).toBe(true);
    expect(notified).toBe(true);
  });
  it("loadFromString replaces doc and clears dirty", () => {
    const s = createStore();
    s.markDirty();
    const d = emptyOsp();
    d.titlePage.title = "Loaded";
    s.loadFromString(serializeOsp(d));
    expect(s.getState().osp.titlePage.title).toBe("Loaded");
    expect(s.getState().dirty).toBe(false);
  });
});
