# Proscenium — Open-Source Stage-Play Writing App

**Status:** Design / spec
**Date:** 2026-06-18
**Phase:** 1 of the "open-source Final Draft" roadmap (see Roadmap section)

## Goal

Recreate Final Draft's writing experience as open-source software, distributable
as native binaries for Windows, macOS, and Linux. This spec covers **Phase 1**:
a complete, genuinely usable **stage-play** editor. Later phases extend toward
full Final Draft feature parity (screenplay/TV formats, planning tools,
production features, collaboration) — see the Roadmap.

This phased decomposition is deliberate: building all of Final Draft at once
stalls; a focused, shippable stage-play editor is the foundation everything
else builds on.

## Scope (Phase 1)

In scope:

- Structured stage-play editor with typed elements and Final Draft-style
  Tab/Enter element cycling
- SmartType autocomplete (character names, act/scene intros, transitions)
- Stage-play page formatting (Courier 12, US-Letter geometry, standard margins)
- Pagination with accurate page breaks and page numbers
- Title-page editor
- Scene/Act navigator sidebar
- Find & replace; webview-native spellcheck
- Native `.osp` save format (JSON)
- Fountain import/export
- PDF export
- Cross-platform native builds (Win/macOS/Linux)

Explicitly out of scope for Phase 1 (backlogged to later specs):

- Beat Board, Story Map, index cards
- Revisions / colored pages / page locking
- Real-time collaboration, ScriptNotes, comments
- FDX (Final Draft XML) interop
- Reports (scene/character/location)
- Screenplay, TV, comic, manuscript document types
- Custom spelling dictionary

## Architecture

A Tauri application split into a thin Rust shell and a TypeScript frontend that
owns all document logic.

```
proscenium/
  src/                      # TypeScript frontend (React + Vite)
    editor/                 # Tiptap schema, node specs, keymap, pagination
    smarttype/              # SmartType list harvesting + autocomplete UI
    navigator/              # Scene/Act outline sidebar
    io/                     # fountain, pdf, osp serializers/parsers
    ui/                     # app chrome, toolbar, dialogs, toasts
    state/                  # document/dirty-state store
  src-tauri/                # Rust shell
    src/
      main.rs
      commands.rs           # open/save dialogs, read/write file bytes
  tests/                    # Vitest unit/integration tests
  docs/superpowers/specs/
```

### Rust shell (thin)

Responsibilities are limited to what needs native APIs:

- Native open/save file dialogs
- Read file bytes from a path; write bytes to a path
- Window lifecycle

Exposed as Tauri commands, e.g. `open_file_dialog() -> Option<String>`,
`read_file(path) -> Result<Vec<u8>>`, `save_file_dialog(default_name) ->
Option<String>`, `write_file(path, bytes) -> Result<()>`. No document parsing
or formatting in Rust.

### Frontend (TypeScript)

- **React + Vite + TypeScript.**
- **Tiptap / ProseMirror** as the editor engine — schema-driven structured
  document, ideal for typed block elements and keymap-driven cycling.

## Document model

A ProseMirror schema where each stage-play element is a top-level block node:

| Node              | Role                                        |
|-------------------|---------------------------------------------|
| `act_scene`       | Act / Scene heading                         |
| `stage_direction` | Stage directions (italic, indented)         |
| `character`       | Character cue (caps, centered)              |
| `dialogue`        | Spoken lines                                |
| `parenthetical`   | Parenthetical direction within dialogue     |
| `transition`      | Transition (e.g. BLACKOUT, END OF ACT)      |
| `general`         | Unclassified / general text                 |

The document is a flat sequence of these blocks. Title-page fields and SmartType
lists are stored in document-level metadata, not as editor nodes.

### Native `.osp` format

A JSON file:

```json
{
  "schemaVersion": 1,
  "titlePage": { "title": "", "author": "", "contact": "", "draftDate": "" },
  "doc": { /* ProseMirror document JSON */ },
  "smartTypeLists": { "characters": [], "scenes": [], "transitions": [] }
}
```

`schemaVersion` gates future migrations.

## Editing behavior

### Element cycling

A configurable transition table drives Enter/Tab, mirroring Final Draft:

- **Enter** from `character` → `dialogue`
- **Enter** from `dialogue` → `stage_direction`
- **Enter** from `act_scene` → `stage_direction`
- **Enter** on empty block → cycle toward `general`
- **Tab** cycles the current empty block's element type forward through the set
- **Shift+Tab** cycles backward

