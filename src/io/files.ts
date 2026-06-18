import { invoke } from "@tauri-apps/api/core";
import { open, save } from "@tauri-apps/plugin-dialog";

export type FileFilter = { name: string; extensions: string[] };

export function openDialog(filters: FileFilter[]): Promise<string | null> {
  return open({ multiple: false, filters }) as Promise<string | null>;
}

export function saveDialog(defaultPath: string, filters: FileFilter[]): Promise<string | null> {
  return save({ defaultPath, filters });
}

export function readTextFile(path: string): Promise<string> {
  return invoke("read_text_file", { path });
}

export function writeTextFile(path: string, contents: string): Promise<void> {
  return invoke("write_text_file", { path, contents });
}

export function writeBinaryFile(path: string, bytes: Uint8Array): Promise<void> {
  return invoke("write_binary_file", { path, bytes: Array.from(bytes) });
}
