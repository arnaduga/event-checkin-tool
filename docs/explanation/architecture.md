# Architecture and Design Decisions

## No-server design

The application runs entirely in the browser. There is no backend, no API, and no database. All participant data and settings are stored in `localStorage`.

This is intentional: the tool is used at events where network connectivity may be unreliable or absent. Staff can open the application, import a list, and run check-in operations without depending on any external service. The tradeoff is that data is scoped to a single browser on a single device — there is no real-time sync between multiple check-in stations.

## Offline support (PWA)

The application is a Progressive Web App built with `vite-plugin-pwa`. A Workbox service worker pre-caches all assets (JS, CSS, HTML, icons, fonts) on first load, so the application keeps working — including page refreshes — without network. The service worker uses `autoUpdate`: a new version is fetched and activated automatically when the device is online.

A web app manifest allows installing the application on a phone or desktop and running it in standalone mode.

## Single-file component model

All application logic lives in `src/App.jsx`. This is a deliberate choice for a tool of this scope: the component tree is shallow (one main `App` component plus a small `CheckInButton` sub-component), and splitting into multiple files would add navigation overhead without meaningful benefit.

The other modules are:

| File | Content |
|---|---|
| `src/main.jsx` | React entry point, loads Cloudscape global styles |
| `src/translations.js` | All UI strings for all supported languages (English, French, Italian, Spanish, and Klingon), keyed by locale code (`en_US`, `fr_FR`, …) |
| `src/changelog.js` | Generated file — see below |

Modals are managed with a small number of state objects: `participantModal` (shared by add and edit), `confirmModal` (a generic confirmation dialog whose `action` field selects the behaviour: `import`, `reset`, `export`, `uncheck`), plus dedicated states for the event name and changelog modals.

## Cloudscape Design System

The application uses [Cloudscape](https://cloudscape.design/), AWS's open-source design system. It provides accessible, production-quality components (tables, modals, form controls, layout shell, charts) without custom CSS. The tradeoff is a large dependency bundle and occasional limitations, which are worked around with small inline styles (e.g. dimming absent rows with a wrapping `<span>`).

## Localization

Language codes use an underscore (`fr_FR`); they are converted to BCP 47 tags (`fr-FR`) for date formatting. Klingon (`tlh_TLH`) is not a valid locale for `Intl`, so dates fall back to `fr-FR` formatting in that language.

## Versioning and changelog automation

The `CHANGELOG.md` file is the single source of truth for versioning. The script `scripts/generate-changelog.js` reads `CHANGELOG.md` on every `dev` and `build` run, extracts the latest `[X.Y.Z]` version, updates `package.json`, and regenerates `src/changelog.js` (a JS module exporting the changelog text for in-app display).

This means the version in `package.json` and the in-app changelog are always derived from `CHANGELOG.md` — there is no manual version bump step. `src/changelog.js` must never be edited by hand.

## Deployment

A GitHub Actions workflow (`.github/workflows/deploy.yml`) builds the application and deploys `dist/` to GitHub Pages on every push to `main`.

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

All participant mutations (check-in, check-out, edit, absent flag, manual addition, reset) go through `setParticipants`, which triggers a `useEffect` that persists the new state to `localStorage`. There is no separate save action. Because this effect skips empty lists, a full reset removes the storage key explicitly.