The table is data, not hard-coded branching, so it can be tuned and later
reused for screenplay formats.

### SmartType

- Lists are harvested live from the document: every `character` block feeds the
  character list, `act_scene` feeds scenes, `transition` feeds transitions.
- While typing in a relevant element, an autocomplete popup offers matches.
- Lists persist in the `.osp` file so suggestions survive reopen.

### Formatting

Courier 12 on US-Letter pages (1" margins baseline). Per-element margins follow
standard US stage-play conventions:

- `character`: uppercase, centered
- `dialogue`: indented block
- `stage_direction`: indented, italic
- `parenthetical`: indented within dialogue
- `act_scene` / `transition`: bold / right-aligned as appropriate

A margin/style table maps element → layout, kept as data for reuse.

## Pagination

ProseMirror does not paginate. A pagination layer:

1. Computes the line count each block consumes in Courier 12 at its element
   width.
2. Accumulates lines against page content height to determine page breaks.
3. Renders page-break separators and page numbers as ProseMirror decorations.
4. Recomputes on document change (debounced) so page count stays accurate
   during editing.

This same line-fitting logic feeds PDF export, keeping screen and PDF
consistent.

## Navigator, Find/Replace, Spellcheck

- **Scene/Act navigator:** derives a live outline from `act_scene` blocks;
  clicking an entry scrolls to that block.
- **Find & replace:** `prosemirror-search` for match highlighting, replace, and
  replace-all.
- **Spellcheck:** rely on the webview's native `spellcheck` on the editable
  surface for Phase 1; a custom dictionary is backlogged.

## Import / Export

- **Fountain import:** parse Fountain plaintext into the element blocks. Map
  scene headings → `act_scene`, action → `stage_direction`, character/dialogue/
  parenthetical/transition to their nodes. Unrecognized lines become `general`.
- **Fountain export:** serialize the document back to Fountain text.
- **PDF export:** render the paginated document with `pdf-lib` — Courier 12,
  correct margins, page numbers, and a title page from `titlePage` metadata.
- **Native `.osp`:** JSON serialize/deserialize with `schemaVersion` check.

All disk I/O goes through the Rust file commands; parsing/serialization is
TypeScript.

## Error handling

- **Dirty-state tracking:** the document store tracks unsaved changes; closing
  the window or opening another file with unsaved changes prompts the user.
- **Autosave:** periodic autosave to a recovery file to prevent data loss.
- **File errors:** read/write failures surface as non-blocking toasts.
- **Fountain import:** partial-with-warnings — parse what is valid, collect
  unparseable lines into `general`, and report a summary rather than failing
  the whole import.

## Testing

Vitest, written test-first per the project workflow:

- `.osp` serialize → deserialize round-trip preserves document and metadata.
- Fountain import → export → import round-trip stability for representative
  fixtures.
- Element-cycling transition table: each Enter/Tab transition yields the
  expected next element.
- Pagination line-counting: known blocks produce known line counts and page
  breaks at expected positions.
- SmartType harvesting: editing `character`/`act_scene`/`transition` blocks
  updates the corresponding lists.
- PDF export: structural assertions (page count, presence of title page text,
  element positions within tolerance).

Tests must pass before any task is claimed complete.

## Distribution

`tauri build` produces native artifacts:

- Windows: `.msi` / `.exe`
- macOS: `.dmg` / `.app`
- Linux: `.deb` / `.AppImage`

CI to build all three is a follow-up; the build config supports it from the
start. This satisfies the "distributable to any OS" requirement.

## Roadmap to full Final Draft parity

Phase 1 (this spec) is the foundation. Subsequent phases each get their own
spec → plan → implement cycle:

- **Phase 2 — Document types:** screenplay + TV formats reusing the element
  table and pagination engine.
- **Phase 3 — Planning tools:** Beat Board, Story Map, index cards / scene
  navigator enhancements.
- **Phase 4 — Production:** scene numbering, revisions / colored pages, page
  locking, tagging, reports.
- **Phase 5 — Collaboration:** ScriptNotes, comments, real-time co-writing.
- **Phase 6 — Interop:** FDX read/write for drop-in Final Draft compatibility;
  custom spelling dictionaries.

The architecture choices in Phase 1 (data-driven element/margin tables, schema
versioning, frontend-owned document logic) are made specifically to make these
later phases additive rather than rewrites.
