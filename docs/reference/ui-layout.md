# UI Layout Reference

## Application shell

The application uses the Cloudscape `AppLayout` component with the following regions:

### Content area (center)

Contains two stacked sections:

1. **Statistics panel** — shows four counters: Total, Checked In, Pending (total minus checked in), Manual Additions. Displayed at the top as key-value pairs.
2. **Participants table** — the main working area (see below).

### Setup panel (left split panel)

Opened via the toolbar icon on the left side. Contains:

- **Event Name** — free-text field used in the export filename and displayed in the page header.
- **File Upload** — drag-and-drop or click-to-browse upload for `.xlsx` files.
- **Reset** — clears all participants and the loaded file. Disabled when the list is empty.
- **Export to Excel** — downloads the current list. Disabled when the list is empty.

### Settings panel (right tools panel)

Opened via the toolbar icon on the right side. Contains:

- **Language** selector — English (US) or Français (FR).
- **Dark Mode** toggle — switches between light and dark Cloudscape themes.
- **GitHub** link — opens the repository in a new tab.
- **Version** link — opens the in-app changelog modal.

## Participants table

| UI element | Description |
|---|---|
| **Search bar** | Filters rows by first name, last name, or email (case-insensitive) |
| **Status filter** | Dropdown to show All / Checked In Only / Not Checked In Only |
| **Add Participant** button | Opens the manual addition modal |
| **Column headers** | Click to sort ascending/descending; drag edge to resize |
| **Preferences icon** | Opens page-size preference dialog |
| **Pagination** | Navigates between pages |

### Actions column

The first column of the table contains the check-in button:

- **Check In** (primary button): shown when the participant is not checked in. Single click checks them in.
- **✓ Checked In** (outlined button): shown when the participant is checked in. Requires a double-click (desktop) or double-tap (touch) to check out.

### Row interaction

Double-clicking on any cell in the Last Name, First Name, Email, Type, or Check-in Time columns also toggles the check-in status, equivalent to using the Actions column button.

## Changelog modal

Accessible by clicking the version number in the Settings panel. Displays the full changelog rendered from Markdown.

## Add Participant modal

Fields:

| Field | Required | Notes |
|---|---|---|
| First Name | Yes | Normalized on save |
| Last Name | Yes | Normalized on save |
| Email | No | No format validation |
| Check-in Automatically | — | Toggle; defaults to on |
