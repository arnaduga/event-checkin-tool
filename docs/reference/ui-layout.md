# UI Layout Reference

## Application shell

The application uses the Cloudscape `AppLayout` component with the following regions:

### Content area (center)

Contains three stacked sections:

1. **Statistics panel** — shows four counters: Total, Checked In, Pending (total minus checked in), Manual Additions. Action buttons (Import, Reset, Export) are in the panel header. Clicking the event title opens an inline edit popup.
2. **Participants table** — the main working area (see below).
3. **Check-in progress chart** — visible once at least one participant has been checked in. Shows two curves over time: expected (flat, total participant count) and checked-in (rising).

### Settings panel (right tools panel)

Opened via the gear icon in the toolbar. Contains:

- **Language** selector — six available languages: English (US), Français (FR), Deutsch (DE), Español (ES), Italiano (IT), tlhIngan Hol (Klingon).
- **Dark Mode** toggle — switches between light and dark Cloudscape themes.
- **GitHub** link — opens the repository in a new tab.
- **Version** link — opens the in-app changelog modal.

## Statistics panel header actions

Three buttons are always visible in the statistics panel header:

| Button | Behaviour |
|---|---|
| **Import** | Opens the file picker immediately. If the table is non-empty, a confirmation dialog appears after file selection. |
| **Reset** | Opens a dialog with two choices: *Check-ins only* (clears check-in status but keeps participants) or *Full reset* (clears everything). |
| **Export to Excel** | Asks for confirmation, then downloads a `.xlsx` file. |

## Event name

The event name is displayed as the statistics panel title. Clicking it opens a popup to edit it. The name is used in the export filename.

## Participants table

| UI element | Description |
|---|---|
| **Search bar** | Filters rows by first name, last name, or email (case-insensitive) |
| **Status filter** | Dropdown to show All / Checked In Only / Not Checked In Only |
| **Add Participant** button | Opens the manual addition modal |
| **Column headers** | Click to sort ascending/descending; drag edge to resize |
| **Preferences icon** (⚙) | Opens the Cloudscape CollectionPreferences dialog to set page size |
| **Pagination** | Navigates between pages; hidden when page size is set to All |

### Actions column

The first column of the table contains the check-in button:

- **Check In** (primary button): shown when the participant is not checked in. Single click checks them in.
- **Done** (normal button, with checkmark icon): shown when the participant is checked in. Single click opens a confirmation dialog to check them out.

### Row interaction

Clicking on any cell in the Last Name, First Name, Email, Type, or Check-in Time columns also toggles the check-in status, equivalent to using the Actions column button (a confirmation dialog appears when checking out).

## Changelog modal

Accessible by clicking the version number in the Settings panel. Displays the full changelog rendered from Markdown.

## Add Participant modal

Opens focused on the first field. Required fields display an inline error if left empty. Press **Enter** or click **Add** to submit.

| Field | Required | Notes |
|---|---|---|
| First Name | Yes | Normalized on save |
| Last Name | Yes | Normalized on save |
| Email | No | No format validation |
| Check-in Automatically | — | Check In button; defaults to checked in |
