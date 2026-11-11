# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev            # Electron app with HMR (no update check)
npm run lint           # eslint --cache .
npm run typecheck      # node + web tsconfigs (typecheck:node / typecheck:web)
npm test               # vitest run (node env, src/**/*.test.ts)
npx vitest run src/renderer/src/game/modern.hk.test.ts   # single file
npx vitest run -t "name"                                  # single test by name
npm run build:mac | build:win                             # local packaged builds
npm run icons          # regenerate icons from ship.gif; commit build/ and resources/
```

CI (lint, typecheck, test) runs on PRs and pushes to `main`. Releases: bump `version` in `package.json`, commit, then push tag `v<version>`; GitHub Actions builds and attaches artifacts (see README).

## Architecture

Electron + React + electron-vite app: an unofficial clone of Taipan!, ported from a legacy JS/HTML implementation.

- `src/main/` — Electron main process: window/menu, save file IO (`saves.ts`, stored in app data `saves/`), auto-update (`updates.ts`). IPC channels (`saves:list/write/delete/writeSync`, `app:quit`, `app:version`) are exposed via `src/preload/`.
- `src/shared/` — code used by both processes: `save.ts` (`GameState`, `SaveFile`, validation/migration of saves, `createInitialState`) and `view.ts` (`GameView` types + validators).
- `src/renderer/src/game/` — the game:
  - `engine.ts` (~2100 lines) is the whole game logic as a line-numbered state machine descended from BASIC (`state.nextLine`, numeric/string line labels like `1500`, `'PORT2'`, `'NEWSHIP1'`, `delayTicks`, `keyChoice`). `startGame(state, hooks, options)` returns a `GameSession` (`sendKeyDown`, `step`, `flushDelays`, `stop`). All game state lives in the serializable `GameState`, so any moment can be saved and resumed (`resumeLine`).
  - The engine never touches the DOM. It writes a `GameView` (`state.view`: screen id, rich-text nodes, battle ship slots) which React screens in `screens/` render. Text is built with helpers in `richText.ts`; formatting/seaworthiness helpers in `format.ts`.
  - `GameProvider.tsx` / `gameContext.ts` connect the engine to save persistence (`persist`/`flush`/`markDone` hooks) and session switching; `TaipanGame.tsx` picks the screen.
- **Classic vs Modern mode** (`state.gameMode`): Classic preserves original rules exactly, including quirks (e.g. an undamaged ship always sinks in a storm). Modern changes behavior (storm orders, battle HUD, forced Run when unarmed, Hong Kong settling repairs/loans/tribute in one visit). Engine branches on `modern`; Classic behavior must not change.

## Testing

Tests run the engine headlessly with a seeded RNG via `game/test/harness.ts` (`startHeadless(seed)`, `typeText`, `submit`, `messageText`, `battleText`) and `test/rng.ts`. `classic.golden.test.ts` and `classic.smoke.test.ts` lock Classic rules and must stay green when working on Modern; `modern.*.test.ts` cover Modern features. Save format changes need `src/shared/save.test.ts` coverage (old saves must still load).

## Workflow

`.cursor/rules/issue-workflow.mdc`: when asked to work on issue #n, branch from `origin/main` as `issue/<n>-<slug>`, implement only what the issue asks, push, and open a PR with title ending `(#n)` and body containing Summary, Test plan, `Closes #n`. Set the issue to In Progress on the Taipan roadmap project board; do not merge. After the user reports a merge, fast-forward `main` and delete the merged branch locally and on the remote.
