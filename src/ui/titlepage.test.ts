import { describe, it, expect } from "vitest";
import { createStore } from "../state/store";
import { updateTitlePage } from "./TitlePageEditor";

describe("updateTitlePage", () => {
  it("patches fields and marks dirty", () => {
    const store = createStore();
    updateTitlePage(store, { title: "My Play" });
    expect(store.getState().osp.titlePage.title).toBe("My Play");
    expect(store.getState().dirty).toBe(true);
  });
});
