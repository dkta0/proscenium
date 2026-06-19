# Proscenium

An open-source, cross-platform, free alternative to Final Draft for writing
**stage plays and screenplays**.

Proscenium began as a stage-play editor (Phase 1) and is growing toward broader
Final Draft parity. Already delivered beyond the stage-play core: screenplay
document type, production reports, and Final Draft `.fdx` interop. Remaining
roadmap items (TV templates, Beat Board/Story Map, revisions/page-locking,
real-time collaboration) are tracked in `docs/superpowers/specs/`.

## Features

- **Structured editor** with industry-style elements per document type — stage
  play (Act/Scene, Stage Direction, Character, Dialogue, Parenthetical,
  Transition) and screenplay (Scene Heading, Action, Character, Dialogue,
  Parenthetical, Transition, Shot).
- **Document-type switcher** — write in stage-play or screenplay format; element
  set, Enter/Tab transitions, and page margins adapt to the chosen format.
- **Final Draft-style element cycling** — `Enter` and `Tab`/`Shift+Tab` flow
  between element types as you write (Character → Dialogue → Action …).
- **SmartType autocomplete** for character names, scene/act headings, and
  transitions, learned live from your script.
- **Formatting** in Courier 12 on US-Letter page geometry, with pagination and
  page numbers.
- **Scene/Act navigator** for jump-navigation.
- **Production reports** — character (speeches/words), scene-to-page, and
  location breakdowns.
- **Find & replace** and webview-native spellcheck.
- **Title-page editor**.
- **File formats:** native `.osp` (JSON), **Fountain** import/export,
  **Final Draft `.fdx`** import/export, and **PDF** export.
- **Cross-platform:** native desktop builds for Windows, macOS, and Linux via
  Tauri.

## Tech stack

- [Tauri 2](https://tauri.app/) — thin Rust shell (native dialogs + file I/O)
- React 18 + Vite + TypeScript
- [Tiptap](https://tiptap.dev/) / ProseMirror — structured document editor
- pdf-lib — PDF export
- Vitest — tests

All document logic lives in the TypeScript frontend and is unit-tested; the Rust
shell only does file dialogs and disk I/O.

## Development

```bash
npm install          # install JS dependencies
npm run tauri dev    # run the desktop app in dev mode
npm test             # run the test suite (Vitest)
npm run build        # typecheck + build the frontend bundle
```

> Linux desktop builds require system WebKitGTK libraries
> (`webkit2gtk-4.1`, `libsoup-3.0`, plus the usual GTK stack).

## Building distributables

```bash
npm run tauri build
```

Artifacts are produced under `src-tauri/target/release/bundle/`:

- **Windows:** `.msi` and `.exe` (NSIS)
- **macOS:** `.dmg` and `.app`
- **Linux:** `.deb`, `.rpm`, and `.AppImage`

> The `.deb` and `.rpm` build fully offline. AppImage packaging downloads the
> `linuxdeploy` helper from GitHub on first run, so it needs network access (the
> CI workflow handles this on GitHub runners).

A GitHub Actions workflow (`.github/workflows/build.yml`) builds all three
platforms on tag pushes.

## Project layout

```
src/
  formats/     document-type definitions (stage play, screenplay)
  editor/      Tiptap schema, keymap, pagination, find
  io/          .osp, Fountain, FDX, PDF, block<->doc conversion, file commands
  smarttype/   list harvesting + autocomplete UI
  navigator/   scene/act outline
  reports/     character / scene / location reports + panel
  state/       document store (dirty-state tracking)
  ui/          toolbar, find bar, title-page editor, file commands
src-tauri/     Rust shell (file dialogs + read/write commands)
docs/superpowers/   spec + implementation plan
```

## License

MIT
