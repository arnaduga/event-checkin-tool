# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.4.5] - 2026-09-26

### Added

- Import warns about possible duplicates (same first and last name, or same email), listing up to five names; duplicates are still imported

### Changed

- The confirmation dialog is now fully generic: the reset choices (check-ins only / full reset) use the same mechanism as the other confirmations
- Cancelling a confirmation now discards the pending file or check-out

### Security

- SheetJS (`xlsx`) upgraded from 0.18.5 to 0.20.3, installed from the official SheetJS CDN, fixing a prototype pollution and a regular expression denial of service vulnerability
- Development dependencies updated to fix `npm audit` findings

## [1.4.4] - 2026-09-26

### Added

- Linting with ESLint (React and React Hooks rules) and a test suite with Vitest and Testing Library (`npm run lint`, `npm test`, `npm run check`)
- Code formatting with Prettier (`npm run format`, `npm run format:check`); the whole codebase and documentation have been reformatted
- Lint, formatting check and tests run in CI before every deployment; a failure blocks the deployment

### Changed

- Pure logic (import parsing, filtering, sorting, statistics, chart series, export) moved from `App.jsx` to `src/lib/participants.js`; storage helpers moved to `src/lib/storage.js`
- Stored participants and settings are loaded before the first render instead of in an effect
- CI now uses Node.js 24 (Node.js 22.12 or later is required)

### Fixed

- The application no longer crashes when `localStorage` is unavailable (e.g. some private browsing modes)
- Removing all participants now also clears them from storage
- Manually added participants get a collision-free identifier

## [1.4.3] - 2026-09-26

### Added

- Notifications at the top of the page after an import: number of participants imported, and a warning with the number of rows ignored (no first or last name)

### Fixed

- Import of an unreadable file or of a file without recognized name columns no longer fails silently: an error message is shown and the current participant list is kept (the event name is no longer changed either)
- Rows without first and last name are no longer imported as empty participants
- Name normalization now capitalizes every part of compound names (e.g. `JEAN-PIERRE` → `Jean-Pierre`, `O'BRIEN` → `O'Brien`)
- Export error is now shown as a translated notification instead of a browser alert
- Untranslated texts: dark mode toggle state, table loading text, chart accessibility labels
- Status filter label now always matches the selected language
- Changelog generation no longer breaks when an entry contains Markdown inline code (backticks)

## [1.4.2] - 2026-09-26

### Fixed

- Absent participants could still be checked in or out by clicking their last name or first name cell

### Changed

- Documentation updated to match the current application behaviour

## [1.4.1] - 2026-05-27

### Fixed

- "Reset check-ins only" now also clears the absent flag on all participants

## [1.4.0] - 2026-05-27

### Added

- Absent flag per participant: toggle in the edit modal marks a participant as absent, graying out their row in the table (check-in button disabled) while keeping their check-in state intact
- Absent status included in Excel export as a dedicated column
- "Absent only" filter option in the table filter dropdown

### Changed

- Edit modal: "Check-in" and "Absent" controls are now side by side in a two-column layout
- Edit modal: check-in control replaced with a toggle (consistent with the Absent toggle)
- Table: email column removed (info remains accessible via the "…" edit modal)
- Table: type column (Registered / Manual) restored

## [1.3.3] - 2026-05-27

### Added

- Offline support via PWA service worker: all assets are pre-cached on first load, so the app works fully without network (refreshing the page no longer loses the session when offline)

## [1.3.2] - 2026-05-25

### Changed

- App header: removed subtitle (app description) for a cleaner look
- App header and table header now stay visible when scrolling
- Table title now shows the checked-in count alongside the participant count (e.g. "Participants (39/39) — Checked In: 4/39")
- Check-out confirmation dialog now shows the participant's name in bold (e.g. "Mark **John Smith** as not checked in?")

### Fixed

- Reset modal: missing space between "Check-ins only" and "Full reset" buttons

## [1.3.1] - 2026-05-22

### Changed

- Check-out (uncheck) now uses a single click with a confirmation dialog instead of double-click / double-tap, fixing the accidental zoom issue on mobile

## [1.3.0] - 2026-05-10

### Added

- Page size option "All" (shows every participant without pagination, selected by default)
- Check-in progress chart below the participants table (time on X axis, expected vs. checked-in curves)

### Changed

- Import, Reset, and Export actions moved to the statistics panel header (replacing the file upload side panel)
- Clicking the event title opens an inline edit popup (event name removed from Settings panel)
- Reset now offers two choices: reset check-ins only, or full reset (clears all participants)
- Add Participant modal: auto-focuses first field, validates required fields inline, supports Enter key to submit, uses a Check In button instead of a toggle for immediate check-in
- "Checked In" button now uses Cloudscape Button styling (consistent size and shape with "Check In")
- Page size preference uses the native Cloudscape CollectionPreferences component
- Page index resets to 1 when loading a new file or resetting
- Changelog section headings (Added, Changed, Fixed…) are now displayed as coloured badges

### Fixed

- Switching to Klingon language no longer causes a blank screen (invalid BCP 47 locale tag)

## [1.2.0] - 2026-05-10

### Added

- Multiple adidtionnal languages

## [1.1.0] - 2026-05-09

### Changed

- Check-out (uncheck) now requires a double-click / double-tap to prevent accidental unchecking on mobile

## [1.0.4] - 2025-12-30

### Added

- Initial release of Event Check-in Tool
- Excel file upload for participant lists
- Manual participant addition
- Check-in/check-out functionality with toggle switches
- Real-time statistics (total, checked-in, pending, manual additions)
- Export functionality to Excel
- Multi-language support (English and French)
- Dark mode support
- Event name customization
- Status filtering (all, checked-in only, not checked-in only)
- Search functionality by name or email
- Pagination with customizable page size
- Sortable columns
- Resizable columns
- Local storage persistence
- Double-click to toggle check-in status
- Setup and preferences on drawers

### Fixed

- Base path, as per custom subdomain for Github Pages
- Default event name from filename
- Export XLSX issue fixed #2
