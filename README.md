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

Requires Node.js 22.12 or later.

```bash
npm install
npm run dev
```

Open `http://localhost:3000` in your browser.

## Development

| Command                | Description                                   |
| ---------------------- | --------------------------------------------- |
| `npm run dev`          | Start the development server on port 3000     |
| `npm run lint`         | Run ESLint                                    |
| `npm run format`       | Format all files with Prettier                |
| `npm run format:check` | Check formatting without writing              |
| `npm test`             | Run the test suite once (Vitest)              |
| `npm run test:watch`   | Run tests in watch mode                       |
| `npm run check`        | Lint + formatting check + tests, as run in CI |
| `npm run build`        | Production build to `dist/`                   |

## Documentation

- [How-to guides](docs/how-to/) — step-by-step task instructions
- [Reference](docs/reference/) — Excel format, UI layout, data storage
- [Explanation](docs/explanation/) — design decisions and architecture

## Build & Deploy

```bash
npm run build   # outputs to dist/
```

Deployed automatically to GitHub Pages on push to `main`, after lint, formatting check and tests pass.

## Tech Stack

- [React 19](https://react.dev/) — UI framework
- [Vite](https://vite.dev/) — build tool
- [Cloudscape Design System](https://cloudscape.design/) — UI components
- [xlsx](https://github.com/SheetJS/sheetjs) — Excel parsing and export
- [vite-plugin-pwa](https://vite-pwa-org.netlify.app/) — offline support
- [Vitest](https://vitest.dev/) + [Testing Library](https://testing-library.com/) — tests
- [ESLint](https://eslint.org/) with React and React Hooks plugins — linting
- [Prettier](https://prettier.io/) — code formatting

## Versioning

`CHANGELOG.md` is the single source of truth: the version in `package.json` and the in-app changelog (`src/changelog.js`, generated) are derived from it on every `dev` / `build` run.

## License

MIT
