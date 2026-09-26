# Event Check-in Tool

A browser-based participant check-in application for events. No server required — all data stays in your browser.

## Features

- Import participant lists from Excel files (.xlsx)
- Check in participants with a single click; check out with a confirmation dialog
- Add participants manually during the event, and edit existing ones
- Mark participants as absent
- Real-time statistics (total, checked in, pending, manual additions)
- Check-in progress chart (expected vs. checked in over time)
- Export results to Excel at any time
- Search by name or email, filter by status (checked in, not checked in, absent)
- Reset check-ins only (to reuse a list) or everything
- Multilingual interface (English, French, Spanish, Italian, Klingon)
- Dark mode support
- Works offline (PWA) — all data persists in browser local storage across page refreshes

## Quick Start

```bash
npm install
npm run dev
```

Open `http://localhost:3000` in your browser.

## Documentation

- [How-to guides](docs/how-to/) — step-by-step task instructions
- [Reference](docs/reference/) — Excel format, UI layout, data storage
- [Explanation](docs/explanation/) — design decisions and architecture

## Build & Deploy

```bash
npm run build   # outputs to dist/
```

Deployed automatically to GitHub Pages on push to `main`.

## Tech Stack

- [React 19](https://react.dev/) — UI framework
- [Vite](https://vite.dev/) — build tool
- [Cloudscape Design System](https://cloudscape.design/) — UI components
- [xlsx](https://github.com/SheetJS/sheetjs) — Excel parsing and export
- [vite-plugin-pwa](https://vite-pwa-org.netlify.app/) — offline support

## Versioning

`CHANGELOG.md` is the single source of truth: the version in `package.json` and the in-app changelog (`src/changelog.js`, generated) are derived from it on every `dev` / `build` run.

## License

MIT
