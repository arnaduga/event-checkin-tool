# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
