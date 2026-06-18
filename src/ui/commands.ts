import { OspDocument } from "../io/osp";
import { importFountain } from "../io/fountain";
import { blocksToDoc, docToBlocks } from "../io/blocks";
import { exportFountain } from "../io/fountainExport";
import { exportPdf } from "../io/pdf";
import { harvest } from "../smarttype/harvest";
import { Store } from "../state/store";

export type Io = {
  openDialog: (f: any) => Promise<string | null>;
  saveDialog: (n: string, f: any) => Promise<string | null>;
  readTextFile: (p: string) => Promise<string>;
  writeTextFile: (p: string, c: string) => Promise<void>;
  writeBinaryFile: (p: string, b: Uint8Array) => Promise<void>;
};

const OSP_FILTER = [{ name: "Stage Play", extensions: ["osp"] }];
const FOUNTAIN_FILTER = [{ name: "Fountain", extensions: ["fountain"] }];
const PDF_FILTER = [{ name: "PDF", extensions: ["pdf"] }];

export async function openOsp(store: Store, io: Io) {
  const path = await io.openDialog(OSP_FILTER);
  if (!path) return;
  const json = await io.readTextFile(path);
  store.loadFromString(json);
  store.setPath(path);
}

export async function saveOsp(store: Store, io: Io) {
  const existing = store.getState().path;
  const path = existing ?? (await io.saveDialog("untitled.osp", OSP_FILTER));
  if (!path) return;
  await io.writeTextFile(path, store.toSaveString());
  store.setPath(path);
}

export async function importFountainFile(store: Store, io: Io) {
  const path = await io.openDialog(FOUNTAIN_FILTER);
  if (!path) return;
  const text = await io.readTextFile(path);
  const { blocks } = importFountain(text);
  store.setDoc(blocksToDoc(blocks));
  (store.getState().osp as OspDocument).smartTypeLists = harvest(blocks);
}

export async function exportFountainFile(store: Store, io: Io) {
  const path = await io.saveDialog("untitled.fountain", FOUNTAIN_FILTER);
  if (!path) return;
  const blocks = docToBlocks(store.getState().osp.doc);
  await io.writeTextFile(path, exportFountain(blocks));
}

export async function exportPdfFile(store: Store, io: Io) {
  const path = await io.saveDialog("untitled.pdf", PDF_FILTER);
  if (!path) return;
  const blocks = docToBlocks(store.getState().osp.doc);
  const bytes = await exportPdf(blocks, store.getState().osp.titlePage);
  await io.writeBinaryFile(path, bytes);
}
