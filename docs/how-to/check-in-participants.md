# Check In and Check Out Participants

This guide covers how to record arrivals and correct check-in status during an event.

## Check in a participant

1. Find the participant using the search bar (search by first name, last name, or email).
2. Click the **Check In** button in the first column next to their name.
3. The button changes to **Done** (with a checkmark icon) and the check-in time is recorded.

> **Tip:** You can also click the participant's last name or first name cell — it has the same effect as the button.

## Check out a participant (undo a check-in)

1. Click the **Done** button (or the participant's last name or first name).
2. A confirmation dialog appears: "Mark **First Last** as not checked in?"
3. Click **Confirm** to undo the check-in, or **Cancel** to keep it.

For the reasoning behind this design, see [Why check-out requires a confirmation dialog](../explanation/check-out-interaction.md).

## Edit a participant

1. Click the **…** button at the end of the participant's row.
2. Update **First Name**, **Last Name** or **Email** as needed.
3. Use the **Check-in Automatically** toggle to change the check-in status. The original check-in time is kept if the participant was already checked in.
4. Press **Enter** or click **Save**.

## Mark a participant as absent

Use this when you know a registered participant will not come (e.g. they cancelled).

1. Click the **…** button at the end of the participant's row.
2. Turn on the **Absent** toggle.
3. Click **Save**.

The row is dimmed and the participant can no longer be checked in or out from the table (button and name cells are disabled). The participant's check-in state is not modified. To undo, open the modal again and turn the **Absent** toggle off.

## Add a participant who is not on the list

If someone arrives who is not in the imported list:

1. Click **Add Participant** (top-right of the table).
2. Fill in **First Name** (required), **Last Name** (required), and **Email** (optional).
3. Use the **Check-in Automatically** toggle (on by default) to decide whether the participant is immediately marked as checked in.
4. Press **Enter** or click **Add**.

The participant is added with type _Manual_ and appears in the table.

## Filter by status

Use the status dropdown above the table to show:

- **All** — everyone
- **Checked In Only** — only those who have arrived
- **Not Checked In Only** — only those still pending
- **Absent Only** — only those flagged as absent

The counter in the table header (e.g. `(12/50) — Checked In: 30/50`) shows filtered / total participants, followed by the number of check-ins.

## Start a new session with the same list

To reuse the same participant list (e.g. for a second day), click **Reset** in the statistics panel header, then choose **Check-ins only**. All check-ins and absent flags are cleared; participants, including manual additions, are kept.
