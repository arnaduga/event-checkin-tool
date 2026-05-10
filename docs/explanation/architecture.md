# Architecture and Design Decisions

## No-server design

The application runs entirely in the browser. There is no backend, no API, and no database. All participant data and settings are stored in `localStorage`.

This is intentional: the tool is used at events where network connectivity may be unreliable or absent. Staff can open the application, import a list, and run check-in operations without depending on any external service. The tradeoff is that data is scoped to a single browser on a single device — there is no real-time sync between multiple check-in stations.

## Single-file component model

All application logic lives in `src/App.jsx`. This is a deliberate choice for a tool of this scope: the component tree is shallow (one main `App` component plus a small `CheckInButton` sub-component), and splitting into multiple files would add navigation overhead without meaningful benefit.

The only extracted module is `src/translations.js`, which holds all UI strings for both supported languages (English and French).

## Cloudscape Design System

The application uses [Cloudscape](https://cloudscape.design/), AWS's open-source design system. It provides accessible, production-quality components (tables, modals, form controls, layout shell) without custom CSS. The tradeoff is a large dependency bundle and occasional limitations — Cloudscape components intercept DOM events internally, which required using a native `<button>` element for the check-out interaction rather than a Cloudscape `Button`.

## Versioning and changelog automation

The `CHANGELOG.md` file is the single source of truth for versioning. The script `scripts/generate-changelog.js` reads `CHANGELOG.md` on every `dev` and `build` run, extracts the latest `[X.Y.Z]` version, updates `package.json`, and regenerates `src/changelog.js` (a JS module exporting the changelog text for in-app display).

This means the version in `package.json` and the in-app changelog are always derived from `CHANGELOG.md` — there is no manual version bump step.

## Data flow

```
Excel file upload
       │
       ▼
  FileReader API  ──►  xlsx.read()  ──►  participants state
                                              │
                              ┌───────────────┼───────────────┐
                              ▼               ▼               ▼
                         useMemo()       localStorage     Export XLSX
                     (filter/sort/page)   (auto-save)
                              │
                              ▼
                         Cloudscape Table
```

All participant mutations (check-in, check-out, manual addition, reset) go through `setParticipants`, which triggers a `useEffect` that persists the new state to `localStorage`. There is no separate save action.
