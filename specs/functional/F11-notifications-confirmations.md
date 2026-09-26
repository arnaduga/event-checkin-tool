# F11 — Notifications and Confirmations

Cross-cutting behaviour used by the other features.

## Notifications

| ID        | Requirement                                                                                                                                                                                          |
| --------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| FR-NTF-01 | Notifications MUST be displayed at the top of the page (design system flash bar), stacked in emission order.                                                                                         |
| FR-NTF-02 | Each notification has a type (`success`, `warning`, `error`), a text, and MUST be dismissible individually (dismiss label `dismiss`).                                                                |
| FR-NTF-03 | Notifications are not persisted. Import notifications are cleared when a new import starts ([F01](F01-import.md)).                                                                                   |
| FR-NTF-04 | Emitters: import success / skipped rows / duplicates / errors ([F01](F01-import.md)), export error ([F06](F06-export.md)). No other feature emits notifications. Browser `alert()` MUST NOT be used. |

## Confirmation dialog

A single generic confirmation dialog serves every confirmation.

| ID        | Requirement                                                                                                                                                                   |
| --------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| FR-CNF-01 | The dialog is titled `confirm`, shows a message, and offers a `cancel` link button followed by one or more choice buttons. Exactly one choice is primary.                     |
| FR-CNF-02 | It MUST be described by data: a message key and a list of choices `{ action, labelKey, primary? }`. Texts are resolved in the current language at render time.                |
| FR-CNF-03 | Choosing an action MUST run it, then close the dialog. Cancel, the close icon or Escape MUST close it and discard any pending data (selected file, participant to check out). |

| Usage              | Message                                                  | Choices                                                                  |
| ------------------ | -------------------------------------------------------- | ------------------------------------------------------------------------ |
| Import over a list | `confirmImport`                                          | `confirm` → import (primary)                                             |
| Export             | `confirmExport`                                          | `confirm` → export (primary)                                             |
| Check-out          | `confirmCheckOutPrefix` **name** `confirmCheckOutSuffix` | `confirm` → check out (primary)                                          |
| Reset              | `confirmReset`                                           | `resetCheckinOnly` → reset check-ins; `resetFull` → full reset (primary) |
