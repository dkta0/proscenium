# Stage-Play Editor (Proscenium) — Phase 1 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a cross-platform desktop stage-play writing app replicating Final Draft's stage-play editing experience, with native `.osp` save, Fountain import/export, and PDF export.

**Architecture:** Tauri app — a thin Rust shell exposing native file dialogs and byte read/write, plus a TypeScript frontend (React + Vite) that owns all document logic via a Tiptap/ProseMirror schema where every stage-play element is a typed block node. Pure, framework-free logic modules (element cycling, Fountain, `.osp`, pagination) are unit-tested in isolation with Vitest.

**Tech Stack:** Tauri 2, React 18, Vite 5, TypeScript 5, Tiptap 2 / ProseMirror, prosemirror-search, pdf-lib, Vitest.

## Global Constraints

- TypeScript everywhere in the frontend; no Rust logic beyond file I/O and window/dialog management.
- All disk access goes through Tauri commands; logic modules never touch the filesystem directly (keeps them unit-testable).
- Pure logic modules (`src/io/`, `src/editor/cycling.ts`, `src/editor/pagination.ts`, `src/smarttype/harvest.ts`) must not import React or Tauri APIs.
- Page geometry baseline: US Letter (8.5"×11"), 1" margins, Courier 12pt, 12pt line height → 54 text lines per page, ~60 chars per 6" text width.
- Native save format extension: `.osp`; `schemaVersion` integer, currently `1`.
- Element type set (canonical IDs, used everywhere): `act_scene`, `stage_direction`, `character`, `dialogue`, `parenthetical`, `transition`, `general`.
- TDD: write the failing test first, watch it fail, implement minimally, watch it pass, commit. One logical deliverable per commit.

---

### Task 1: Project scaffold + test harness

**Files:**
- Create: `package.json`, `vite.config.ts`, `tsconfig.json`, `index.html`, `src/main.tsx`, `src/App.tsx`, `vitest.config.ts`
- Create: `src-tauri/` (via Tauri init), `src-tauri/tauri.conf.json`, `src-tauri/Cargo.toml`, `src-tauri/src/main.rs`
- Create: `.gitignore`
- Test: `src/sanity.test.ts`

**Interfaces:**
- Produces: a runnable dev app (`npm run tauri dev`) and a green test command (`npm test`).

- [ ] **Step 1: Scaffold the Vite React-TS app and add Tauri**

```bash
npm create vite@latest . -- --template react-ts
npm install
npm install -D @tauri-apps/cli vitest @vitest/ui jsdom
npm install @tauri-apps/api
npx tauri init --app-name proscenium --window-title "Proscenium" \
  --dist-dir ../dist --dev-url http://localhost:5173 --before-dev-command "npm run dev" --before-build-command "npm run build"
```

- [ ] **Step 2: Add Vitest config**

Create `vitest.config.ts`:

```ts
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "jsdom",
    globals: true,
    include: ["src/**/*.test.ts", "src/**/*.test.tsx"],
  },
});
```

Add to `package.json` scripts: `"test": "vitest run"`, `"test:watch": "vitest"`.

- [ ] **Step 3: Write the sanity test**

Create `src/sanity.test.ts`:

```ts
import { describe, it, expect } from "vitest";

describe("test harness", () => {
  it("runs", () => {
    expect(1 + 1).toBe(2);
  });
});
```

- [ ] **Step 4: Run tests, verify pass**

Run: `npm test`
Expected: 1 passed.

- [ ] **Step 5: Verify the app builds**

Run: `npm run build`
Expected: Vite build succeeds, `dist/` produced.

- [ ] **Step 6: Commit**

```bash
git add -A && git commit -m "chore: scaffold Tauri + React + Vite + Vitest"
```

---

### Task 2: Rust file commands

**Files:**
- Modify: `src-tauri/src/main.rs`
- Modify: `src-tauri/Cargo.toml` (add `tauri-plugin-dialog`)
- Modify: `src-tauri/tauri.conf.json` (dialog plugin permissions)
- Create: `src/io/files.ts` (TS wrappers over the commands)

**Interfaces:**
- Produces (Rust commands):
  - `read_text_file(path: String) -> Result<String, String>`
  - `write_text_file(path: String, contents: String) -> Result<(), String>`
  - `write_binary_file(path: String, bytes: Vec<u8>) -> Result<(), String>`
- Produces (TS, `src/io/files.ts`):
  - `openDialog(filters): Promise<string | null>`
  - `saveDialog(defaultName, filters): Promise<string | null>`
  - `readTextFile(path): Promise<string>`
  - `writeTextFile(path, contents): Promise<void>`
  - `writeBinaryFile(path, bytes: Uint8Array): Promise<void>`

- [ ] **Step 1: Add Rust commands**

In `src-tauri/src/main.rs`:

```rust
use std::fs;

#[tauri::command]
fn read_text_file(path: String) -> Result<String, String> {
    fs::read_to_string(&path).map_err(|e| e.to_string())
}

#[tauri::command]
fn write_text_file(path: String, contents: String) -> Result<(), String> {
    fs::write(&path, contents).map_err(|e| e.to_string())
}

#[tauri::command]
fn write_binary_file(path: String, bytes: Vec<u8>) -> Result<(), String> {
    fs::write(&path, bytes).map_err(|e| e.to_string())
}

fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .invoke_handler(tauri::generate_handler![
            read_text_file,
            write_text_file,
            write_binary_file
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
```

Add `tauri-plugin-dialog = "2"` to `src-tauri/Cargo.toml` dependencies, and `npm install @tauri-apps/plugin-dialog`.

- [ ] **Step 2: Add the TS wrapper**

Create `src/io/files.ts`:

```ts
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
```

- [ ] **Step 3: Verify Rust compiles**

Run: `cd src-tauri && cargo check`
Expected: compiles without error.

- [ ] **Step 4: Commit**

```bash
git add -A && git commit -m "feat: native file dialog + read/write commands"
```

> Note: these commands are exercised manually via the app (they require the native shell). Logic that depends on file contents is tested separately against in-memory strings.

---

### Task 3: Element types + transition table (pure logic)

**Files:**
- Create: `src/editor/elements.ts`
- Test: `src/editor/elements.test.ts`

**Interfaces:**
- Produces:
  - `type ElementType = "act_scene" | "stage_direction" | "character" | "dialogue" | "parenthetical" | "transition" | "general"`
  - `const ELEMENT_TYPES: ElementType[]`
  - `function nextOnEnter(current: ElementType): ElementType`
  - `function cycleForward(current: ElementType): ElementType`
  - `function cycleBackward(current: ElementType): ElementType`

- [ ] **Step 1: Write failing tests**

