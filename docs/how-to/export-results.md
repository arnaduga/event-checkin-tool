# Export Check-in Results

This guide shows how to export the current participant list and check-in statuses to an Excel file.

## Steps

1. Click **Export to Excel** in the statistics panel header.
2. Confirm the export in the dialog that appears.
3. A `.xlsx` file is downloaded immediately by your browser.

## Output file

The exported file contains a single sheet named `Participants`, with one row per participant and the following columns (column headers and values use the current interface language):

| Column        | Content                                                         |
| ------------- | --------------------------------------------------------------- |
| First Name    | Participant first name                                          |
| Last Name     | Participant last name                                           |
| Email         | Participant email address                                       |
| Type          | "Registered" (from import) or "Manual" (added during event)     |
| Status        | "Done" (checked in) or "Not Checked In"                         |
| Check-in Time | Localized date and time of check-in, or `-` if not checked in   |
| Absent        | "Absent" if the participant is flagged as absent, `-` otherwise |

## File naming

The filename is generated automatically:

```
<EventName>_participants_<YYYY-MM-DD>.xlsx
```

Non-alphanumeric characters in the event name are replaced with `_`. If no event name is set, the filename starts with `participants_`.

The event name can be set by clicking the event title in the statistics panel header.

## Notes

- The export reflects the current state of the list, including all manual additions, check-outs and absent flags.
- Applying a search filter or status filter does **not** affect the export — all participants are always exported.
- The export button is disabled when the participant list is empty.
- If the export fails, an error notification is shown at the top of the page.
