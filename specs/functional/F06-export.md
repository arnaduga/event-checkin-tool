# F06 — Excel Export

## User story

> As an organizer, I want to download the list with everyone's check-in status, to keep a record and share it after the event.

## Requirements

| ID        | Requirement                                                                                                                                                                                                                                           |
| --------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| FR-EXP-01 | An **Export to Excel** button (`exportTable`, primary, download icon) in the statistics panel header MUST be disabled when the list is empty.                                                                                                         |
| FR-EXP-02 | Clicking it MUST ask for confirmation (`confirmExport`). Confirming generates and downloads the file; cancelling does nothing.                                                                                                                        |
| FR-EXP-03 | The file MUST be an `.xlsx` workbook generated in the browser, with a single sheet named `Participants` and one row per participant, in stored order, **ignoring the current search, filter, sort and page**.                                         |
| FR-EXP-04 | Columns, in this order, with headers and values in the **current interface language**: see table below.                                                                                                                                               |
| FR-EXP-05 | File name: `<EventName>_participants_<YYYY-MM-DD>.xlsx`, where every character of the event name that is not an ASCII letter or digit is replaced by `_`, and the date is the current UTC date. Without event name: `participants_<YYYY-MM-DD>.xlsx`. |
| FR-EXP-06 | If generation fails, an error notification (`exportError`) MUST be shown (no browser `alert`).                                                                                                                                                        |

| Header key          | Value                                                                               |
| ------------------- | ----------------------------------------------------------------------------------- |
| `columnFirstName`   | First name                                                                          |
| `columnLastName`    | Last name                                                                           |
| `columnEmail`       | Email                                                                               |
| `columnType`        | `typeManual` or `typeRegistered`                                                    |
| `columnStatus`      | `statusCheckedIn` or `statusNotCheckedIn`                                           |
| `columnCheckedInAt` | Check-in date and time formatted with the current locale (`toLocaleString`), or `-` |
| `columnAbsent`      | `absent` if absent, `-` otherwise                                                   |

## Acceptance criteria

- **AC-EXP-01** — _Given_ event name `Gala 2026 / Paris` on 2026-09-26, _then_ the file is named `Gala_2026___Paris_participants_2026-09-26.xlsx`.
- **AC-EXP-02** — _Given_ the interface in English and a checked-in, absent, registered participant, _then_ its row has Status "Done", Type "Registered", Absent "Absent" and a formatted check-in time.
- **AC-EXP-03** — _Given_ a search filter is active, _when_ I export, _then_ all participants are exported.