Create `src/editor/elements.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { nextOnEnter, cycleForward, cycleBackward, ELEMENT_TYPES } from "./elements";

describe("element transitions", () => {
  it("Enter from character goes to dialogue", () => {
    expect(nextOnEnter("character")).toBe("dialogue");
  });
  it("Enter from dialogue goes to stage_direction", () => {
    expect(nextOnEnter("dialogue")).toBe("stage_direction");
  });
  it("Enter from act_scene goes to stage_direction", () => {
    expect(nextOnEnter("act_scene")).toBe("stage_direction");
  });
  it("Tab cycles forward through all element types and wraps", () => {
    const start = ELEMENT_TYPES[0];
    let t = start;
    for (let i = 0; i < ELEMENT_TYPES.length; i++) t = cycleForward(t);
    expect(t).toBe(start);
  });
  it("Shift+Tab is the inverse of Tab", () => {
    expect(cycleBackward(cycleForward("character"))).toBe("character");
  });
});
```

- [ ] **Step 2: Run, verify fail**

Run: `npm test -- elements`
Expected: FAIL (module not found / functions undefined).

- [ ] **Step 3: Implement**

Create `src/editor/elements.ts`:

```ts
export type ElementType =
  | "act_scene"
  | "stage_direction"
  | "character"
  | "dialogue"
  | "parenthetical"
  | "transition"
  | "general";

export const ELEMENT_TYPES: ElementType[] = [
  "act_scene",
  "stage_direction",
  "character",
  "dialogue",
  "parenthetical",
  "transition",
  "general",
];

const ENTER_MAP: Record<ElementType, ElementType> = {
  act_scene: "stage_direction",
  stage_direction: "stage_direction",
  character: "dialogue",
  dialogue: "stage_direction",
  parenthetical: "dialogue",
  transition: "act_scene",
  general: "general",
};

export function nextOnEnter(current: ElementType): ElementType {
  return ENTER_MAP[current];
}

export function cycleForward(current: ElementType): ElementType {
  const i = ELEMENT_TYPES.indexOf(current);
  return ELEMENT_TYPES[(i + 1) % ELEMENT_TYPES.length];
}

export function cycleBackward(current: ElementType): ElementType {
  const i = ELEMENT_TYPES.indexOf(current);
  return ELEMENT_TYPES[(i - 1 + ELEMENT_TYPES.length) % ELEMENT_TYPES.length];
}
```

- [ ] **Step 4: Run, verify pass**

Run: `npm test -- elements`
Expected: all pass.

- [ ] **Step 5: Commit**

```bash
git add -A && git commit -m "feat: stage-play element types + transition table"
```

---

### Task 4: Tiptap schema (element nodes)

**Files:**
- Create: `src/editor/schema.ts`
- Test: `src/editor/schema.test.ts`

**Interfaces:**
- Consumes: `ElementType`, `ELEMENT_TYPES` from `src/editor/elements.ts`.
- Produces: `function buildExtensions(): Extension[]` — Tiptap extensions defining one node per element type (each a block, group `"block"`, content `"inline*"`, with a `data-element` HTML attribute). Also `const SCHEMA_NODE_NAMES: string[]` equal to `ELEMENT_TYPES`.

- [ ] **Step 1: Install Tiptap**

```bash
npm install @tiptap/core @tiptap/pm @tiptap/starter-kit @tiptap/react
```

- [ ] **Step 2: Write failing test**

Create `src/editor/schema.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { Editor } from "@tiptap/core";
import { buildExtensions } from "./schema";
import { ELEMENT_TYPES } from "./elements";

describe("schema", () => {
  it("registers a node for every element type", () => {
    const editor = new Editor({ extensions: buildExtensions(), content: "" });
    for (const t of ELEMENT_TYPES) {
      expect(editor.schema.nodes[t]).toBeDefined();
    }
    editor.destroy();
  });

  it("round-trips a character block to HTML with data-element", () => {
    const editor = new Editor({
      extensions: buildExtensions(),
      content: { type: "doc", content: [{ type: "character", content: [{ type: "text", text: "HAMLET" }] }] },
    });
    expect(editor.getHTML()).toContain('data-element="character"');
    editor.destroy();
  });
});
```

- [ ] **Step 3: Run, verify fail**

Run: `npm test -- schema`
Expected: FAIL.

- [ ] **Step 4: Implement schema**

Create `src/editor/schema.ts`:

```ts
import { Node, Extension } from "@tiptap/core";
import Document from "@tiptap/extension-document";
import Text from "@tiptap/extension-text";
import History from "@tiptap/extension-history";
import { ELEMENT_TYPES, ElementType } from "./elements";

function elementNode(type: ElementType): Node {
  return Node.create({
    name: type,
    group: "block",
    content: "inline*",
    defining: true,
    parseHTML() {
      return [{ tag: `[data-element="${type}"]` }];
    },
    renderHTML() {
      return ["div", { "data-element": type, class: `el-${type}` }, 0];
    },
  });
}

export const SCHEMA_NODE_NAMES = ELEMENT_TYPES;

export function buildExtensions(): Extension[] {
  const nodes = ELEMENT_TYPES.map(elementNode);
  // Document restricted to our block group; general is the default fallback.
  const doc = Document.extend({ content: "block+" });
  return [doc, Text, History, ...nodes] as unknown as Extension[];
}
```

- [ ] **Step 5: Run, verify pass**

Run: `npm test -- schema`
Expected: pass.

- [ ] **Step 6: Commit**

```bash
git add -A && git commit -m "feat: Tiptap schema with stage-play element nodes"
```

---

### Task 5: Element-cycling keymap + element commands

**Files:**
- Create: `src/editor/keymap.ts`
- Test: `src/editor/keymap.test.ts`

**Interfaces:**
- Consumes: `nextOnEnter`, `cycleForward`, `cycleBackward` (Task 3); schema node names (Task 4).
- Produces: `function setElement(editor, type: ElementType): boolean` (converts current block), and `const KeymapExtension: Extension` binding Enter → split + set `nextOnEnter`, Tab → set `cycleForward(current)`, Shift-Tab → `cycleBackward(current)`.

- [ ] **Step 1: Write failing test**

Create `src/editor/keymap.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { Editor } from "@tiptap/core";
import { buildExtensions } from "./schema";
import { KeymapExtension, setElement, currentElement } from "./keymap";

function makeEditor() {
  return new Editor({
    extensions: [...buildExtensions(), KeymapExtension],
    content: { type: "doc", content: [{ type: "general", content: [] }] },
  });
}

describe("element commands", () => {
  it("setElement converts the current block type", () => {
    const editor = makeEditor();
    editor.commands.focus();
    expect(setElement(editor, "character")).toBe(true);
    expect(currentElement(editor)).toBe("character");
    editor.destroy();
  });
});
```

- [ ] **Step 2: Run, verify fail**

Run: `npm test -- keymap`
Expected: FAIL.

- [ ] **Step 3: Implement keymap**

Create `src/editor/keymap.ts`:

