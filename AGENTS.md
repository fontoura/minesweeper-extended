# AGENTS.md

Guidance for AI agents working on this repository.

## Overview

This is a **Wails v2** desktop application that combines a **Go** backend with a
**React + TypeScript + Vite** frontend. Wails bundles the compiled Go binary and
the built frontend into a single native desktop app using a system WebView.

- Module name (Go): `minesweeper-extended`
- Wails version: `v2.17.1`
- Go: `1.26.0`
- Frontend: React 19 + TypeScript 5 + Vite 7

## Project Structure

```
minesweeper/
├── app.go              # App struct + bound methods exposed to the frontend
├── main.go             # Wails entrypoint; window config + embeds frontend/dist
├── go.mod / go.sum     # Go dependencies
├── wails.json          # Wails project config (build/dev commands, app name)
├── build/              # Build assets (icons, installer, platform manifests)
│   ├── appicon.png
│   ├── darwin/         # macOS Info.plist files
│   └── windows/        # Windows icon, manifest, NSIS installer
└── frontend/           # React + Vite frontend
    ├── index.html
    ├── package.json    # npm scripts: dev / build / preview
    ├── vite.config.ts
    ├── tsconfig*.json
    ├── dist/           # Built frontend (embedded into the Go binary) — generated
    ├── src/            # React source
    │   ├── main.tsx    # Entry point: App screen router + I18nProvider + mount
    │   ├── style.css   # All global + component styles
    │   ├── components/ # React UI components / presentation logic (see below)
    │   ├── game/       # Pure game logic + assets (no React)
    │   │   └── utils/  # Game utils (clamp, makeGrid, idiv)
    │   ├── utils/      # Presentation utils (u(), useBoardScale)
    │   ├── i18n/       # Translation catalog + language store (context)
    │   └── assets/images/game/  # Default-skin SVGs (scalable)
    └── wailsjs/        # AUTO-GENERATED Go<->JS bindings + Wails runtime
        ├── go/main/    # TypeScript bindings for bound Go methods (App)
        └── runtime/    # Wails JS runtime API
```

## Minesweeper game (frontend-only, no backend calls)

A Minesweeper implementation in React/TypeScript. All logic runs in the browser;
the Go side only hosts the window.

- `src/game/utils/` — presentation-agnostic game helpers: `clamp`, `makeGrid<T>`,
  `idiv`.
- `src/game/field.ts` — core minefield model (mine scattering, flood-fill reveal,
  size/mine validation).
- `src/game/types.ts` — single-player move/status constants, difficulty presets,
  and the shared `Cell` ({x, y}) coordinate type.
- `src/game/versusTypes.ts` — versus move ownership (EMPTY/P1/P2), status, and
  `clampBigCenter` (keeps a 5×5 big-click area inside the board).
- `src/game/ai/` — the computer opponents, one class + singleton per difficulty
  (`EasyAi.ts`, `MediumAi.ts`, `HardAi.ts`), each expressing only its *strategy*.
  Shared primitives live in `ai.ts` (`countScores`, `neighbourBounds`,
  `pickRandomEmpty`, `pickEmptyWithValue`, `pickBigTarget`, re-exported `idiv`,
  the `CERTAIN` = 840 fixed-point scale, and the injectable `Rng` type).
  `index.ts` exports `AI_KINDS` (singletons, ordered by difficulty) and the
  `Ai`/`AiResult` types. `play()` accepts an optional `rng` (defaults to
  `Math.random`) so tests can pin behaviour. Includes the "big click" power move.
- `src/game/assets.ts` — imports every SVG and their intrinsic px sizes (`size`).
- `src/utils/unit.ts` — `u(n)`, the single helper turning asset-px into
  `calc(var(--unit) * n)` (presentation util).
- `src/utils/useBoardScale.ts` — responsive `--unit` hook: fits the board to the
  viewport, snapping cells to integer pixels so the border never clips
  (presentation util).

Components:
- `Menu.tsx` — mode selection (single / versus).
- `Options.tsx`, `VersusOptions.tsx` — pre-game config screens.
- `Game.tsx` — single-player flow.
- `VersusGame.tsx` — turn-based versus flow + AI timer.
- `Board.tsx` / `VersusBoard.tsx` — grid + CSS-beveled frame rendering.
- `TopPanel.tsx` / `VersusTopPanel.tsx` — scoreboard(s), face button, power buttons.
- `Scoreboard.tsx` — numeric display; `FaceButton.tsx` — reset smiley.
- `LanguageSelector.tsx` — flag buttons (top-right) to switch language.

The `App` component (the discriminated-union `Screen` router) and the React mount
both live in `main.tsx`; all styles live in `style.css`.

## Internationalization (`src/i18n/`)

- `translations.ts` — the `Messages` interface (all keys), `MESSAGES` catalog for
  each `Lang` (`en`, `pt`), and `LANGS` (code + label). Add a key to `Messages`
  and provide it in **every** language. Placeholders use `{name}` syntax.
- `I18nContext.tsx` — `I18nProvider` holds the current language (persisted to
  `localStorage`, defaults from `navigator.language`). `useI18n()` exposes
  `{lang, setLang, t}`. Call `t('key', {vars})` to translate; the whole tree
  re-renders on language change.
- The language is a **store accessed via context** — never prop-drilled. Any
  component that renders user-facing text calls `useI18n()` directly.
- Non-UI modules store translation **keys** not strings: AI opponents expose
  `nameKey: MessageKey`, difficulty presets expose `nameKey`, and components
  store error state as a `MessageKey` so text re-translates live.

