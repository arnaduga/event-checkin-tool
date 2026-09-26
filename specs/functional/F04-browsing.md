# F04 — Browsing: Table, Search, Filter, Sort, Pagination

## User story

> As check-in staff, I want to find a participant in a few characters and see at a glance who has arrived.

## Table columns

| Order | Column id     | Header              | Content                                                                             | Sortable (sort key)             | Width (min) |
| ----- | ------------- | ------------------- | ----------------------------------------------------------------------------------- | ------------------------------- | ----------- |
| 1     | `actions`     | _(none)_            | Check-in button ([F02](F02-check-in.md))                                            | Yes — by check-in status        | 160 (160)   |
| 2     | `lastName`    | `columnLastName`    | Last name, clickable ([F02](F02-check-in.md))                                       | Yes — text                      | 220 (150)   |
| 3     | `firstName`   | `columnFirstName`   | First name, clickable                                                               | Yes — text                      | 220 (150)   |
| 4     | `type`        | `columnType`        | Status indicator: `typeRegistered` (success/green) or `typeManual` (warning/orange) | Yes — registered before manual  | 140 (120)   |
| 5     | `checkedInAt` | `columnCheckedInAt` | Check-in date and time formatted with the current locale, or `-`                    | Yes — text of the ISO timestamp | 180 (140)   |
| 6     | `edit`        | _(none)_            | `…` icon button opening the edit dialog ([F03](F03-participant-management.md))      | No                              | 50 (50)     |

The email is **not** displayed in the table (it is visible in the edit dialog).

## Requirements

| ID        | Requirement                                                                                                                                                                                                                                                                                                           |
| --------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| FR-BRW-01 | The table MUST show the columns above. Columns MUST be resizable. The table header MUST stay visible when scrolling (sticky).                                                                                                                                                                                         |
| FR-BRW-02 | The table title MUST be `participantsTitle` with a counter `(<filtered>/<total>) — <statsCheckedIn>: <checkedIn>/<total>` (e.g. `(12/50) — Checked In: 30/50`), or `(0)` when the list is empty.                                                                                                                      |
| FR-BRW-03 | When the list is empty (or nothing matches), the table MUST show `noParticipants` in bold and `noParticipantsDescription` below.                                                                                                                                                                                      |
| FR-BRW-04 | A search field (placeholder `searchPlaceholder`) MUST filter rows whose first name, last name **or email** contains the typed text, case-insensitively. Changing the search MUST go back to page 1.                                                                                                                   |
| FR-BRW-05 | A status dropdown MUST offer: `filterAll` (all), `filterCheckedIn` (checked in), `filterNotCheckedIn` (not checked in — absent participants included), `filterAbsent` (absent). Changing it MUST go back to page 1. The option labels MUST follow the current language, including for a filter restored from storage. |
| FR-BRW-06 | Status filter and search MUST combine (AND).                                                                                                                                                                                                                                                                          |
| FR-BRW-07 | Clicking a sortable column header MUST sort ascending, then descending. Default sort: last name ascending. Text sorts are case-insensitive; missing values sort as empty text. Sorting MUST NOT modify the stored order.                                                                                              |
| FR-BRW-08 | A preferences control (gear icon) MUST let the user choose the page size: `pageSizeAll` (value 0, **default**), 10, 20, 50 or 100 `participants`. Its dialog uses `pageSize` as title, `confirm` / `cancel` buttons. Changing the page size MUST go back to page 1.                                                   |
| FR-BRW-09 | With a page size other than _All_, a pagination control MUST allow navigating pages (`ceil(filtered / pageSize)` pages). With _All_, no pagination control is shown.                                                                                                                                                  |
| FR-BRW-10 | The **Add Participant** and **Random draw** buttons ([F03](F03-participant-management.md), [F08](F08-random-draw.md)) and the status dropdown MUST be in the table header, in this order: status dropdown, Add Participant, Random draw.                                                                              |
| FR-BRW-11 | Status filter and page size MUST be persisted ([data model](../03-data-model.md)); the search text MUST NOT be persisted.                                                                                                                                                                                             |

## Acceptance criteria

- **AC-BRW-01** — _Given_ Marie Dupont (checked in), Jean Martin (email `jm@corp.io`) and Léa Durand (absent), _when_ I search `DU`, _then_ Marie Dupont and Léa Durand are shown; _when_ I search `corp`, _then_ only Jean Martin is shown.
- **AC-BRW-02** — _Given_ the same list, _when_ I select "Not Checked In Only" and search `du`, _then_ only Léa Durand is shown.
- **AC-BRW-03** — _Given_ a stored status filter "Checked In Only", _when_ the application loads, _then_ only checked-in participants are shown.
- **AC-BRW-04** — _Given_ last names `martin`, `Dupont`, `Durand`, _when_ sorted by last name ascending, _then_ the order is Dupont, Durand, martin.
