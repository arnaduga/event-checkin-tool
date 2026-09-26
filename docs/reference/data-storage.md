# Data Storage Reference

The application stores all data in the browser's `localStorage`. No data is sent to any server.

If `localStorage` is unavailable or full (e.g. some private browsing modes), the application keeps working for the current session; the error is logged in the browser console and data is not persisted.

## Storage keys

### `event-checkin-participants`

Stores the full participant list as a JSON array. Each entry has the following fields:

| Field           | Type           | Description                                                                                                                 |
| --------------- | -------------- | --------------------------------------------------------------------------------------------------------------------------- |
| `id`            | string         | Unique identifier (`participant-<index>-<timestamp>` for imported rows, `manual-<timestamp>-<random>` for manual additions) |
| `firstName`     | string         | Normalized first name                                                                                                       |
| `lastName`      | string         | Normalized last name                                                                                                        |
| `email`         | string         | Email address (may be empty)                                                                                                |
| `checkedIn`     | boolean        | `true` if the participant has been checked in                                                                               |
| `checkedInAt`   | string \| null | ISO 8601 timestamp of check-in, or `null`                                                                                   |
| `absent`        | boolean        | `true` if the participant has been marked as absent (independent of `checkedIn`)                                            |
| `manuallyAdded` | boolean        | `true` for participants added manually during the event                                                                     |

This key is written every time the participant list changes. It is removed when the list becomes empty (e.g. after a **Full reset**).

### `event-checkin-settings`

Stores user preferences as a JSON object:

| Field                   | Type    | Description                                                                                                       |
| ----------------------- | ------- | ----------------------------------------------------------------------------------------------------------------- |
| `language`              | object  | Selected language option (`{ value, label }`, e.g. `{ value: 'fr_FR', label: 'Français (FR)' }`)                  |
| `darkMode`              | boolean | Dark mode on/off                                                                                                  |
| `eventName`             | string  | Event name, shown in the header and used in the export filename                                                   |
| `pageSize`              | number  | Number of rows per table page (`0` means _All_, no pagination)                                                    |
| `statusFilter`          | object  | Active status filter option (`{ value, label }`, where `value` is `all`, `checkedIn`, `notCheckedIn` or `absent`) |
| `splitPanelPreferences` | object  | Settings panel layout (`{ position: 'side' \| 'bottom', size? }`)                                                 |

This key is written whenever one of these settings changes.

### `event-checkin-last-load`

Stores the ISO 8601 timestamp of the most recent page load. It is overwritten on every load and displayed as **Last loaded** at the bottom of the Settings panel.

## Defaults

When no settings are stored, the application starts with:

- Language: Français (FR)
- Dark mode: follows the operating system preference
- Page size: All
- Status filter: All

## Resetting data

The **Reset** button in the statistics panel header offers two options:

| Option             | Effect                                                                                                                   |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------ |
| **Check-ins only** | Keeps all participants, clears `checkedIn`, `checkedInAt` and `absent` on every entry                                    |
| **Full reset**     | Removes the `event-checkin-participants` key, empties the table, clears the event name and resets the page size to _All_ |

To clear all data including settings, open your browser's developer tools and run:

```javascript
localStorage.removeItem('event-checkin-participants');
localStorage.removeItem('event-checkin-settings');
localStorage.removeItem('event-checkin-last-load');
```

Then reload the page.
