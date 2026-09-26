# Architecture and Design Decisions

## No-server design

The application runs entirely in the browser. There is no backend, no API, and no database. All participant data and settings are stored in `localStorage`.

This is intentional: the tool is used at events where network connectivity may be unreliable or absent. Staff can open the application, import a list, and run check-in operations without depending on any external service. The tradeoff is that data is scoped to a single browser on a single device — there is no real-time sync between multiple check-in stations.

## Offline support (PWA)

The application is a Progressive Web App built with `vite-plugin-pwa`. A Workbox service worker pre-caches all assets (JS, CSS, HTML, icons, fonts) on first load, so the application keeps working — including page refreshes — without network. The service worker uses `autoUpdate`: a new version is fetched and activated automatically when the device is online.

A web app manifest allows installing the application on a phone or desktop and running it in standalone mode.

## Single-component model

Almost all UI code lives in `src/App.jsx`; the random draw dialog is a separate component because of its dedicated animation and styles. This is a deliberate choice for a tool of this scope: the component tree is shallow (one main `App` component plus a small `CheckInButton` sub-component), and splitting into multiple files would add navigation overhead without meaningful benefit.

Logic that does not depend on React is kept in plain modules, so it can be unit tested without rendering the UI:

| File                                  | Content                                                                                                                                                                                                                          |
| ------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/main.jsx`                        | React entry point, loads Cloudscape global styles                                                                                                                                                                                |
| `src/App.jsx`                         | The whole UI: state, handlers, layout, modals                                                                                                                                                                                    |
| `src/DrawModal.jsx` + `DrawModal.css` | Random draw dialog with the slot-machine name reel animation (the only custom CSS in the app, since Cloudscape has no equivalent)                                                                                                |
| `src/lib/participants.js`             | Pure functions: name normalization, spreadsheet row parsing, duplicate detection, filtering, sorting, statistics, chart series, export rows and file name, random draw (eligibility, secure random pick, shuffle, reel building) |
| `src/lib/storage.js`                  | `localStorage` keys and safe read/write helpers (never throw, e.g. in private browsing)                                                                                                                                          |
| `src/translations.js`                 | All UI strings for all supported languages (English, French, Italian, Spanish, and Klingon), keyed by locale code (`en_US`, `fr_FR`, …)                                                                                          |
| `src/changelog.js`                    | Generated file — see below                                                                                                                                                                                                       |

State is initialized synchronously from `localStorage` (lazy `useState` initializers), so the first render already shows the stored participants and settings; effects only write back.

Modals are managed with a small number of state objects: `participantModal` (shared by add and edit), `confirmModal` (a generic confirmation dialog described by a message key and a list of choices, each mapped to an action run by `runConfirmedAction`: `import`, `export`, `uncheck`, `reset`, `resetCheckinOnly`), plus dedicated states for the event name and changelog modals.

## Cloudscape Design System

The application uses [Cloudscape](https://cloudscape.design/), AWS's open-source design system. It provides accessible, production-quality components (tables, modals, form controls, layout shell, charts) without custom CSS. The tradeoff is a large dependency bundle and occasional limitations, which are worked around with small inline styles (e.g. dimming absent rows with a wrapping `<span>`).

## Localization

Language codes use an underscore (`fr_FR`); they are converted to BCP 47 tags (`fr-FR`) for date formatting. Klingon (`tlh_TLH`) is not a valid locale for `Intl`, so dates fall back to `fr-FR` formatting in that language.

## Versioning and changelog automation

The `CHANGELOG.md` file is the single source of truth for versioning. The script `scripts/generate-changelog.js` reads `CHANGELOG.md` on every `dev` and `build` run, extracts the latest `[X.Y.Z]` version, updates `package.json`, and regenerates `src/changelog.js` (a JS module exporting the changelog text for in-app display).

This means the version in `package.json` and the in-app changelog are always derived from `CHANGELOG.md` — there is no manual version bump step. `src/changelog.js` must never be edited by hand.

## Quality checks

- **ESLint** (`eslint.config.js`, flat config): `@eslint/js` recommended rules, `eslint-plugin-react` and `eslint-plugin-react-hooks` (including the React Compiler rules such as purity and no synchronous `setState` in effects).
- **Prettier** (`.prettierrc.json`: single quotes, semicolons, 100-character lines, ES5 trailing commas) formats JavaScript, JSON, YAML, HTML and Markdown. `eslint-config-prettier` disables ESLint rules that would conflict with it. Generated files (`src/changelog.js`) and build output are excluded in `.prettierignore`.
- **Vitest** with **jsdom** and **Testing Library** (`src/test/setup.js` polyfills `matchMedia` and `ResizeObserver` for Cloudscape). Tests live next to the code they cover:
  - `src/lib/*.test.js` — unit tests of the pure logic and storage helpers
  - `src/translations.test.js` — every language defines the same keys as `en_US`, with no empty values
  - `src/App.test.jsx` — integration tests rendering the whole app: check-in / check-out, absent participants, Excel import (files are generated in memory with `xlsx`), manual addition, confirmations, persistence, reset and random draw (eligibility, reel duration with fake timers)

Cloudscape keeps every modal in the DOM, including the changelog, whose text may contain sample names. Integration tests therefore locate a dialog by its own content (`dialogWith(text)`) and table cells inside the table body, rather than querying the whole screen.

## Deployment

A GitHub Actions workflow (`.github/workflows/deploy.yml`) runs lint, the formatting check and tests, builds the application and deploys `dist/` to GitHub Pages on every push to `main`. Any failure blocks the deployment. The `github-pages` environment also accepts deployments from `v*` tags, which allows redeploying any tagged release — see [Deploy a release and roll back](../how-to/deploy-and-rollback.md).

## Data flow

```
Import button click
       │
       ▼
  file picker  ──► (confirmation if list non-empty) ──► FileReader API
                                                               │
                                                               ▼
                                                         xlsx.read()
                                                               │
                                                               ▼
                                                      participants state
                                                               │
                                          ┌────────────────────┼────────────────────┐
                                          ▼                    ▼                    ▼
                                     useMemo()            localStorage          Export XLSX
                              (filter/sort/page,          (auto-save)
                               stats, chart series)
                                          │
                              ┌───────────┴───────────┐
                              ▼                       ▼
                       Cloudscape Table        MixedLineBarChart
                                          (check-in progress over time)
```

All participant mutations (check-in, check-out, edit, absent flag, manual addition, reset) go through `setParticipants`, which triggers a `useEffect` that persists the new state to `localStorage`. There is no separate save action. When the list becomes empty, the storage key is removed.