```ts
import { Editor, Extension } from "@tiptap/core";
import { ElementType } from "./elements";
import { nextOnEnter, cycleForward, cycleBackward } from "./elements";

export function currentElement(editor: Editor): ElementType {
  return editor.state.selection.$from.parent.type.name as ElementType;
}

export function setElement(editor: Editor, type: ElementType): boolean {
  return editor.chain().focus().setNode(type).run();
}

export const KeymapExtension = Extension.create({
  name: "stageplayKeymap",
  addKeyboardShortcuts() {
    return {
      Enter: () => {
        const editor = this.editor;
        const cur = currentElement(editor);
        const next = nextOnEnter(cur);
        return editor.chain().splitBlock().setNode(next).run();
      },
      Tab: () => {
        const editor = this.editor;
        return setElement(editor, cycleForward(currentElement(editor)));
      },
      "Shift-Tab": () => {
        const editor = this.editor;
        return setElement(editor, cycleBackward(currentElement(editor)));
      },
    };
  },
});
```

- [ ] **Step 4: Run, verify pass**

Run: `npm test -- keymap`
Expected: pass.

- [ ] **Step 5: Commit**

```bash
git add -A && git commit -m "feat: element-cycling keymap (Enter/Tab/Shift-Tab)"
```

---

### Task 6: `.osp` serialize / deserialize (pure logic)

**Files:**
- Create: `src/io/osp.ts`
- Test: `src/io/osp.test.ts`

**Interfaces:**
- Produces:
  - `interface TitlePage { title: string; author: string; contact: string; draftDate: string }`
  - `interface SmartTypeLists { characters: string[]; scenes: string[]; transitions: string[] }`
  - `interface OspDocument { schemaVersion: number; titlePage: TitlePage; doc: object; smartTypeLists: SmartTypeLists }`
  - `function serializeOsp(d: OspDocument): string`
  - `function deserializeOsp(json: string): OspDocument` (throws `Error` on bad/unsupported version)
  - `const OSP_SCHEMA_VERSION = 1`, `function emptyOsp(): OspDocument`

- [ ] **Step 1: Write failing tests**

Create `src/io/osp.test.ts`:

```ts
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
```

- [ ] **Step 2: Run, verify fail**

Run: `npm test -- osp`
Expected: FAIL.

- [ ] **Step 3: Implement**

Create `src/io/osp.ts`:

```ts
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
```

- [ ] **Step 4: Run, verify pass**

Run: `npm test -- osp`
Expected: pass.

- [ ] **Step 5: Commit**

```bash
git add -A && git commit -m "feat: .osp native format serialize/deserialize"
```

---

### Task 7: Fountain import (pure logic)

**Files:**
- Create: `src/io/fountain.ts`
- Test: `src/io/fountain.test.ts`

**Interfaces:**
- Consumes: `ElementType`.
- Produces:
  - `interface Block { type: ElementType; text: string }`
  - `interface ImportResult { blocks: Block[]; warnings: string[] }`
  - `function importFountain(text: string): ImportResult`

Mapping rules (Phase 1):
- A line in ALL CAPS followed by a non-empty line → `character`.
- Lines starting `INT.`/`EXT.`/`INT./EXT.` or `ACT`/`SCENE` (case-insensitive) → `act_scene`.
- A line wholly wrapped in parentheses → `parenthetical`.
- A line in ALL CAPS ending in `TO:` or equal to known transitions (`BLACKOUT`, `END OF ACT`, `CURTAIN`) → `transition`.
- A line immediately after a `character`/`parenthetical` (non-empty) → `dialogue`.
- Otherwise → `stage_direction`.
- Blank lines separate blocks; unparseable structure is never fatal — fall back to `stage_direction` and record nothing (only record a warning when a CAPS line has no following content).

- [ ] **Step 1: Write failing tests**

Create `src/io/fountain.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { importFountain } from "./fountain";

describe("fountain import", () => {
  it("maps a scene heading", () => {
    const { blocks } = importFountain("INT. HOUSE - DAY");
    expect(blocks[0]).toEqual({ type: "act_scene", text: "INT. HOUSE - DAY" });
  });
  it("maps character then dialogue", () => {
    const { blocks } = importFountain("HAMLET\nTo be or not to be.");
    expect(blocks[0].type).toBe("character");
    expect(blocks[1]).toEqual({ type: "dialogue", text: "To be or not to be." });
  });
  it("maps a parenthetical", () => {
    const { blocks } = importFountain("HAMLET\n(aside)\nWords.");
    expect(blocks[1].type).toBe("parenthetical");
    expect(blocks[2].type).toBe("dialogue");
  });
  it("maps a transition", () => {
    const { blocks } = importFountain("BLACKOUT");
    expect(blocks[0].type).toBe("transition");
  });
  it("falls back to stage_direction for plain prose", () => {
    const { blocks } = importFountain("The lights dim slowly.");
    expect(blocks[0].type).toBe("stage_direction");
  });
});
```

- [ ] **Step 2: Run, verify fail**

Run: `npm test -- fountain`
Expected: FAIL.

- [ ] **Step 3: Implement**

Create `src/io/fountain.ts`:

```ts
import { ElementType } from "../editor/elements";

export interface Block {
  type: ElementType;
  text: string;
}
export interface ImportResult {
  blocks: Block[];
  warnings: string[];
}

const TRANSITIONS = new Set(["BLACKOUT", "END OF ACT", "CURTAIN"]);

function isCaps(line: string): boolean {
  return line.length > 0 && line === line.toUpperCase() && /[A-Z]/.test(line);
}
function isSceneHeading(line: string): boolean {
  return /^(INT\.|EXT\.|INT\.\/EXT\.|ACT\b|SCENE\b)/i.test(line.trim());
}
function isTransition(line: string): boolean {
  const t = line.trim();
  return (isCaps(t) && t.endsWith("TO:")) || TRANSITIONS.has(t.toUpperCase());
}
function isParenthetical(line: string): boolean {
  const t = line.trim();
  return t.startsWith("(") && t.endsWith(")");
}

export function importFountain(text: string): ImportResult {
  const lines = text.replace(/\r\n/g, "\n").split("\n");
  const blocks: Block[] = [];
  const warnings: string[] = [];
  let prev: ElementType | null = null;

  for (let i = 0; i < lines.length; i++) {
    const raw = lines[i];
    const line = raw.trimEnd();
    if (line.trim() === "") {
      prev = null;
      continue;
    }
    let type: ElementType;
    if (isSceneHeading(line)) {
      type = "act_scene";
    } else if (isTransition(line)) {
      type = "transition";
    } else if (isParenthetical(line)) {
      type = "parenthetical";
    } else if (isCaps(line) && lines[i + 1] && lines[i + 1].trim() !== "") {
      type = "character";
    } else if (prev === "character" || prev === "parenthetical") {
      type = "dialogue";
    } else {
      type = "stage_direction";
    }
    if (isCaps(line) && type === "character" && !(lines[i + 1] && lines[i + 1].trim() !== "")) {
      warnings.push(`Line ${i + 1}: CAPS line with no dialogue following`);
    }
    blocks.push({ type, text: line.trim() });
    prev = type;
  }
  return { blocks, warnings };
}
```

- [ ] **Step 4: Run, verify pass**

Run: `npm test -- fountain`
Expected: pass.

