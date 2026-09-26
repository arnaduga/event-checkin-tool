# 08 — Architecture

## Overview

A static single-page application. Everything runs in the browser; the "backend" is `localStorage`.

```
             ┌──────────────── Browser ────────────────┐
 .xlsx file ─┼─► FileReader ─► SheetJS ─► parse rows ──┐│
             │                                         ▼│
             │   localStorage ◄──── persist ───── App state (React) ───► Cloudscape UI
             │        │                                ▲   │
             │        └──── read once at startup ──────┘   └──► SheetJS writeFile ─► .xlsx download
             │   Service worker (pre-cached assets, offline)                        │
             └──────────────────────────────────────────────────────────────────────┘
```

## Source layout

```
index.html
vite.config.js            Vite, PWA and Vitest configuration
eslint.config.js
.prettierrc.json / .prettierignore
scripts/
  generate-changelog.js   CHANGELOG.md → package.json version + src/changelog.js
src/
  main.jsx                Entry point: global styles, <App/> in StrictMode
  App.jsx                 The application component: state, handlers, layout, dialogs
  DrawModal.jsx           Random draw dialog and reel
  DrawModal.css           Styles of the draw dialog (only custom CSS)
  translations.js         `export const translations = { en_US: {...}, fr_FR: {...}, ... }`
  changelog.js            GENERATED — `export const changelog = "<markdown>"`; never edited by hand
  lib/
    participants.js       Pure business functions (no React, no DOM except crypto)
    storage.js            localStorage keys and safe helpers
  test/setup.js           Test setup (jest-dom, cleanup, polyfills)
  **/*.test.js(x)         Tests next to the code
CHANGELOG.md              Single source of truth for versions
template_attendees.xlsx   Blank import template
```

**Component model**: almost all UI lives in one `App` component (plus a small `CheckInButton`). This is deliberate for a tool of this size (see [ADR-03](09-constraints-and-decisions.md)). The draw dialog is a separate component because of its dedicated animation and styles. Logic that does not need React lives in `lib/`.

## State management

- Plain React state (`useState`, `useMemo`, `useRef`, `useEffect`); no external store.
- **Initialization**: persisted settings and participants are read **synchronously** with lazy `useState` initializers, so the first render already shows stored data. Effects only **write back**.
- **Persistence effects**: one effect writes the participant list (or removes the key when empty); one writes the settings object whenever one of its fields changes; one writes the load timestamp.
- **Derived data** is memoized: filtered + sorted list, current page, statistics, chart series, eligible participants.
- **Table column definitions** are rebuilt on every render (not memoized) so that cell callbacks always call the current handlers.
- **Dialogs** are driven by state objects: `participantModal` (`null | { mode, data, errors }`), `confirmModal` (`null | { messageKey, choices }`), booleans for the event name and changelog dialogs, `draw` for the draw dialog.
- **Draw timer**: kept in a ref; cleared when a new draw starts, when the dialog closes and when the component unmounts.
- All mutations of the participant list go through the state setter with immutable updates (`map`, spread).
- Randomness and ids are produced in event handlers (never during render), through `lib/` helpers.

## Pure functions (`src/lib/participants.js`)

| Function                                       | Contract                                                                                                                                                                                                 |
| ---------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `createId(prefix)`                             | `<prefix>-<Date.now()>-<6 random base-36 chars>`                                                                                                                                                         |
| `normalizeName(name)`                          | Name normalization ([F01](functional/F01-import.md#name-normalization))                                                                                                                                  |
| `toLocale(languageCode)`                       | `fr_FR` → `fr-FR`; `tlh_TLH` → `fr-FR`                                                                                                                                                                   |
| `parseParticipantRows(rows, now = Date.now())` | Spreadsheet rows (objects keyed by header) → `{ participants, skipped }` ([F01](functional/F01-import.md))                                                                                               |
| `findDuplicates(participants)`                 | Later occurrences with same name (case-insensitive) or same non-empty email                                                                                                                              |
| `formatNames(participants, max = 5)`           | `"First Last, First Last…"`                                                                                                                                                                              |
| `filterParticipants(list, { status, text })`   | Status filter AND case-insensitive search on first name, last name, email                                                                                                                                |
| `sortParticipants(list, field, ascending)`     | New sorted array; `checkedIn` and `type` sort as 0/1, other fields as lower-case text                                                                                                                    |
| `computeStats(list)`                           | `{ total, checkedIn, manual }`                                                                                                                                                                           |
| `computeProgressSeries(list)`                  | `{ expected, checkedIn }` point arrays or `null` ([F05](functional/F05-statistics-chart.md))                                                                                                             |
| `buildExportRows(list, t, locale)`             | Localized export rows ([F06](functional/F06-export.md))                                                                                                                                                  |
| `buildExportFileName(eventName, date)`         | Export file name                                                                                                                                                                                         |
| `getDrawEligible(list)`                        | Checked in and not absent                                                                                                                                                                                |
| `secureRandom()`                               | `crypto.getRandomValues(new Uint32Array(1))[0] / 2^32`                                                                                                                                                   |
| `pickRandom(items, random = secureRandom)`     | Uniform pick, `null` for an empty array                                                                                                                                                                  |
| `shuffle(items, random = secureRandom)`        | Fisher-Yates, returns a new array                                                                                                                                                                        |
| `buildReel(eligible, winner, length, random)`  | `{ items, winnerIndex }` ([F08](functional/F08-random-draw.md), FR-DRW-13 to 15); placeholders are `{ id: 'placeholder-before' \| 'placeholder-after', firstName: '', lastName: '', placeholder: true }` |
| `reelLength(seconds)`                          | `min(80, max(3, round(seconds × 15)))`                                                                                                                                                                   |

Random-dependent functions accept an injectable `random` function for deterministic tests.

## Storage helpers (`src/lib/storage.js`)

Exports the three keys (`STORAGE_KEY`, `SETTINGS_KEY`, `LAST_LOAD_KEY`) and `readJSON(key, fallback)`, `writeJSON(key, value)`, `writeText(key, value)`, `removeKey(key)`. Each helper catches every exception (missing storage, quota, invalid JSON), logs it with `console.error`, and returns the fallback — they never throw.

## Draw dialog (`src/DrawModal.jsx`)

Props: `draw`, `duration` (the configured duration while rolling, `0` otherwise), `eligibleCount`, `onDrawAgain`, `onDismiss`, `t`.

- `Reel` renders two `Strip` layers (`side` and `centre`) from the same props; the centre layer carries the result test id and the side layer is `aria-hidden`.
- The reel is re-mounted for each draw (`key = draw.id`) so the CSS animation restarts.
- The scroll distance is passed as the CSS variable `--steps` (= `winnerIndex − 1`), the duration as `--duration`, the longest name length as `--longest`; the CSS computes positions and font sizes from them.
- The stopped state is expressed by a class on the reel, which triggers the winner color, pop and frame pulse.

## Changelog pipeline

`scripts/generate-changelog.js` runs before `dev`, `build` and `test`:

1. Reads `CHANGELOG.md`, extracts the first `[X.Y.Z]` as the current version.
2. Writes it to `package.json` if different (2-space JSON, trailing newline).
3. Writes `src/changelog.js` as `export const changelog = <JSON.stringify(markdown without its first line)>;` — `JSON.stringify` makes backticks and special characters safe.

The application reads the version from `package.json` and the text from `src/changelog.js`.
