# Excel File Format Reference

This page describes the expected format for participant list files imported into the application, and the format of exported files.

## File type

The file picker accepts `.xlsx` and legacy `.xls` files. `.xlsx` is the recommended format. `.csv` is not supported.

## Sheet

Only the **first sheet** of the workbook is read. Additional sheets are ignored.

## Column headers

The application recognizes the following column names (case-sensitive). A first name and a last name column are expected.

| Field | Accepted column names |
|---|---|
| First Name | `Prénom`, `First Name`, `Prenom`, `prénom` |
| Last Name | `Nom`, `Last Name`, `nom` |
| Email | `Email`, `email` |

Extra columns in the file are ignored.

Rows that have neither a first name nor a last name (e.g. empty rows, or all rows when the name columns are not recognized) are skipped, and a warning shows how many were ignored. If no row is usable, the import is cancelled with an error message and the current participant list is left unchanged.

## Name normalization

First and last names are automatically normalized on import (and when adding or editing a participant manually): surrounding whitespace is trimmed, repeated spaces are collapsed, and every part of the name is capitalized — the first letter, and any letter following a space, a hyphen or an apostrophe.

| Input | Result |
|---|---|
| `DUPONT` | `Dupont` |
| `marie` | `Marie` |
| `JEAN-PIERRE` | `Jean-Pierre` |
| `O'BRIEN` | `O'Brien` |
| `de la FONTAINE` | `De La Fontaine` |

Email addresses are trimmed but otherwise kept as is.

## Initial state

Every imported participant starts as *not checked in*, *not absent*, with type *Registered*.

## Participant deduplication

The application does not deduplicate rows. If the same person appears twice in the file, they will appear twice in the table.

## Template

A blank template file is available at the root of the repository: `template_attendees.xlsx`.

## Example

| Prénom | Nom | Email |
|---|---|---|
| Marie | Dupont | marie.dupont@example.com |
| Jean | Martin | jean.martin@example.com |

## Export format

Exported files contain a single sheet named `Participants`, with one row per participant. Column headers use the current interface language. See [Export check-in results](../how-to/export-results.md) for the column list.