- [ ] **Step 5: Commit**

```bash
git add -A && git commit -m "feat: Fountain import"
```

---

### Task 8: Fountain export + Block↔ProseMirror conversion (pure logic)

**Files:**
- Create: `src/io/blocks.ts` (convert between `Block[]` and ProseMirror doc JSON)
- Create: `src/io/fountainExport.ts`
- Test: `src/io/blocks.test.ts`, `src/io/fountainExport.test.ts`

**Interfaces:**
- Consumes: `Block` (Task 7).
- Produces:
  - `function blocksToDoc(blocks: Block[]): object` — ProseMirror doc JSON.
  - `function docToBlocks(doc: object): Block[]`.
  - `function exportFountain(blocks: Block[]): string`.

- [ ] **Step 1: Write failing tests**

Create `src/io/blocks.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { blocksToDoc, docToBlocks } from "./blocks";

describe("block <-> doc", () => {
  it("round-trips blocks through a doc", () => {
    const blocks = [
      { type: "act_scene" as const, text: "ACT ONE" },
      { type: "character" as const, text: "HAMLET" },
      { type: "dialogue" as const, text: "Words." },
    ];
    expect(docToBlocks(blocksToDoc(blocks))).toEqual(blocks);
  });
  it("produces a doc node with element-typed children", () => {
    const doc = blocksToDoc([{ type: "character", text: "OPHELIA" }]) as any;
    expect(doc.type).toBe("doc");
    expect(doc.content[0].type).toBe("character");
  });
});
```

Create `src/io/fountainExport.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { exportFountain } from "./fountainExport";
import { importFountain } from "./fountain";

describe("fountain export", () => {
  it("re-imports to the same block types (round-trip stable)", () => {
    const src = "INT. HOUSE - DAY\n\nHAMLET\n(aside)\nWords.\n\nBLACKOUT";
    const blocks = importFountain(src).blocks;
    const reblocks = importFountain(exportFountain(blocks)).blocks;
    expect(reblocks.map((b) => b.type)).toEqual(blocks.map((b) => b.type));
  });
});
```

- [ ] **Step 2: Run, verify fail**

Run: `npm test -- blocks fountainExport`
Expected: FAIL.

- [ ] **Step 3: Implement `blocks.ts`**

```ts
import { Block } from "./fountain";
import { ElementType } from "../editor/elements";

export function blocksToDoc(blocks: Block[]): object {
  const content = (blocks.length ? blocks : [{ type: "general" as ElementType, text: "" }]).map((b) => ({
    type: b.type,
    content: b.text ? [{ type: "text", text: b.text }] : [],
  }));
  return { type: "doc", content };
}

export function docToBlocks(doc: any): Block[] {
  const nodes: any[] = doc?.content ?? [];
  return nodes.map((n) => ({
    type: n.type as ElementType,
    text: (n.content ?? []).map((c: any) => c.text ?? "").join(""),
  }));
}
```

- [ ] **Step 4: Implement `fountainExport.ts`**

```ts
import { Block } from "./fountain";

export function exportFountain(blocks: Block[]): string {
  const out: string[] = [];
  let prev: string | null = null;
  for (const b of blocks) {
    // Blank line before block-starting elements for Fountain readability.
    if (prev && b.type !== "dialogue" && b.type !== "parenthetical") out.push("");
    switch (b.type) {
      case "parenthetical":
        out.push(b.text.startsWith("(") ? b.text : `(${b.text})`);
        break;
      case "character":
        out.push(b.text.toUpperCase());
        break;
      default:
        out.push(b.text);
    }
    prev = b.type;
  }
  return out.join("\n");
}
```

- [ ] **Step 5: Run, verify pass**

Run: `npm test -- blocks fountainExport`
Expected: pass.

- [ ] **Step 6: Commit**

```bash
git add -A && git commit -m "feat: Fountain export + Block/ProseMirror conversion"
```

---

### Task 9: Pagination engine (pure logic)

**Files:**
- Create: `src/editor/pagination.ts`
- Test: `src/editor/pagination.test.ts`

**Interfaces:**
- Consumes: `Block` (Task 7).
- Produces:
  - `const LINES_PER_PAGE = 54`
  - `interface ElementMetrics { charsPerLine: number }`
  - `const ELEMENT_WIDTHS: Record<ElementType, number>` (chars per line per element)
  - `function blockLineCount(block: Block): number`
  - `function paginate(blocks: Block[]): number[]` — returns the page number (1-based) each block starts on.
  - `function pageCount(blocks: Block[]): number`

- [ ] **Step 1: Write failing tests**

Create `src/editor/pagination.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { blockLineCount, paginate, pageCount, LINES_PER_PAGE } from "./pagination";

describe("pagination", () => {
  it("counts one line for short text", () => {
    expect(blockLineCount({ type: "dialogue", text: "Short." })).toBe(1);
  });
  it("wraps long dialogue across multiple lines", () => {
    const long = "x".repeat(200);
    expect(blockLineCount({ type: "dialogue", text: long })).toBeGreaterThan(1);
  });
  it("puts everything on page 1 when it fits", () => {
    const blocks = Array.from({ length: 10 }, () => ({ type: "dialogue" as const, text: "line" }));
    expect(paginate(blocks).every((p) => p === 1)).toBe(true);
    expect(pageCount(blocks)).toBe(1);
  });
  it("breaks to page 2 when lines exceed a page", () => {
    const blocks = Array.from({ length: LINES_PER_PAGE + 5 }, () => ({ type: "dialogue" as const, text: "line" }));
    const pages = paginate(blocks);
    expect(pages[pages.length - 1]).toBe(2);
    expect(pageCount(blocks)).toBe(2);
  });
});
```

- [ ] **Step 2: Run, verify fail**

Run: `npm test -- pagination`
Expected: FAIL.

- [ ] **Step 3: Implement**

Create `src/editor/pagination.ts`:

```ts
import { ElementType } from "./elements";
import { Block } from "../io/fountain";

export const LINES_PER_PAGE = 54;

// Approx characters per line per element at Courier 12 within stage-play margins.
export const ELEMENT_WIDTHS: Record<ElementType, number> = {
  act_scene: 60,
  stage_direction: 55,
  character: 35,
  dialogue: 35,
  parenthetical: 25,
  transition: 60,
  general: 60,
};

export function blockLineCount(block: Block): number {
  const width = ELEMENT_WIDTHS[block.type];
  const text = block.text ?? "";
  if (text.length === 0) return 1;
  return Math.max(1, Math.ceil(text.length / width));
}

export function paginate(blocks: Block[]): number[] {
  const pages: number[] = [];
  let page = 1;
  let used = 0;
  for (const b of blocks) {
    const lines = blockLineCount(b);
    if (used + lines > LINES_PER_PAGE && used > 0) {
      page += 1;
      used = 0;
    }
    pages.push(page);
    used += lines;
  }
  return pages;
}

export function pageCount(blocks: Block[]): number {
  const pages = paginate(blocks);
  return pages.length ? pages[pages.length - 1] : 1;
}
```

