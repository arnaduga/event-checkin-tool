# F03 — Participant Management (Add, Edit, Absent)

## User stories

> As check-in staff, I want to add a person who is not on the list (walk-in), already checked in, in a few keystrokes.

> As check-in staff, I want to fix a misspelled name or an email, and change a participant's status.

> As an organizer, I want to mark a participant as absent when I know they will not come, so that they are not counted as expected and cannot win the draw.

## Participant dialog

Adding and editing use **the same dialog**, in two modes.

| Field / control                                              | Add mode default | Rules                                                                            |
| ------------------------------------------------------------ | ---------------- | -------------------------------------------------------------------------------- |
| First name (`firstName`, placeholder `placeholderFirstName`) | empty            | Required (`required` constraint text). Normalized on save.                       |
| Last name (`lastName`, placeholder `placeholderLastName`)    | empty            | Required. Normalized on save.                                                    |
| Email (`email`, placeholder `placeholderEmail`)              | empty            | Optional, email input type, no format validation, stored as typed.               |
| Check-in toggle (label `autoCheckIn`)                        | **on**           | Toggle; its text shows `statusCheckedIn` when on, `statusNotCheckedIn` when off. |
| Absent toggle (label `absent`)                               | off              | Toggle; its text shows `absent` when on, `–` when off.                           |

The two toggles are displayed side by side (two equal columns).

## Requirements

| ID        | Requirement                                                                                                                                                                                                                                                                                                                |
| --------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| FR-PAR-01 | An **Add Participant** button (`addParticipant`) in the participants table header MUST open the dialog in add mode, titled `addParticipantTitle`, with the defaults above.                                                                                                                                                 |
| FR-PAR-02 | A `…` icon button in the last column of each row MUST open the dialog in edit mode, titled `editParticipantTitle`, pre-filled with the participant's current values.                                                                                                                                                       |
| FR-PAR-03 | When the dialog opens, the first name field MUST receive the focus.                                                                                                                                                                                                                                                        |
| FR-PAR-04 | Submitting (primary button `add` in add mode, `save` in edit mode, or **Enter** in any field) MUST validate that first name and last name are not blank. Each blank required field MUST show an inline error (`errorRequired`) and be marked invalid; if the first name is blank, it MUST get the focus. Nothing is saved. |
| FR-PAR-05 | A field's inline error MUST disappear as soon as the user types a non-blank value in it.                                                                                                                                                                                                                                   |
| FR-PAR-06 | **Add**: the new participant MUST be appended to the list with: id `manual-<timestamp>-<random>`, normalized names, the typed email, `checkedIn` from the toggle, `checkedInAt` = now if checked in else `null`, `absent` from the toggle, type _Manual_.                                                                  |
| FR-PAR-07 | **Edit**: names MUST be normalized, email and absent flag updated. Check-in time rules: toggle turned **on** for a participant not checked in → now; toggle **kept on** → original time kept; toggle **off** → `null`.                                                                                                     |
| FR-PAR-08 | **Cancel** (link button `cancel`), the close icon or Escape MUST close the dialog without saving.                                                                                                                                                                                                                          |
| FR-PAR-09 | Pressing **Enter** to submit the add dialog MUST NOT re-open the dialog (the key event must not reach the Add Participant button); a guard of about 500 ms after submission is acceptable.                                                                                                                                 |
| FR-PAR-10 | An **absent** participant's row MUST be displayed dimmed (40 % opacity on all its cells except the edit button) and cannot be checked in or out from the table ([F02](F02-check-in.md), FR-CHK-07). The absent flag MUST NOT modify the check-in state.                                                                    |
| FR-PAR-11 | Participants cannot be deleted individually (only through a full reset, [F07](F07-reset.md)).                                                                                                                                                                                                                              |

## Acceptance criteria

- **AC-PAR-01** — _Given_ an empty list, _when_ I add `anne-sophie` / `LEROY` and submit, _then_ the list contains `Anne-Sophie Leroy`, checked in, type _Manual_.
- **AC-PAR-02** — _Given_ the add dialog with an empty first name, _when_ I submit, _then_ an inline error is shown on the first name and nothing is added.
- **AC-PAR-03** — _Given_ a participant checked in at 09:00, _when_ I edit their email and save with the check-in toggle still on, _then_ the check-in time is still 09:00.
- **AC-PAR-04** — _Given_ a participant, _when_ I turn the absent toggle on and save, _then_ the row is dimmed, the check-in button is disabled and the "Absent only" filter shows them.
