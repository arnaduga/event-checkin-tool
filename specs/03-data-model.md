# 03 — Data Model

All data lives in the browser. There is no server-side data.

## Participant

| Field           | Type           | Description                                                                                                                                                                                                                |
| --------------- | -------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `id`            | string         | Unique identifier. Imported: `participant-<rowIndex>-<timestamp>` (row index in the sheet before skipping, timestamp in ms of the import). Manual: `manual-<timestamp>-<random>` where `<random>` is 6 base-36 characters. |
| `firstName`     | string         | Normalized first name (may be empty for imported rows having only a last name).                                                                                                                                            |
| `lastName`      | string         | Normalized last name (may be empty for imported rows having only a first name).                                                                                                                                            |
| `email`         | string         | Email address, may be empty. Trimmed on import, stored as typed when entered manually.                                                                                                                                     |
| `checkedIn`     | boolean        | `true` when the participant is checked in.                                                                                                                                                                                 |
| `checkedInAt`   | string \| null | ISO 8601 timestamp (UTC, `Date.prototype.toISOString`) of the check-in, `null` when not checked in.                                                                                                                        |
| `absent`        | boolean        | `true` when marked absent. Independent from `checkedIn`.                                                                                                                                                                   |
| `manuallyAdded` | boolean        | `true` for manual participants (type _Manual_), `false` for imported ones (type _Registered_).                                                                                                                             |

**Invariants**

- `checkedIn === false` ⇒ `checkedInAt === null`; `checkedIn === true` ⇒ `checkedInAt` is a valid timestamp.
- `id` values are unique within the list.
- The list order is the import order followed by manual additions in creation order. Sorting in the UI never changes it.

## Settings

| Field                   | Type                  | Default                                      | Description                                                                                                                          |
| ----------------------- | --------------------- | -------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| `language`              | `{ value, label }`    | `{ value: 'fr_FR', label: 'Français (FR)' }` | Selected language option ([i18n](05-i18n.md)).                                                                                       |
| `darkMode`              | boolean               | OS preference `prefers-color-scheme: dark`   | Dark theme on/off.                                                                                                                   |
| `eventName`             | string                | `''`                                         | Event name.                                                                                                                          |
| `pageSize`              | number                | `0`                                          | Rows per page; `0` means _All_ (no pagination).                                                                                      |
| `statusFilter`          | `{ value, label? }`   | `{ value: 'all' }`                           | Status filter; only `value` is meaningful (`all`, `checkedIn`, `notCheckedIn`, `absent`); the label is recomputed from the language. |
| `splitPanelPreferences` | `{ position, size? }` | `{ position: 'side' }`                       | Settings panel position (`side` or `bottom`) and size in px.                                                                         |
| `drawDuration`          | number                | `4`                                          | Random draw animation duration in seconds (`0` = no animation).                                                                      |

## Transient state (not persisted)

- Search text, current page, sort column and direction (default: last name ascending).
- Open dialogs and their form data, pending file to import, participant pending check-out.
- Notifications.
- Current draw: `{ id, winner, reel: { items, winnerIndex }, rolling }`.

## Local storage keys

| Key                          | Format                         | Written                                             | Removed                     |
| ---------------------------- | ------------------------------ | --------------------------------------------------- | --------------------------- |
| `event-checkin-participants` | JSON array of Participant      | On every change of the list, when it is not empty   | When the list becomes empty |
| `event-checkin-settings`     | JSON object Settings           | On every change of a setting (also once at startup) | Never by the application    |
| `event-checkin-last-load`    | Raw ISO 8601 string (not JSON) | At every page load                                  | Never by the application    |

**Rules**

- Stored data MUST be read synchronously when the application starts, to initialize the state before the first render.
- Missing keys, invalid JSON, or storage access errors (private browsing, quota exceeded, blocked storage) MUST fall back to defaults; the error is logged to the console and the application keeps working in memory. Storage access MUST never throw to the UI.
- Missing fields in stored objects MUST take their default value (forward compatibility of older data). Unknown fields MUST be ignored.
- Data written by any 1.4.x or 1.5.x version MUST be readable by the others (no destructive migration).

## Import file format

- Excel workbook (`.xlsx`, legacy `.xls` accepted). First sheet only; first row = headers.
- Recognized headers (case-sensitive): first name `Prénom` | `First Name` | `Prenom` | `prénom`; last name `Nom` | `Last Name` | `nom`; email `Email` | `email`. Other columns are ignored.
- Example (a typical registration platform export also contains many other columns such as `ID`, `Evénement`, `Adresse`, `Téléphone`…, all ignored):

| Prénom | Nom    | Email                    |
| ------ | ------ | ------------------------ |
| Marie  | Dupont | marie.dupont@example.com |
| Jean   | Martin | jean.martin@example.com  |

A blank template `template_attendees.xlsx` is provided at the repository root.

## Export file format

See [F06](functional/F06-export.md): single sheet `Participants`, 7 localized columns, file name `<EventName>_participants_<YYYY-MM-DD>.xlsx`.
