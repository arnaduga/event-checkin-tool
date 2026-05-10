# Data Storage Reference

The application stores all data in the browser's `localStorage`. No data is sent to any server.

## Storage keys

### `event-checkin-participants`

Stores the full participant list as a JSON array. Each entry has the following fields:

| Field | Type | Description |
|---|---|---|
| `id` | string | Unique identifier (`participant-<index>-<timestamp>` or `manual-<timestamp>`) |
| `firstName` | string | Normalized first name |
| `lastName` | string | Normalized last name |
| `email` | string | Email address (may be empty) |
| `checkedIn` | boolean | `true` if the participant has been checked in |
| `checkedInAt` | string \| null | ISO 8601 timestamp of check-in, or `null` |
| `manuallyAdded` | boolean | `true` for participants added manually during the event |

This key is written every time the participant list changes. It is removed when the **Reset** button is used.

### `event-checkin-settings`

Stores user preferences as a JSON object:

| Field | Type | Description |
|---|---|---|
| `language` | object | Selected language option (`{ value, label }`) |
| `darkMode` | boolean | Dark mode on/off |
| `eventName` | string | Event name used in export filename |
| `pageSize` | number | Number of rows per table page |
| `statusFilter` | object | Active status filter option (`{ value, label }`) |
| `splitPanelPreferences` | object | Panel layout preference (`{ position: 'side' \| 'bottom' }`) |

## Resetting data

To clear participants: click **Reset** in the setup panel. This removes the `event-checkin-participants` key from `localStorage` and empties the table.

To clear all data including settings: open your browser's developer tools and run:

```javascript
localStorage.removeItem('event-checkin-participants');
localStorage.removeItem('event-checkin-settings');
```

Then reload the page.
