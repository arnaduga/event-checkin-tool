# F09 — Event Name

## User story

> As an organizer, I want to name the event so that it appears on screen and in the exported file name.

## Requirements

| ID        | Requirement                                                                                                                                                                                                                                                       |
| --------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| FR-EVT-01 | The statistics panel title MUST show `appTitle` when no event name is set, or `<appTitle>: <event name>` otherwise. If this text is longer than 40 characters, it MUST be cut at 40 characters followed by `…`, and the full text MUST be available as a tooltip. |
| FR-EVT-02 | Clicking the title MUST open a dialog titled `eventName` with a text field (label `eventName`, description `eventNameDescription`, placeholder `placeholderEventName`) pre-filled with the current name, and focused.                                             |
| FR-EVT-03 | **Enter** in the field or the `confirm` button MUST save the name (as typed, possibly empty) and close the dialog. `cancel`, the close icon or Escape MUST close without saving.                                                                                  |
| FR-EVT-04 | The event name MUST be persisted with the settings. It is set automatically by an import when empty ([F01](F01-import.md), FR-IMP-11), cleared by a full reset ([F07](F07-reset.md)) and used in the export file name ([F06](F06-export.md)).                     |

## Acceptance criteria

- **AC-EVT-01** — _Given_ no event name, _when_ I click the title, type `Gala` and press Enter, _then_ the title reads "Event Check-in: Gala" (English) and the name survives a page reload.