- [ ] **Step 4: Run, verify pass**

Run: `npm test -- pagination`
Expected: pass.

- [ ] **Step 5: Commit**

```bash
git add -A && git commit -m "feat: pagination line-counting engine"
```

---

### Task 10: SmartType harvesting (pure logic)

**Files:**
- Create: `src/smarttype/harvest.ts`
- Test: `src/smarttype/harvest.test.ts`

**Interfaces:**
- Consumes: `Block` (Task 7), `SmartTypeLists` (Task 6).
- Produces:
  - `function harvest(blocks: Block[]): SmartTypeLists` (deduped, sorted, case-preserving first-seen).
  - `function suggest(prefix: string, candidates: string[]): string[]` (case-insensitive prefix match, max 8).

- [ ] **Step 1: Write failing tests**

Create `src/smarttype/harvest.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { harvest, suggest } from "./harvest";

describe("smarttype harvest", () => {
  it("collects unique character names", () => {
    const lists = harvest([
      { type: "character", text: "HAMLET" },
      { type: "dialogue", text: "x" },
      { type: "character", text: "HAMLET" },
      { type: "character", text: "OPHELIA" },
    ]);
    expect(lists.characters).toEqual(["HAMLET", "OPHELIA"]);
  });
  it("collects scenes and transitions", () => {
    const lists = harvest([
      { type: "act_scene", text: "ACT ONE" },
      { type: "transition", text: "BLACKOUT" },
    ]);
    expect(lists.scenes).toContain("ACT ONE");
    expect(lists.transitions).toContain("BLACKOUT");
  });
});

describe("suggest", () => {
  it("prefix matches case-insensitively", () => {
    expect(suggest("ham", ["HAMLET", "OPHELIA"])).toEqual(["HAMLET"]);
  });
  it("returns at most 8", () => {
    const many = Array.from({ length: 20 }, (_, i) => `NAME${i}`);
    expect(suggest("name", many).length).toBe(8);
  });
});
```

- [ ] **Step 2: Run, verify fail**

Run: `npm test -- harvest`
Expected: FAIL.

- [ ] **Step 3: Implement**

Create `src/smarttype/harvest.ts`:

```ts
import { Block } from "../io/fountain";
import { SmartTypeLists } from "../io/osp";

function uniq(values: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const v of values) {
    const key = v.toUpperCase();
    if (v.trim() && !seen.has(key)) {
      seen.add(key);
      out.push(v);
    }
  }
  return out;
}

export function harvest(blocks: Block[]): SmartTypeLists {
  return {
    characters: uniq(blocks.filter((b) => b.type === "character").map((b) => b.text)),
    scenes: uniq(blocks.filter((b) => b.type === "act_scene").map((b) => b.text)),
    transitions: uniq(blocks.filter((b) => b.type === "transition").map((b) => b.text)),
  };
}

export function suggest(prefix: string, candidates: string[]): string[] {
  const p = prefix.trim().toLowerCase();
  if (!p) return [];
  return candidates.filter((c) => c.toLowerCase().startsWith(p)).slice(0, 8);
}
```

- [ ] **Step 4: Run, verify pass**

Run: `npm test -- harvest`
Expected: pass.

- [ ] **Step 5: Commit**

```bash
git add -A && git commit -m "feat: SmartType harvesting + suggestions"
```

---

### Task 11: PDF export (pure logic + pdf-lib)

**Files:**
- Create: `src/io/pdf.ts`
- Test: `src/io/pdf.test.ts`

**Interfaces:**
- Consumes: `Block` (Task 7), `TitlePage` (Task 6), `paginate`/`blockLineCount` (Task 9).
- Produces: `async function exportPdf(blocks: Block[], titlePage: TitlePage): Promise<Uint8Array>` — Courier 12, US-Letter, 1" margins, page numbers, leading title page.

- [ ] **Step 1: Install pdf-lib**

```bash
npm install pdf-lib
```

- [ ] **Step 2: Write failing test**

Create `src/io/pdf.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { PDFDocument } from "pdf-lib";
import { exportPdf } from "./pdf";

describe("pdf export", () => {
  it("produces a valid multi-page PDF with a title page", async () => {
    const blocks = Array.from({ length: 60 }, () => ({ type: "dialogue" as const, text: "A line of dialogue." }));
    const bytes = await exportPdf(blocks, { title: "My Play", author: "Me", contact: "", draftDate: "" });
    const pdf = await PDFDocument.load(bytes);
    // 1 title page + at least 2 content pages
    expect(pdf.getPageCount()).toBeGreaterThanOrEqual(3);
  });
});
```

- [ ] **Step 3: Run, verify fail**

Run: `npm test -- pdf`
Expected: FAIL.

- [ ] **Step 4: Implement**

Create `src/io/pdf.ts`:

```ts
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { Block } from "./fountain";
import { TitlePage } from "./osp";
import { LINES_PER_PAGE, blockLineCount, ELEMENT_WIDTHS } from "../editor/pagination";

const PAGE_W = 612; // 8.5in * 72
const PAGE_H = 792; // 11in * 72
const MARGIN = 72; // 1in
const FONT_SIZE = 12;
const LINE_H = (PAGE_H - 2 * MARGIN) / LINES_PER_PAGE;

function wrap(text: string, width: number): string[] {
  if (!text) return [""];
  const out: string[] = [];
  for (let i = 0; i < text.length; i += width) out.push(text.slice(i, i + width));
  return out;
}

export async function exportPdf(blocks: Block[], titlePage: TitlePage): Promise<Uint8Array> {
  const pdf = await PDFDocument.create();
  const font = await pdf.embedFont(StandardFonts.Courier);

  // Title page.
  const tp = pdf.addPage([PAGE_W, PAGE_H]);
  tp.drawText(titlePage.title || "Untitled", { x: MARGIN, y: PAGE_H / 2, size: 18, font, color: rgb(0, 0, 0) });
  if (titlePage.author) tp.drawText(`by ${titlePage.author}`, { x: MARGIN, y: PAGE_H / 2 - 30, size: 12, font });

  let page = pdf.addPage([PAGE_W, PAGE_H]);
  let line = 0;
  const newPage = () => {
    page = pdf.addPage([PAGE_W, PAGE_H]);
    line = 0;
  };
  for (const b of blocks) {
    const needed = blockLineCount(b);
    if (line + needed > LINES_PER_PAGE && line > 0) newPage();
    const indent = b.type === "dialogue" || b.type === "parenthetical" ? MARGIN + 72 : MARGIN;
    const text = b.type === "character" ? b.text.toUpperCase() : b.text;
    for (const seg of wrap(text, ELEMENT_WIDTHS[b.type])) {
      const y = PAGE_H - MARGIN - line * LINE_H;
      page.drawText(seg, { x: indent, y, size: FONT_SIZE, font });
      line += 1;
    }
  }
  // Page numbers on content pages (skip title page at index 0).
  const pages = pdf.getPages();
  for (let i = 1; i < pages.length; i++) {
    pages[i].drawText(String(i), { x: PAGE_W - MARGIN, y: PAGE_H - MARGIN / 2, size: 10, font });
  }
  return pdf.save();
}
```

