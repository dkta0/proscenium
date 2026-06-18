import { describe, it, expect, vi } from "vitest";
import { openOsp, importFountainFile } from "./commands";
import { createStore } from "../state/store";
import { emptyOsp, serializeOsp } from "../io/osp";

function fakeIo(overrides = {}) {
  return {
    openDialog: vi.fn(),
    saveDialog: vi.fn(),
    readTextFile: vi.fn(),
    writeTextFile: vi.fn(),
    writeBinaryFile: vi.fn(),
    ...overrides,
  };
}

describe("commands", () => {
  it("openOsp loads the chosen file into the store", async () => {
    const d = emptyOsp();
    d.titlePage.title = "Opened";
    const io = fakeIo({
      openDialog: vi.fn().mockResolvedValue("/x.osp"),
      readTextFile: vi.fn().mockResolvedValue(serializeOsp(d)),
    });
    const store = createStore();
    await openOsp(store, io);
    expect(store.getState().osp.titlePage.title).toBe("Opened");
  });

  it("importFountainFile fills the doc from fountain text", async () => {
    const io = fakeIo({
      openDialog: vi.fn().mockResolvedValue("/x.fountain"),
      readTextFile: vi.fn().mockResolvedValue("HAMLET\nWords."),
    });
    const store = createStore();
    await importFountainFile(store, io);
    const content = (store.getState().osp.doc as any).content;
    expect(content[0].type).toBe("character");
  });
});
