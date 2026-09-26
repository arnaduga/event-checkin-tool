# 09 — Constraints and Decisions

## Constraints

| ID   | Constraint                                                                                                                          |
| ---- | ----------------------------------------------------------------------------------------------------------------------------------- |
| C-01 | **No backend**: static files only, hosted on GitHub Pages under a custom domain (`https://event.zgur.net/`, base path `/`).         |
| C-02 | **Offline first**: must work without network after the first load ([NFR-OFF](06-non-functional-requirements.md)).                   |
| C-03 | **No personal data leaves the device** ([NFR-DAT-02](06-non-functional-requirements.md)).                                           |
| C-04 | **Input format imposed by the registration platform**: French column headers (`Prénom`, `Nom`, `Email`) among many ignored columns. |
| C-05 | **Cloudscape Design System** for all UI; custom CSS only where Cloudscape has no equivalent (draw animation).                       |
| C-06 | **Default language French**; all texts translatable; source language of code and docs English.                                      |
| C-07 | **Free tooling and hosting** (open source libraries, GitHub Actions, GitHub Pages). MIT license.                                    |
| C-08 | **Main device: 10" Android tablet** (e.g. Samsung Galaxy Tab), portrait or landscape, used by non-technical staff.                  |

## Architecture decision records

### ADR-01 — Browser-only application with localStorage

- **Context**: entrance desks often have no reliable network; events are small; one device per event.
- **Decision**: no server; the participant list and settings are stored in `localStorage`.
- **Consequences**: zero hosting cost, works offline, no personal data on a server. No multi-device sync, data bound to one browser; staff must export to keep a record.

### ADR-02 — Progressive Web App with automatic updates

- **Context**: a page reload without network must not break the tool.
- **Decision**: `vite-plugin-pwa` pre-caches every asset; `registerType: autoUpdate`.
- **Consequences**: offline reloads work; new versions arrive at the next online load. Rolling back to a version **older than 1.4.0** (the first with the service worker) would leave devices stuck on the cached version — forbidden.

### ADR-03 — Single main component, pure logic in modules

- **Context**: small application, shallow component tree.
- **Decision**: UI in `App.jsx` (plus `DrawModal.jsx`); business logic in pure functions under `src/lib/`.
- **Consequences**: easy navigation; logic unit-testable without rendering. `App.jsx` is large (~1,100 lines) — split it if it keeps growing.

### ADR-04 — Cloudscape Design System

- **Context**: need accessible, consistent components (table, modals, forms, chart, layout) without writing CSS.
- **Decision**: use Cloudscape for everything, including the chart.
- **Consequences**: professional look and accessibility for free; large bundle (> 500 kB, accepted thanks to PWA caching); a few workarounds (dimming absent rows with wrapping elements).

### ADR-05 — `CHANGELOG.md` as single source of versioning

- **Decision**: the version is the first `[X.Y.Z]` of `CHANGELOG.md`; a script propagates it to `package.json` and generates `src/changelog.js` for the in-app changelog.
- **Consequences**: no manual version bump; `src/changelog.js` must never be edited by hand.

### ADR-06 — Confirmation dialog for check-out (not double-tap)

- **Context**: accidental check-outs on tablets; a double-tap guard (v1.1.0) triggered browser zoom.
- **Decision**: single tap + confirmation dialog showing the participant's name (since v1.3.1).
- **Consequences**: one extra step for a rare, deliberate action; check-in remains a single tap.

### ADR-07 — SheetJS from the official CDN

- **Context**: `xlsx@0.18.5` (last version on npm) has high-severity vulnerabilities; SheetJS publishes newer versions only on its CDN.
- **Decision**: depend on `https://cdn.sheetjs.com/xlsx-0.20.3/xlsx-0.20.3.tgz`; the lockfile pins its integrity hash.
- **Consequences**: no known vulnerabilities; no automatic updates through semver ranges — upgrades are manual URL changes.

### ADR-08 — Secure randomness and pre-selected winner for draws

- **Decision**: the winner is picked with `crypto.getRandomValues` before the animation; the reel is built around it and is purely decorative.
- **Consequences**: fairness does not depend on the animation; the result is never revealed early (including with reduced motion).

### ADR-09 — CSS-only reel with two synchronized layers

- **Context**: names must be magnified in the centre row and faded elsewhere **during** scrolling; a JS per-frame computation would be heavier and less smooth.
- **Decision**: two identical strips animated by the same CSS keyframes: a faded side layer masked out of the centre row, and a larger centre layer clipped to it. Font size fitted with container query units and a CSS variable carrying the longest name length.
- **Consequences**: smooth GPU animation, no JS timers per frame; relies on modern CSS (container queries, masks, `clip-path`). An earlier 3D-dice animation was abandoned (browser rendering glitches with 3D transforms).

### ADR-10 — Tag-based rollback on GitHub Pages

- **Decision**: every release is tagged `vX.Y.Z`; the `github-pages` environment accepts deployments from `main` and from tags `v*`, so any tagged version can be redeployed with a manual workflow run.
- **Consequences**: rollback without git revert; the next push to `main` redeploys `main`.

## Known limitations and technical debt

- The main bundle exceeds 500 kB (Cloudscape, SheetJS); lazy-loading SheetJS and the chart is a possible optimization.
- No per-participant deletion; no undo other than check-out and editing.
