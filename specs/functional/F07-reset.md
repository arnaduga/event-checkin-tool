# F07 — Reset

## User stories

> As an organizer, I want to reuse the same list for a second session (e.g. day 2), keeping participants but clearing arrivals.

> As an organizer, I want to clear everything to prepare a new event.

## Requirements

| ID        | Requirement                                                                                                                                                                               |
| --------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| FR-RST-01 | A **Reset** button (`clearTable`, remove icon) in the statistics panel header MUST be disabled when the list is empty.                                                                    |
| FR-RST-02 | Clicking it MUST open a confirmation dialog with the message `confirmReset` and three buttons: `cancel`, `resetCheckinOnly` (normal) and `resetFull` (primary).                           |
| FR-RST-03 | **Check-ins only** MUST keep all participants (including manual ones) and set, on every participant: not checked in, no check-in time, **not absent**.                                    |
| FR-RST-04 | **Full reset** MUST empty the participant list, clear the event name, reset the page size to _All_ and go back to page 1. The stored participant list MUST be removed from local storage. |
| FR-RST-05 | **Cancel** MUST change nothing.                                                                                                                                                           |

## Acceptance criteria

- **AC-RST-01** — _Given_ a checked-in, absent participant, _when_ I choose **Check-ins only**, _then_ the participant is kept, not checked in, without check-in time and not absent.
- **AC-RST-02** — _Given_ a non-empty list, _when_ I choose **Full reset**, _then_ the table shows the empty state and the stored participant key no longer exists.