Asset images live in `src/assets/images/game/` with descriptive English names
(e.g. `field_closed.svg`, `digit_0.svg`, `face_normal.svg`, `selector_p1.svg`).

Sizing convention: every in-game dimension is expressed as `calc(var(--unit) * N)`
where N is the asset's intrinsic pixel size; `--unit` is the single scale factor.

## How the Backend & Frontend Connect

1. Go methods are defined on the `App` struct in `app.go`.
2. The `App` instance is registered in `main.go` via the `Bind` option.
3. Wails generates TypeScript/JS bindings into `frontend/wailsjs/go/main/`.
4. The frontend imports and calls them, e.g.:
   ```ts
   import { Greet } from "../wailsjs/go/main/App";
   Greet(name).then(result => ...);
   ```
   All bound methods return Promises on the JS side.

### Adding a new backend method (agent recipe)

1. Add an exported method to `App` in `app.go` (e.g. `func (a *App) DoThing(x int) string`).
2. Regenerate bindings by running `wails dev` or `wails build` (do NOT hand-edit
   files in `frontend/wailsjs/` — they are auto-generated).
3. Import and call the method from the frontend.

## Commands

Run these from the project root:

- `wails dev` — Run in development mode with hot reload (Go + Vite dev server).
- `wails build` — Produce a production desktop binary in `build/bin/`.

Frontend-only (run inside `frontend/`, usually invoked by Wails automatically):

- `npm install` — Install frontend deps (`frontend:install` in `wails.json`).
- `npm run dev` — Vite dev server (`frontend:dev:watcher`).
- `npm run build` — `tsc && vite build`, outputs to `frontend/dist/`.
- `npm run format` — Format the codebase with Biome (write).
- `npm run lint` — Lint with Biome.
- `npm run check` — Biome format + lint + safe fixes (write).
- `npm run test` — Run unit tests with Vitest.

Code style is enforced by **Biome** (`frontend/biome.json`): 4-space indentation,
single quotes, and effectively no line wrapping (`lineWidth` at its max). Run
`npm run format` before committing.

## Doc comment conventions

Applies to all TypeScript/TSX in `frontend/src`:

1. Comments explain the *purpose* and the *why*, kept high level. Never restate
   what the TypeScript already says.
2. Use simple, plain English.
3. No em dashes, no unicode arrows, no unicode ellipsis. Use plain ASCII
   (`-`, `->`, `...`, `to`).
4. Every exported class, function, method, interface, and type gets a TSDoc
   (`/** ... */`) block unless it is genuinely self-explanatory. Prefer TSDoc on
   the declaration over a loose comment above it.
5. Keep useful comments, remove useless ones. Do not add filler.
6. No descriptive comment blocks at the very top of a file; move that intent into
   TSDoc on the primary export.

### Status of the doc-comment pass (in progress)

Reviewed and updated: `game/utils/index.ts`, `game/field.ts`, `game/types.ts`,
`game/versusTypes.ts`, `game/ai/*` (`ai.ts`, `EasyAi`, `MediumAi`, `HardAi`,
`index.ts`), `game/assets.ts`, `utils/unit.ts`, `utils/useBoardScale.ts`, and
components `Board`, `FaceButton`, `Scoreboard`, `TopPanel`, `Menu`, `Options`,
`VersusOptions`, `LanguageSelector`, `Game`, and `VersusGame`.

Still to review against the rules above:

- `components/VersusBoard.tsx` — top-of-file block comment (has an em dash) needs
  moving into TSDoc on the default export; `cellImage`/`clampSelector`-style
  helpers and the `addSelector` closure want short TSDoc; keep the `// draw` and
  selector-overlay notes.
- `components/VersusTopPanel.tsx` — top-of-file block comment (has an em dash and
  `>=`) needs moving into TSDoc on the default export; the inner `PowerButton`
  and `faceStatus` helpers want short TSDoc.
- `i18n/I18nContext.tsx` — top-of-file block comment to TSDoc on `I18nProvider`;
  document `useI18n`, `initialLang`, `interpolate`. Keep `/* ignore storage
  errors */`.
- `i18n/translations.ts` — top-of-file block comment to TSDoc on `MESSAGES` (or
  the `Messages` interface); note the "every language must be complete" rule.
- `main.tsx` — add TSDoc to the `App` component.
- Sweep every file for em dashes, unicode arrows, and unicode ellipsis (a few
  remain in the not-yet-reviewed files above).

After editing, run `npm run check` and `npm run build` to confirm everything is
still green.

## Tests

Unit tests use **Vitest** (`*.test.ts` next to the module). They cover only the
logic that genuinely needs protection — pure, non-trivial game code:

- `src/game/field.test.ts` — clamping, exact mine count, first-click safety,
  neighbour-count correctness, and flood-fill behaviour.
- `src/game/ai/ai.test.ts` — a deterministic property test asserting every AI
  returns an *actionable* move (empty cell, or a big click whose 5×5 area has an
  empty cell) across many random mid-game states — guards the versus freeze bug.

React components are not unit-tested; their behaviour is driven by the tested
pure modules plus a runtime safety net in `VersusGame` (`firstEmptyMove`).

## Conventions & Gotchas

- **Do not edit `frontend/wailsjs/`** — regenerate via Wails instead.
- **`frontend/dist/` is generated** and embedded via `//go:embed all:frontend/dist`
  in `main.go`. It must exist for `go build` to succeed.
- Only **exported** (capitalized) `App` methods are exposed to the frontend.
- Bound method params/returns must use Wails-supported types; complex Go structs
  generate TS models under `frontend/wailsjs/go/models.ts`.
- Window size/title and startup hooks live in `main.go`.
- App metadata (name, output filename, author) lives in `wails.json`.
