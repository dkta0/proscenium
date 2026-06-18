# Proscenium

An open-source **stage-play writing app** — a cross-platform, free alternative to
Final Draft, focused (in this first phase) on the stage-play format.

Proscenium is **Phase 1** of a roadmap toward an open Final Draft. It is a
genuinely usable playwriting tool today; later phases extend toward screenplay/TV
formats, planning tools, production features, and collaboration (see
`docs/superpowers/specs/`).

## Features

- **Structured editor** with industry-style stage-play elements: Act/Scene
  headings, Stage Directions, Character cues, Dialogue, Parentheticals,
  Transitions, and General text.
- **Final Draft-style element cycling** — `Enter` and `Tab`/`Shift+Tab` flow
  between element types as you write (Character → Dialogue → Stage Direction …).
- **SmartType autocomplete** for character names, act/scene headings, and
  transitions, learned live from your script.
- **Stage-play formatting** in Courier 12 on US-Letter page geometry, with
  pagination and page numbers.
- **Scene/Act navigator** for jump-navigation.
- **Find & replace** and webview-native spellcheck.
- **Title-page editor**.
- **File formats:** native `.osp` (JSON), **Fountain** import/export, and **PDF**
  export.
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
  editor/      element types, Tiptap schema, keymap, pagination, find
  io/          .osp, Fountain, PDF, block<->doc conversion, file commands
  smarttype/   list harvesting + autocomplete UI
  navigator/   scene/act outline
  state/       document store (dirty-state tracking)
  ui/          toolbar, find bar, title-page editor, file commands
src-tauri/     Rust shell (file dialogs + read/write commands)
docs/superpowers/   spec + implementation plan
```

## License

MIT