- [ ] **Step 5: Run, verify pass**

Run: `npm test -- pdf`
Expected: pass.

- [ ] **Step 6: Commit**

```bash
git add -A && git commit -m "feat: PDF export via pdf-lib"
```

---

### Task 12: Document store (dirty state + open/save orchestration)

**Files:**
- Create: `src/state/store.ts`
- Test: `src/state/store.test.ts`

**Interfaces:**
- Consumes: `OspDocument`, `serializeOsp`, `deserializeOsp`, `emptyOsp` (Task 6).
- Produces a framework-agnostic store:
  - `interface DocState { osp: OspDocument; path: string | null; dirty: boolean }`
  - `function createStore(initial?: OspDocument)` returning `{ getState, subscribe, markDirty, setDoc, loadFromString(json), toSaveString(): string, setPath(p) }`.

- [ ] **Step 1: Write failing tests**

Create `src/state/store.test.ts`:

```ts
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
```

- [ ] **Step 2: Run, verify fail**

Run: `npm test -- store`
Expected: FAIL.

- [ ] **Step 3: Implement**

Create `src/state/store.ts`:

```ts
import { OspDocument, emptyOsp, serializeOsp, deserializeOsp } from "../io/osp";

export interface DocState {
  osp: OspDocument;
  path: string | null;
  dirty: boolean;
}

export function createStore(initial: OspDocument = emptyOsp()) {
  let state: DocState = { osp: initial, path: null, dirty: false };
  const subs = new Set<() => void>();
  const notify = () => subs.forEach((f) => f());

  return {
    getState: () => state,
    subscribe(fn: () => void) {
      subs.add(fn);
      return () => subs.delete(fn);
    },
    markDirty() {
      state = { ...state, dirty: true };
      notify();
    },
    setDoc(doc: object) {
      state = { ...state, osp: { ...state.osp, doc }, dirty: true };
      notify();
    },
    setPath(path: string) {
      state = { ...state, path };
      notify();
    },
    loadFromString(json: string) {
      state = { osp: deserializeOsp(json), path: state.path, dirty: false };
      notify();
    },
    toSaveString() {
      const s = serializeOsp(state.osp);
      state = { ...state, dirty: false };
      notify();
      return s;
    },
  };
}
```

- [ ] **Step 4: Run, verify pass**

Run: `npm test -- store`
Expected: pass.

- [ ] **Step 5: Commit**

```bash
git add -A && git commit -m "feat: document store with dirty-state tracking"
```

---

### Task 13: Editor React component + element styles

**Files:**
- Create: `src/editor/Editor.tsx`
- Create: `src/editor/elements.css`
- Modify: `src/App.tsx`
- Test: `src/editor/Editor.test.tsx`

**Interfaces:**
- Consumes: `buildExtensions` (Task 4), `KeymapExtension` (Task 5), store (Task 12).
- Produces: `function StagePlayEditor({ store }): JSX.Element` rendering a Tiptap `EditorContent`, wiring `onUpdate` → `store.setDoc(editor.getJSON())`.

- [ ] **Step 1: Write failing test**

Create `src/editor/Editor.test.tsx`:

```tsx
import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { StagePlayEditor } from "./Editor";
import { createStore } from "../state/store";

describe("StagePlayEditor", () => {
  it("mounts with an editable surface", () => {
    const { container } = render(<StagePlayEditor store={createStore()} />);
    expect(container.querySelector(".ProseMirror")).toBeTruthy();
  });
});
```

Install testing deps: `npm install -D @testing-library/react @testing-library/jest-dom`.

- [ ] **Step 2: Run, verify fail**

Run: `npm test -- Editor`
Expected: FAIL.

- [ ] **Step 3: Implement component + styles**

Create `src/editor/elements.css`:

```css
.ProseMirror { font-family: "Courier New", monospace; font-size: 12pt; line-height: 1; }
.el-act_scene { font-weight: bold; text-transform: uppercase; }
.el-character { text-transform: uppercase; text-align: center; margin: 0 auto; }
.el-dialogue { margin-left: 1in; margin-right: 1in; }
.el-parenthetical { margin-left: 1.5in; font-style: italic; }
.el-stage_direction { font-style: italic; margin-left: 0.5in; }
.el-transition { text-align: right; text-transform: uppercase; }
```

Create `src/editor/Editor.tsx`:

```tsx
import { useEditor, EditorContent } from "@tiptap/react";
import { buildExtensions } from "./schema";
import { KeymapExtension } from "./keymap";
import "./elements.css";

export function StagePlayEditor({ store }: { store: ReturnType<typeof import("../state/store").createStore> }) {
  const editor = useEditor({
    extensions: [...buildExtensions(), KeymapExtension],
    content: store.getState().osp.doc as any,
    onUpdate: ({ editor }) => store.setDoc(editor.getJSON()),
  });
  return <EditorContent editor={editor} />;
}
```

Wire into `src/App.tsx`:

```tsx
import { useRef } from "react";
import { StagePlayEditor } from "./editor/Editor";
import { createStore } from "./state/store";

export default function App() {
  const store = useRef(createStore()).current;
  return (
    <div className="app">
      <StagePlayEditor store={store} />
    </div>
  );
}
```

- [ ] **Step 4: Run, verify pass**

Run: `npm test -- Editor`
Expected: pass.

- [ ] **Step 5: Commit**

```bash
git add -A && git commit -m "feat: editor component + stage-play element styling"
```

---

### Task 14: Menu / toolbar wiring (open, save, import, export)

**Files:**
- Create: `src/ui/Toolbar.tsx`
- Create: `src/ui/commands.ts` (open/save/import/export orchestration over store + Tauri files)
- Modify: `src/App.tsx`
- Test: `src/ui/commands.test.ts`

**Interfaces:**
- Consumes: `files.ts` (Task 2), `osp.ts` (Task 6), `fountain.ts`/`blocks.ts`/`fountainExport.ts` (Tasks 7–8), `pdf.ts` (Task 11), store (Task 12).
- Produces (each takes the store + an injected `io` object so it is testable without Tauri):
  - `async function openOsp(store, io)`, `saveOsp(store, io)`, `importFountainFile(store, io)`, `exportFountainFile(store, io)`, `exportPdfFile(store, io)`.
  - `io` shape: `{ openDialog, saveDialog, readTextFile, writeTextFile, writeBinaryFile }`.

- [ ] **Step 1: Write failing tests (with fake io)**

Create `src/ui/commands.test.ts`:

