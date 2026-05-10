# Excel File Format Reference

This page describes the expected format for participant list files imported into the application.

## File type

Only `.xlsx` files are accepted. `.csv` and legacy `.xls` formats are not supported.

## Sheet

Only the **first sheet** of the workbook is read. Additional sheets are ignored.

## Column headers

The application recognizes the following column names (case-sensitive). At least a first name and a last name column must be present.

| Field | Accepted column names |
|---|---|
| First Name | `Prénom`, `First Name`, `Prenom`, `prénom` |
| Last Name | `Nom`, `Last Name`, `nom` |
| Email | `Email`, `email` |

Extra columns in the file are ignored.

## Name normalization

First and last names are automatically normalized on import: the first character is uppercased, the rest are lowercased. For example, `DUPONT` becomes `Dupont`, and `marie` becomes `Marie`.

## Participant deduplication

The application does not deduplicate rows. If the same person appears twice in the file, they will appear twice in the table.

## Template

A blank template file is available at the root of the repository: `template_attendees.xlsx`.

## Example

| Prénom | Nom | Email |
|---|---|---|
| Marie | Dupont | marie.dupont@example.com |
| Jean | Martin | jean.martin@example.com |
