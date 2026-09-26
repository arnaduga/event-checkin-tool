# F01 — Participant List Import

## User story

> As an event organizer, I want to load the list of registered participants from the Excel file exported by our registration platform, so that staff can check people in without typing their names.

## Requirements

| ID        | Requirement                                                                                                                                                                                                                                                                                               |
| --------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| FR-IMP-01 | An **Import** button (`importParticipants`, upload icon) in the statistics panel header MUST open the operating system file picker immediately. The picker MUST accept `.xlsx` and `.xls` files.                                                                                                          |
| FR-IMP-02 | Selecting the same file twice in a row MUST trigger a new import (the file input is cleared before opening the picker).                                                                                                                                                                                   |
| FR-IMP-03 | If the participant list is **not empty** when a file is selected, a confirmation dialog (`confirmImport`) MUST be shown before importing. Confirming imports the file; cancelling discards the selected file and changes nothing.                                                                         |
| FR-IMP-04 | If the list is empty, the file MUST be imported without confirmation.                                                                                                                                                                                                                                     |
| FR-IMP-05 | The file MUST be read locally in the browser (no upload). Only the **first sheet** is read. Its first row contains the column headers; each following non-empty row is a candidate participant.                                                                                                           |
| FR-IMP-06 | Columns MUST be mapped by exact (case-sensitive) header name. First name: `Prénom`, `First Name`, `Prenom`, `prénom`. Last name: `Nom`, `Last Name`, `nom`. Email: `Email`, `email`. For each field, the first header of the list having a non-empty value in the row is used. Other columns are ignored. |
| FR-IMP-07 | First and last names MUST be normalized (see [name normalization](#name-normalization)). Emails MUST be converted to text and trimmed.                                                                                                                                                                    |
| FR-IMP-08 | Rows with neither a first name nor a last name (after normalization) MUST be skipped. Rows with only one of them MUST be kept.                                                                                                                                                                            |
| FR-IMP-09 | Every imported participant MUST start as: not checked in, no check-in time, not absent, type _Registered_. Its id is `participant-<rowIndex>-<importTimestamp>` (see [data model](../03-data-model.md)).                                                                                                  |
| FR-IMP-10 | A successful import MUST **replace** the whole current list (including manual participants and all check-ins) and reset the table to page 1.                                                                                                                                                              |
| FR-IMP-11 | If the event name is empty, it MUST be set to the file name without its extension (e.g. `Gala 2026.xlsx` → `Gala 2026`). An existing event name MUST be kept.                                                                                                                                             |
| FR-IMP-12 | Notifications from a previous import MUST be cleared when a new import starts.                                                                                                                                                                                                                            |
| FR-IMP-13 | After a successful import, a **success** notification MUST show the number of imported participants (`importSuccess`, `{count}`).                                                                                                                                                                         |
| FR-IMP-14 | If rows were skipped (FR-IMP-08), a **warning** notification MUST show how many (`importSkippedRows`, `{count}`).                                                                                                                                                                                         |
| FR-IMP-15 | If possible duplicates exist in the imported list, a **warning** notification MUST show their number and up to 5 names (`importDuplicates`, `{count}`, `{names}`). Duplicates MUST still be imported. See [duplicate detection](#duplicate-detection).                                                    |
| FR-IMP-16 | If the file cannot be read or parsed, an **error** notification (`importError`) MUST be shown and the current list, event name and page MUST be left unchanged.                                                                                                                                           |
| FR-IMP-17 | If the file is readable but yields no participant (no recognized name column, empty sheet, non-Excel content parsed as an empty sheet), an **error** notification (`importNoParticipants`) MUST be shown and the current list, event name and page MUST be left unchanged.                                |

## Name normalization

Applies to imported names and to names entered manually ([F03](F03-participant-management.md)).

1. Convert the value to text; empty or missing values give an empty string.
2. Trim leading and trailing whitespace; collapse any run of whitespace into a single space.
3. Convert to lower case.
4. Upper-case every letter (Unicode letters, including accented ones) that is at the start of the value or follows a space, a hyphen `-`, an apostrophe `'` or a typographic apostrophe `’`.

| Input            | Output           |
| ---------------- | ---------------- |
| `DUPONT`         | `Dupont`         |
| `marie`          | `Marie`          |
| `JEAN-PIERRE`    | `Jean-Pierre`    |
| `O'BRIEN`        | `O'Brien`        |
| `d’ARTAGNAN`     | `D’Artagnan`     |
| `de la FONTAINE` | `De La Fontaine` |
| `  élodie  `     | `Élodie`         |
| `anne   marie`   | `Anne Marie`     |
| `42` (number)    | `42`             |

Particles (`de`, `la`, `van`…) are capitalized like any other word; this is accepted.

## Duplicate detection

A participant is a **possible duplicate** if an **earlier** participant in the list has:

- the same first name **and** last name, compared case-insensitively; **or**
- the same email address, compared case-insensitively, when the email is not empty.

The first occurrence is not reported; each later occurrence is. The names listed in the notification are `First Last`, joined with `, `, limited to the first 5, followed by `…` when there are more.

## Acceptance criteria

- **AC-IMP-01** — _Given_ an empty list, _when_ I import a file with rows `{Prénom: JEAN-PIERRE, Nom: MARTIN, Email: jp@example.com}`, `{Prénom: léa, Nom: durand}` and `{Email: orphan@example.com}`, _then_ the table shows `Jean-Pierre Martin` and `Léa Durand`, a success notification says "2 participants imported.", a warning says "1 rows without first or last name were ignored.", and the event name becomes the file name without extension.
- **AC-IMP-02** — _Given_ a list of 1 participant, _when_ I select a file whose only column is `Name`, _then_ a confirmation is asked; after confirming, an error notification starting with "No participants found" is shown and the list still contains the original participant.
- **AC-IMP-03** — _Given_ an import with `Marie Dupont` and `MARIE DUPONT`, _then_ a warning "1 possible duplicates (same name or email): Marie Dupont" is shown and both rows are imported.
- **AC-IMP-04** — _Given_ a non-empty list, _when_ I select a file and cancel the confirmation, _then_ nothing changes.
- **AC-IMP-05** — _Given_ a corrupted file, _when_ I import it, _then_ an error notification (`importError`) is shown and nothing changes.
