# Export Check-in Results

This guide shows how to export the current participant list and check-in statuses to an Excel file.

## Steps

1. Click **Export to Excel** in the statistics panel header.
2. Confirm the export in the dialog that appears.
3. A `.xlsx` file is downloaded immediately by your browser.

## Output file

The exported file contains one row per participant with the following columns (column headers use the current interface language):

| Column | Content |
|---|---|
| First Name | Participant first name |
| Last Name | Participant last name |
| Email | Participant email address |
| Status | "Checked In" or "Not Checked In" |
| Check-in Time | Date and time of check-in, or `-` if not checked in |
| Type | "Registered" (from import) or "Manual" (added during event) |

## File naming

The filename is generated automatically:

```
<EventName>_participants_<YYYY-MM-DD>.xlsx
```

If no event name is set, the filename starts with `participants_`.

The event name can be set by clicking the event title in the statistics panel header.

## Notes

- The export reflects the current state of the list, including all manual additions and check-outs.
- Applying a search filter or status filter does **not** affect the export — all participants are always exported.
- The export button is disabled when the participant list is empty.
