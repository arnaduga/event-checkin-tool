# Event Check-in Tool

A browser-based participant check-in application for events. No server required — all data stays in your browser.

## Features

- Import participant lists from Excel files (.xlsx)
- Check in / check out participants with a single or double click
- Add participants manually during the event
- Real-time statistics (total, checked in, pending, manual additions)
- Export results to Excel at any time
- Search and filter by name, email, or check-in status
- Bilingual interface (English / French)
- Dark mode support
- All data persists in browser local storage across page refreshes

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

## License

MIT
