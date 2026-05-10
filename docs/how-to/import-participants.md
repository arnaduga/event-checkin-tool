# Import a Participant List

This guide shows how to load participants from an Excel file before or during an event.

## Prerequisites

- An Excel file (.xlsx) with participant data. See the [Excel format reference](../reference/excel-format.md) for the expected column names.
- A sample template is available at the root of the repository: `template_attendees.xlsx`.

## Steps

1. Open the application in your browser.
2. Click the **file upload panel icon** (top-right toolbar) to open the setup panel.
3. Under **File Upload**, click **Choose file** or drag and drop your `.xlsx` file onto the upload area.
4. The participant list loads immediately. The table shows all participants with their check-in status set to *Not Checked In*.
5. If the **Event Name** field is empty, it is automatically filled with the filename (without extension). You can change it at any time.

## What happens to existing data

Uploading a new file **replaces** the current participant list entirely. Any manually added participants or check-in statuses recorded in the current session are discarded.

If you need to preserve existing check-ins, [export the data first](export-results.md).

## Troubleshooting

| Symptom | Cause | Fix |
|---|---|---|
| No participants appear after upload | Column headers not recognized | Verify column names match the [expected format](../reference/excel-format.md) |
| Names appear in unexpected casing | Input data uses all-caps or all-lowercase | The application normalizes names automatically (first letter capitalized) |
| Error alert on upload | File is corrupted or is not a valid `.xlsx` | Re-export from Excel and try again |