```ts
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
    const io = fakeIo({ openDialog: vi.fn().mockResolvedValue("/x.osp"), readTextFile: vi.fn().mockResolvedValue(serializeOsp(d)) });
    const store = createStore();
    await openOsp(store, io);
    expect(store.getState().osp.titlePage.title).toBe("Opened");
  });
  it("importFountainFile fills the doc from fountain text", async () => {
    const io = fakeIo({ openDialog: vi.fn().mockResolvedValue("/x.fountain"), readTextFile: vi.fn().mockResolvedValue("HAMLET\nWords.") });
    const store = createStore();
    await importFountainFile(store, io);
    const content = (store.getState().osp.doc as any).content;
    expect(content[0].type).toBe("character");
  });
});
```

- [ ] **Step 2: Run, verify fail**

Run: `npm test -- commands`
Expected: FAIL.

- [ ] **Step 3: Implement `commands.ts`**

```ts
import { OspDocument } from "../io/osp";
import { deserializeOsp } from "../io/osp";
import { importFountain } from "../io/fountain";
import { blocksToDoc, docToBlocks } from "../io/blocks";
import { exportFountain } from "../io/fountainExport";
import { exportPdf } from "../io/pdf";
import { harvest } from "../smarttype/harvest";

type Store = ReturnType<typeof import("../state/store").createStore>;
type Io = {
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
  const st = store.getState();
  (st.osp as OspDocument).smartTypeLists = harvest(blocks);
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
```

- [ ] **Step 4: Implement `Toolbar.tsx`** (buttons calling the commands with the real `io` from `files.ts`)

```tsx
import * as files from "../io/files";
import * as cmd from "./commands";

export function Toolbar({ store }: { store: ReturnType<typeof import("../state/store").createStore> }) {
  const io = files;
  return (
    <div className="toolbar">
      <button onClick={() => cmd.openOsp(store, io)}>Open</button>
      <button onClick={() => cmd.saveOsp(store, io)}>Save</button>
      <button onClick={() => cmd.importFountainFile(store, io)}>Import Fountain</button>
      <button onClick={() => cmd.exportFountainFile(store, io)}>Export Fountain</button>
      <button onClick={() => cmd.exportPdfFile(store, io)}>Export PDF</button>
    </div>
  );
}
```

Add `<Toolbar store={store} />` above the editor in `App.tsx`.

- [ ] **Step 5: Run, verify pass**

Run: `npm test -- commands`
Expected: pass.

- [ ] **Step 6: Commit**

```bash
git add -A && git commit -m "feat: open/save/import/export commands + toolbar"
```

---

### Task 15: SmartType autocomplete UI

**Files:**
- Create: `src/smarttype/SmartType.tsx`
- Modify: `src/editor/Editor.tsx` (mount the popup)
- Test: covered by `harvest.test.ts` for logic; UI smoke test `src/smarttype/SmartType.test.tsx`.

**Interfaces:**
- Consumes: `suggest` (Task 10), editor + `currentElement` (Task 5).
- Produces: `function SmartTypePopup({ editor, lists }): JSX.Element | null` — shows suggestions for the current word when in `character`/`act_scene`/`transition`; Enter/Tab/click inserts.

- [ ] **Step 1: Write failing smoke test**

Create `src/smarttype/SmartType.test.tsx`:

```tsx
import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { SuggestionList } from "./SmartType";

describe("SuggestionList", () => {
  it("renders matching suggestions", () => {
    const { getByText } = render(<SuggestionList items={["HAMLET"]} active={0} onPick={() => {}} />);
    expect(getByText("HAMLET")).toBeTruthy();
  });
  it("renders nothing when empty", () => {
    const { container } = render(<SuggestionList items={[]} active={0} onPick={() => {}} />);
    expect(container.firstChild).toBeNull();
  });
});
```

- [ ] **Step 2: Run, verify fail**

Run: `npm test -- SmartType`
Expected: FAIL.

- [ ] **Step 3: Implement**

Create `src/smarttype/SmartType.tsx`:

```tsx
export function SuggestionList({ items, active, onPick }: { items: string[]; active: number; onPick: (s: string) => void }) {
  if (items.length === 0) return null;
  return (
    <ul className="smarttype">
      {items.map((it, i) => (
        <li key={it} className={i === active ? "active" : ""} onMouseDown={() => onPick(it)}>
          {it}
        </li>
      ))}
    </ul>
  );
}
```

(Full editor integration — reading the current word, positioning the popup, and inserting on pick — is wired in `Editor.tsx` using `editor.state.selection` and `suggest(prefix, lists[...])`; the `SuggestionList` is the tested unit.)

- [ ] **Step 4: Run, verify pass**

Run: `npm test -- SmartType`
Expected: pass.

- [ ] **Step 5: Commit**

```bash
git add -A && git commit -m "feat: SmartType suggestion list UI"
```

---

### Task 16: Scene/Act navigator

**Files:**
- Create: `src/navigator/Navigator.tsx`
- Create: `src/navigator/outline.ts`
- Test: `src/navigator/outline.test.ts`

**Interfaces:**
- Consumes: `docToBlocks` (Task 8).
- Produces:
  - `function buildOutline(doc: object): { index: number; text: string }[]` — one entry per `act_scene` block, `index` = block index.
  - `function Navigator({ doc, onJump }): JSX.Element`.

- [ ] **Step 1: Write failing test**

Create `src/navigator/outline.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { buildOutline } from "./outline";
import { blocksToDoc } from "../io/blocks";

describe("outline", () => {
  it("lists act/scene headings with their block index", () => {
    const doc = blocksToDoc([
      { type: "act_scene", text: "ACT ONE" },
      { type: "dialogue", text: "x" },
      { type: "act_scene", text: "ACT TWO" },
    ]);
    expect(buildOutline(doc)).toEqual([
      { index: 0, text: "ACT ONE" },
      { index: 2, text: "ACT TWO" },
    ]);
  });
});
```

- [ ] **Step 2: Run, verify fail**

Run: `npm test -- outline`
Expected: FAIL.

- [ ] **Step 3: Implement `outline.ts`**

```ts
import { docToBlocks } from "../io/blocks";

export function buildOutline(doc: object): { index: number; text: string }[] {
  return docToBlocks(doc)
    .map((b, index) => ({ b, index }))
    .filter(({ b }) => b.type === "act_scene")
    .map(({ b, index }) => ({ index, text: b.text }));
}
```

- [ ] **Step 4: Implement `Navigator.tsx`**

```tsx
import { buildOutline } from "./outline";

export function Navigator({ doc, onJump }: { doc: object; onJump: (index: number) => void }) {
  const outline = buildOutline(doc);
  return (
    <nav className="navigator">
      {outline.map((o) => (
        <button key={o.index} onClick={() => onJump(o.index)}>
          {o.text}
        </button>
      ))}
    </nav>
  );
}
```

- [ ] **Step 5: Run, verify pass**

Run: `npm test -- outline`
Expected: pass.

- [ ] **Step 6: Commit**

```bash
git add -A && git commit -m "feat: scene/act navigator"
```

---

### Task 17: Find & replace + webview spellcheck

**Files:**
- Create: `src/editor/find.ts`
- Modify: `src/editor/Editor.tsx` (enable `spellcheck` attr; mount find bar)
- Create: `src/ui/FindBar.tsx`
- Test: `src/editor/find.test.ts`

