# Import a Participant List

This guide shows how to load participants from an Excel file before or during an event.

## Prerequisites

- An Excel file (`.xlsx`, or legacy `.xls`) with participant data. See the [Excel format reference](../reference/excel-format.md) for the expected column names.
- A sample template is available at the root of the repository: `template_attendees.xlsx`.

## Steps

1. Open the application in your browser.
2. Click **Import** in the statistics panel header.
3. Select your file in the file picker.
4. If the participant list is already non-empty, a confirmation dialog appears — confirm to replace the existing list.
5. The participant list loads immediately and a notification at the top of the page confirms how many participants were imported. All participants are *not checked in*, *not absent*, with type *Registered*.
6. If the **Event Name** is empty, it is automatically filled with the filename (without extension). You can click the event title at any time to edit it.

## What happens to existing data

Importing a new file **replaces** the current participant list entirely. Any manually added participants, check-in statuses and absent flags recorded in the current session are discarded.

If you need to preserve existing check-ins, [export the data first](export-results.md).

## Troubleshooting

| Symptom | Cause | Fix |
|---|---|---|
| "No participants found" error | Name column headers not recognized, or the first sheet is empty | Verify column names match the [expected format](../reference/excel-format.md) (they are case-sensitive). The current list is not modified |
| "N rows without first or last name were ignored" warning | Some rows have no first name and no last name (often empty rows at the end of the sheet) | Usually harmless; check the file if the count is unexpected |
| "The file could not be read" error | File is corrupted or is not a valid Excel file | Re-export from Excel and try again. The current list is not modified |
| Names appear in unexpected casing | Input data uses all-caps or all-lowercase | The application normalizes names automatically (each part capitalized) |
