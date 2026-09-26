# UI Layout Reference

## Application shell

The application uses the Cloudscape `AppLayout` component with a content header, a content area and a split panel for settings. The content header and the table header stay visible when scrolling.

### Notifications (top)

Import results and errors (participants imported, rows ignored, possible duplicates, unreadable file, export failure) are shown as dismissible notifications at the top of the page. Notifications from a previous import are cleared when a new file is imported.

### Content header

The **statistics panel** shows four counters:

| Counter              | Meaning                                                       |
| -------------------- | ------------------------------------------------------------- |
| **Total**            | Number of participants in the list                            |
| **Checked In**       | Participants currently checked in                             |
| **Pending**          | Total minus checked in (absent participants are counted here) |
| **Manual Additions** | Participants added manually during the event                  |

Action buttons (Import, Reset, Export) are in the panel header. The panel title shows the application name followed by the event name (truncated to 40 characters); clicking it opens a popup to edit the event name.

### Content area (center)

Contains two stacked sections:

1. **Participants table** — the main working area (see below).
2. **Check-in progress chart** — visible once at least one participant has been checked in. Shows two curves over time:
   - **Expected**: number of participants expected, starting from the first check-in; it increases each time a manually added participant is checked in.
   - **Checked In**: cumulative number of check-ins.

### Settings panel (split panel)

Opened via the split panel toggle at the edge of the window. It can be displayed on the side (default) or at the bottom, and resized; its layout is remembered. It contains:

- **Language** selector — five available languages: English (US), Français (FR), Español (ES), Italiano (IT), tlhIngan Hol (Klingon).
- **Dark Mode** toggle — switches between light and dark Cloudscape themes.
- **GitHub** link — opens the repository in a new tab.
- **Version** link — opens the in-app changelog modal.
- **Last loaded** — date and time of the most recent page load.

## Statistics panel header actions

| Button              | Behaviour                                                                                                                                                                                |
| ------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Import**          | Opens the file picker immediately. If the table is non-empty, a confirmation dialog appears after file selection.                                                                        |
| **Reset**           | Opens a dialog with two choices: _Check-ins only_ (clears check-in status and absent flags but keeps participants) or _Full reset_ (clears everything). Disabled when the list is empty. |
| **Export to Excel** | Asks for confirmation, then downloads a `.xlsx` file. Disabled when the list is empty.                                                                                                   |

## Participants table

| UI element                 | Description                                                                                 |
| -------------------------- | ------------------------------------------------------------------------------------------- |
| **Header counter**         | `(filtered/total) — Checked In: x/total`                                                    |
| **Search bar**             | Filters rows by first name, last name, or email (case-insensitive)                          |
| **Status filter**          | Dropdown: All / Checked In Only / Not Checked In Only / Absent Only                         |
| **Add Participant** button | Opens the manual addition modal                                                             |
| **Column headers**         | Click to sort ascending/descending; drag edge to resize. Default sort: last name, ascending |
| **Preferences icon** (⚙)   | Opens the Cloudscape CollectionPreferences dialog to set page size                          |
| **Pagination**             | Navigates between pages; hidden when page size is set to All (default)                      |

### Columns

| Column            | Content                                                                     | Sortable                 |
| ----------------- | --------------------------------------------------------------------------- | ------------------------ |
| _(actions)_       | Check-in button (see below)                                                 | Yes (by check-in status) |
| **Last Name**     | Participant last name                                                       | Yes                      |
| **First Name**    | Participant first name                                                      | Yes                      |
| **Type**          | _Registered_ (imported, green) or _Manual_ (added during the event, orange) | Yes                      |
| **Check-in Time** | Localized date and time of check-in, or `-`                                 | Yes                      |
| _(edit)_          | `…` icon button that opens the Edit Participant modal                       | No                       |

The email address is not displayed in the table; it is visible and editable in the Edit Participant modal.

### Check-in button

- **Check In** (primary button): shown when the participant is not checked in. Single click checks them in.
- **Done** (normal button, with checkmark icon): shown when the participant is checked in. Single click opens a confirmation dialog ("Mark **First Last** as not checked in?") to check them out.

### Row interaction

Clicking the **Last Name** or **First Name** cell is equivalent to clicking the check-in button (a confirmation dialog appears when checking out).

### Absent participants

Participants flagged as absent are displayed with a dimmed row. Their check-in button is disabled and clicking their name has no effect. Their check-in state is kept as is.

## Add / Edit Participant modal

The same modal is used to add a participant (via **Add Participant**) and to edit one (via the `…` button). It opens focused on the first field. Required fields display an inline error if left empty. Press **Enter** or click **Add** / **Save** to submit.

| Field                  | Required | Notes                                                                                                                                                      |
| ---------------------- | -------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| First Name             | Yes      | Normalized on save                                                                                                                                         |
| Last Name              | Yes      | Normalized on save                                                                                                                                         |
| Email                  | No       | No format validation                                                                                                                                       |
| Check-in Automatically | —        | Toggle. Defaults to on when adding. Turning it on records the current time; turning it off clears the check-in time; leaving it on keeps the original time |
| Absent                 | —        | Toggle. Marks the participant as absent                                                                                                                    |

## Event name popup

Opened by clicking the statistics panel title. Press **Enter** or click **Confirm** to save. The name is used in the header and in the export filename.

## Changelog modal

Accessible by clicking the version number in the Settings panel. Displays the full changelog rendered from Markdown, with section headings (Added, Changed, Fixed…) shown as coloured badges.