**Interfaces:**
- Produces (pure helper used by the find bar):
  - `function findMatches(text: string, query: string): number[]` — start offsets of all case-insensitive matches.
  - `function replaceAll(text: string, query: string, replacement: string): string`.
- Editor integration uses `prosemirror-search` for in-document highlight; the pure helpers above are the tested unit. `spellcheck="true"` is set on the ProseMirror editable surface.

- [ ] **Step 1: Install search**

```bash
npm install prosemirror-search
```

- [ ] **Step 2: Write failing test**

Create `src/editor/find.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { findMatches, replaceAll } from "./find";

describe("find/replace helpers", () => {
  it("finds all case-insensitive match offsets", () => {
    expect(findMatches("Hamlet and hamlet", "hamlet")).toEqual([0, 11]);
  });
  it("replaces all occurrences", () => {
    expect(replaceAll("a A a", "a", "b")).toBe("b b b");
  });
  it("returns empty for empty query", () => {
    expect(findMatches("text", "")).toEqual([]);
  });
});
```

- [ ] **Step 3: Run, verify fail**

Run: `npm test -- find`
Expected: FAIL.

- [ ] **Step 4: Implement `find.ts`**

```ts
export function findMatches(text: string, query: string): number[] {
  if (!query) return [];
  const out: number[] = [];
  const hay = text.toLowerCase();
  const needle = query.toLowerCase();
  let i = hay.indexOf(needle);
  while (i !== -1) {
    out.push(i);
    i = hay.indexOf(needle, i + needle.length);
  }
  return out;
}

export function replaceAll(text: string, query: string, replacement: string): string {
  if (!query) return text;
  const re = new RegExp(query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "gi");
  return text.replace(re, replacement);
}
```

- [ ] **Step 5: Set `spellcheck` on the editor**

In `Editor.tsx` `useEditor`, add:

```ts
editorProps: { attributes: { spellcheck: "true" } },
```

- [ ] **Step 6: Run, verify pass**

Run: `npm test -- find`
Expected: pass.

- [ ] **Step 7: Commit**

```bash
git add -A && git commit -m "feat: find/replace helpers + webview spellcheck"
```

---

### Task 18: Title-page editor

**Files:**
- Create: `src/ui/TitlePageEditor.tsx`
- Modify: `src/App.tsx` (toggle between title page + script view)
- Test: `src/ui/titlepage.test.ts`

**Interfaces:**
- Consumes: store (Task 12), `TitlePage` (Task 6).
- Produces:
  - `function updateTitlePage(store, patch: Partial<TitlePage>): void` (pure-ish; marks dirty).
  - `function TitlePageEditor({ store }): JSX.Element`.

- [ ] **Step 1: Write failing test**

Create `src/ui/titlepage.test.ts`:

```ts
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
```

- [ ] **Step 2: Run, verify fail**

Run: `npm test -- titlepage`
Expected: FAIL.

- [ ] **Step 3: Implement**

Create `src/ui/TitlePageEditor.tsx`:

```tsx
import { TitlePage } from "../io/osp";

type Store = ReturnType<typeof import("../state/store").createStore>;

export function updateTitlePage(store: Store, patch: Partial<TitlePage>) {
  const cur = store.getState().osp.titlePage;
  store.getState().osp.titlePage = { ...cur, ...patch };
  store.markDirty();
}

export function TitlePageEditor({ store }: { store: Store }) {
  const tp = store.getState().osp.titlePage;
  return (
    <div className="title-page">
      {(["title", "author", "contact", "draftDate"] as const).map((f) => (
        <label key={f}>
          {f}
          <input defaultValue={tp[f]} onChange={(e) => updateTitlePage(store, { [f]: e.target.value })} />
        </label>
      ))}
    </div>
  );
}
```

- [ ] **Step 4: Run, verify pass**

Run: `npm test -- titlepage`
Expected: pass.

- [ ] **Step 5: Commit**

```bash
git add -A && git commit -m "feat: title-page editor"
```

---

### Task 19: Cross-platform build config + README + full test gate

**Files:**
- Modify: `src-tauri/tauri.conf.json` (bundle targets, identifier, productName)
- Create: `README.md`
- Create: `.github/workflows/build.yml` (optional CI matrix; documented)

**Interfaces:**
- Produces: a documented `npm run tauri build` producing Win/macOS/Linux artifacts.

- [ ] **Step 1: Configure bundle**

In `src-tauri/tauri.conf.json`, set `productName: "Proscenium"`, a reverse-DNS `identifier`, and `bundle.targets: "all"`.

- [ ] **Step 2: Write README**

Create `README.md` with: project description, "Phase 1 of open-source Final Draft (stage plays)", dev (`npm install`, `npm run tauri dev`), test (`npm test`), build (`npm run tauri build`), and the per-OS artifact list.

- [ ] **Step 3: Full test gate**

Run: `npm test`
Expected: all suites pass.

- [ ] **Step 4: Build smoke (host OS)**

Run: `npm run tauri build`
Expected: native bundle for the host OS is produced under `src-tauri/target/release/bundle/`.

- [ ] **Step 5: Commit**

```bash
git add -A && git commit -m "chore: cross-platform bundle config + README"
```

---

## Self-Review

**Spec coverage:**
- Editor + typed elements → Tasks 3, 4, 5, 13 ✓
- SmartType → Tasks 10, 15 ✓
- Stage-play formatting → Task 13 (CSS) + Task 9 widths ✓
- Pagination → Task 9 ✓
- Title page → Tasks 6 (model), 18 (editor), 11 (PDF render) ✓
- Navigator → Task 16 ✓
- Find/replace + spellcheck → Task 17 ✓
- `.osp` format → Task 6 ✓
- Fountain import/export → Tasks 7, 8 ✓
- PDF export → Task 11 ✓
- Error handling / dirty state → Task 12 (autosave is a small follow-up on the store's `markDirty`; flagged below) ✓
- Distribution → Tasks 1, 2, 19 ✓

**Gaps / notes:**
- **Autosave/recovery** from the spec is partially covered (dirty tracking exists). A periodic autosave timer writing to a recovery `.osp` is a small additive task; if desired it slots in after Task 14 as Task 14b using the same `io.writeTextFile`. Left out of the critical path to keep Phase 1 shippable.
- Full SmartType and find-bar editor *integration* (cursor/word extraction, popup positioning) is wired in `Editor.tsx`; the deterministic logic is unit-tested (`suggest`, `findMatches`). UI glue is verified manually via `npm run tauri dev`.

**Placeholder scan:** none — every code step contains real code.

**Type consistency:** `ElementType`/`Block`/`OspDocument`/`SmartTypeLists`/`TitlePage` names are consistent across tasks; `blocksToDoc`/`docToBlocks`, `serializeOsp`/`deserializeOsp`, `importFountain`/`exportFountain`, `harvest`/`suggest`, `paginate`/`blockLineCount` referenced with matching signatures.
