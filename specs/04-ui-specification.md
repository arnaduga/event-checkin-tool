# 04 — UI Specification

The interface is built exclusively with the **Cloudscape Design System** components (see [technical stack](07-technical-stack.md)). Custom CSS is limited to the random draw dialog.

## Layout

```
┌─────────────────────────────────────────────────────────────────┬──────────────┐
│ [Notifications — flash bar, dismissible]                         │              │
├─────────────────────────────────────────────────────────────────┤  Settings    │
│ Event Check-in: <event name>          [Import] [Reset] [Export]  │  (split      │
│ Total      Checked In      Pending      Manual Additions         │   panel,     │
│  80           42             38              3                   │   side or    │
├─────────────────────────────────────────────────────────────────┤   bottom,    │
│ Participants (80/80) — Checked In: 42/80                         │   closed by  │
│                [Status ▾] [Add Participant] [🎟 Random draw]  ⚙  │   default)   │
│ [Search by name or email____________]                            │              │
│ ┌──────────┬───────────┬────────────┬────────────┬──────────┬─┐ │  Language    │
│ │          │ Last Name │ First Name │ Type       │ Check-in │ │ │  Dark mode   │
│ │[Check In]│ Dupont    │ Marie      │ ✓Registered│ -        │…│ │  Draw anim.  │
│ │[✓ Done  ]│ Martin    │ Jean       │ ⚠Manual    │ 09:05    │…│ │              │
│ └──────────┴───────────┴────────────┴────────────┴──────────┴─┘ │  GitHub v1.5 │
│ Check-in Progress                                                │  Last loaded │
│  [line chart: Expected / Checked In over time]                   │              │
└─────────────────────────────────────────────────────────────────┴──────────────┘
```

| Region              | Cloudscape component(s)                                                                       | Notes                                                                                                                |
| ------------------- | --------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| Shell               | `AppLayout` (navigation and tools hidden, `contentType="default"`)                            | Split panel used for settings                                                                                        |
| Notifications       | `Flashbar` in `AppLayout.notifications`                                                       | [F11](functional/F11-notifications-confirmations.md)                                                                 |
| Header + statistics | `Container` with `Header variant="h1"` in `AppLayout.contentHeader`                           | Title clickable ([F09](functional/F09-event-name.md)); actions: Import, Reset, Export. Stays visible when scrolling. |
| Statistics          | `Box` (`awsui-key-label` labels, `h2` values), `SpaceBetween` xxl                             | [F05](functional/F05-statistics-chart.md)                                                                            |
| Participants table  | `Table` + `TextFilter` + `Header` (counter, actions) + `Pagination` + `CollectionPreferences` | Sticky header, resizable columns ([F04](functional/F04-browsing.md))                                                 |
| Check-in button     | `Button` primary / normal with `status-positive` icon                                         | [F02](functional/F02-check-in.md)                                                                                    |
| Type                | `StatusIndicator` success / warning                                                           |                                                                                                                      |
| Progress chart      | `Container` + `MixedLineBarChart` (time x scale, linear y scale)                              | [F05](functional/F05-statistics-chart.md)                                                                            |
| Settings            | `SplitPanel` + `FormField` + `Select` / `Toggle` + `Link`                                     | [F10](functional/F10-settings.md)                                                                                    |
| Dialogs             | `Modal` with footer buttons right-aligned (`Box float="right"`)                               | Participant, confirmation, event name, changelog, draw                                                               |
| Participant form    | `Form`, `FormField` (constraint and error texts), `Input`, `Toggle`                           | [F03](functional/F03-participant-management.md)                                                                      |

Dialog footers: a **link** button for cancel/close on the left, then the action buttons; the main action is **primary**.

## Visual rules

- Theme: Cloudscape light or dark mode, applied globally (`applyMode`).
- Absent rows: cells at 40 % opacity; the check-in button additionally ignores pointer events.
- Clickable name cells show a pointer cursor (default cursor for absent participants).
- Page: `overscroll-behavior: none` on `html` and `body` (no pull-to-refresh bounce on tablets).
- Accent colors: blue `#0972d3` (light mode), `#539fe5` (dark mode, where custom CSS needs it — detected with the `awsui-dark-mode` class set by Cloudscape); green `#67a353` for the checked-in chart series.

## Random draw dialog

The only screen with custom styling. Size `max`.

```
┌──────────────────────────── Random draw ──────────────────────────── ✕ ┐
│                                                                          │
│                      Jean-Pierre MARTIN          (small, faded)          │
│          ────────────────────────────────────────────────────            │
│                    LÉA   DURAND   (large, accent when stopped)           │
│          ────────────────────────────────────────────────────            │
│                        Marie DUPONT              (small, faded)          │
│                                                                          │
│                  Drawn among 42 checked-in participants                  │
├──────────────────────────────────────────────────────────────────────────┤
│                                               Close   [⟳ Draw again]     │
└──────────────────────────────────────────────────────────────────────────┘
```

| Element           | Specification                                                                                                                                                                                                                                                                                                    |
| ----------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Stage             | Vertical flex, centred, gap 24 px, padding 48 px top / 24 px bottom.                                                                                                                                                                                                                                             |
| Reel window       | Full width, height = 3 × row height. Container query context (`container-type: inline-size`).                                                                                                                                                                                                                    |
| Maximum name size | `--row-font: clamp(1.75rem, 5vw, 4rem)`; row height = 1.5 × `--row-font`.                                                                                                                                                                                                                                        |
| Fitted size       | Centre size = `min(1.3 × --row-font, 100cqw × 0.86 / (longest × 0.68))`, where `longest` = max(10, length of the longest name of the reel); side size = centre size / 1.3.                                                                                                                                       |
| Layers            | Two identical, synchronized copies of the strip stacked on the window: **side layer** (30 % opacity, masked out in the centre row, fading to transparent at the top and bottom edges) and **centre layer** (clipped to the centre row, larger font). Only the centre layer is exposed to assistive technologies. |
| Rows              | Height = row height, single line, no wrap, bold (700), centred.                                                                                                                                                                                                                                                  |
| Frame             | Two 2 px accent lines at 1 and 2 row heights from the top, 10 % inset on each side, above the text.                                                                                                                                                                                                              |
| Scroll animation  | `translateY(0)` → `translateY(-(winnerIndex − 1) × row height)`, duration = setting, `cubic-bezier(0.15, 0.6, 0.2, 1)`, fill mode both.                                                                                                                                                                          |
| Winner            | Accent color (0.3 s transition), pop animation 0.6 s ease-out (scale 1 → 1.15 at 30 % → 0.94 at 55 % → 1.04 at 80 % → 1); frame lines pulse (scaleX 1.08, scaleY 2 at 30 %).                                                                                                                                     |
| Status line       | Secondary text, centred, below the reel.                                                                                                                                                                                                                                                                         |

## Interaction rules

- Every destructive or hard-to-undo action asks for confirmation: import over a list, check-out, reset, export ([F11](functional/F11-notifications-confirmations.md)).
- Check-in is a single tap, never confirmed.
- Dialogs with a text input focus it on opening; **Enter** submits.
- Everything MUST remain usable on a 10" tablet in portrait (CSS viewport about 800 × 1280) and landscape, on phones and on desktops.
