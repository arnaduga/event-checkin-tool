# F02 — Check-in and Check-out

## User stories

> As check-in staff, I want to check a participant in with a single tap, so that the entrance queue moves fast.

> As check-in staff, I want undoing a check-in to require a confirmation, so that a mis-tap on a tablet does not silently erase an arrival.

## Requirements

| ID        | Requirement                                                                                                                                                                                                                                               |
| --------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| FR-CHK-01 | The first column of the participants table MUST contain a check-in button for each participant.                                                                                                                                                           |
| FR-CHK-02 | For a participant not checked in, the button MUST be a **primary** button labelled `checkIn` ("Check In"). One click MUST check the participant in immediately, without confirmation, recording the current date and time (ISO 8601) as check-in time.    |
| FR-CHK-03 | For a checked-in participant, the button MUST be a **normal** button with a success (check mark) icon, labelled `statusCheckedIn` ("Done").                                                                                                               |
| FR-CHK-04 | Clicking the button of a checked-in participant MUST open a confirmation dialog showing the participant's name in bold: `confirmCheckOutPrefix` + **First Last** + `confirmCheckOutSuffix` ("Mark **Marie Dupont** as not checked in?").                  |
| FR-CHK-05 | Confirming MUST set the participant back to not checked in and clear the check-in time. Cancelling (button, close icon or Escape) MUST change nothing.                                                                                                    |
| FR-CHK-06 | Clicking the **last name** or **first name** cell of a row MUST behave exactly like clicking the check-in button of that row (check in, or ask for check-out confirmation). The pointer cursor MUST indicate these cells are clickable.                   |
| FR-CHK-07 | For an **absent** participant ([F03](F03-participant-management.md)): the check-in button MUST be visually dimmed (40 % opacity) and not clickable; clicking the name cells MUST do nothing (default cursor); the check-in state MUST be preserved as is. |
| FR-CHK-08 | Check-in and check-out MUST update the statistics, the table counter, the progress chart and the persisted list immediately.                                                                                                                              |
| FR-CHK-09 | Check-out MUST NOT use a double-click / double-tap gesture (it triggers zoom on mobile browsers).                                                                                                                                                         |

## Acceptance criteria

- **AC-CHK-01** — _Given_ a participant not checked in, _when_ I click **Check In**, _then_ the button becomes **Done** and the stored participant has `checkedIn: true` and a non-null `checkedInAt`.
- **AC-CHK-02** — _Given_ a checked-in participant Marie Dupont, _when_ I click **Done**, _then_ a dialog "Mark Marie Dupont as not checked in?" appears; _when_ I confirm, _then_ the button becomes **Check In** and `checkedInAt` is `null`.
- **AC-CHK-03** — _Given_ the check-out dialog is open, _when_ I click **Cancel**, _then_ the participant stays checked in.
- **AC-CHK-04** — _Given_ an absent participant, _when_ I click their last name, _then_ nothing happens (no check-in, no dialog).
