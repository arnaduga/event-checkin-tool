# F08 — Random Draw

## User story

> As a host, I want to draw a participant at random among the people present, with a visual animation shown on a tablet to the audience, so that the prize draw is fun and visibly fair.

## Eligibility and fairness

| ID        | Requirement                                                                                                                                                                                                                                                           |
| --------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| FR-DRW-01 | Only **eligible** participants can be drawn: checked in **and** not absent. Registered and manual participants are both eligible.                                                                                                                                     |
| FR-DRW-02 | The winner MUST be picked uniformly among eligible participants using the Web Crypto API (`crypto.getRandomValues`): a 32-bit random integer divided by 2³² gives a number in [0, 1), multiplied by the number of eligible participants and floored to get the index. |
| FR-DRW-03 | Each draw is independent: a previous winner can be drawn again (to exclude them, staff mark them absent).                                                                                                                                                             |
| FR-DRW-04 | The winner MUST be chosen **before** the animation starts; the animation only reveals it. Names shown on the reel besides the winner are decorative.                                                                                                                  |

## Button

| ID        | Requirement                                                                                                                            |
| --------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| FR-DRW-05 | A **Random draw** button (`drawButton`, ticket icon) MUST be placed in the participants table header, right after **Add Participant**. |
| FR-DRW-06 | It MUST be disabled when there is no eligible participant, with an explanation shown on hover/focus (`drawNoEligible`).                |
| FR-DRW-07 | Clicking it MUST start a draw and open the draw dialog.                                                                                |

## Draw dialog

| ID        | Requirement                                                                                                                                                                      |
| --------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| FR-DRW-08 | The dialog MUST use the largest modal size (almost the full screen width), titled `drawTitle`, with footer buttons `close` (link) and `drawAgain` (primary, refresh icon).       |
| FR-DRW-09 | The dialog body MUST contain the **reel** and, below it, a status line: `drawRolling` while the reel scrolls, then `drawAmong` with `{count}` = number of eligible participants. |
| FR-DRW-10 | **Draw again** MUST run a new draw (new winner, new reel, animation replayed). It MUST be disabled while the reel scrolls and when no participant is eligible.                   |
| FR-DRW-11 | **Close**, the close icon or Escape MUST close the dialog and cancel a draw in progress (pending timer cleared).                                                                 |
| FR-DRW-12 | The dialog height MUST NOT change during a draw (no jump when the result appears).                                                                                               |

## Reel

The reel is a slot-machine style vertical strip of names seen through a window of **3 rows**. It scrolls upward, decelerates and stops with the winner in the **centre row**, with one name above and one below.

| ID        | Requirement                                                                                                                                                                                                                                                                                                                                                            |
| --------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| FR-DRW-13 | **Reel content**: the eligible participants other than the winner are shuffled (Fisher-Yates with the secure random generator) and each appears **at most once**. The reel is `[before…, winner, after]`: `after` is one shuffled participant, `before` holds the others, limited so that the reel has at most _reel length_ items.                                    |
| FR-DRW-14 | **Reel length** for an animation of _d_ seconds: `min(80, max(3, round(d × 15)))`. Without animation: 3 (one name before, the winner, one after).                                                                                                                                                                                                                      |
| FR-DRW-15 | When there are not enough other eligible participants, **empty placeholder rows** MUST complete the reel so that there is always one row before and one row after the winner (e.g. 1 eligible: `[empty, winner, empty]`; 2 eligible: `[empty, winner, other]`).                                                                                                        |
| FR-DRW-16 | Names are displayed as `<First name> <LAST NAME>` (last name upper-cased).                                                                                                                                                                                                                                                                                             |
| FR-DRW-17 | **Animation**: the strip scrolls from its first item to the position where the winner is in the centre row, over exactly the configured duration, with a strong ease-out (fast start, long deceleration; `cubic-bezier(0.15, 0.6, 0.2, 1)`). The result state starts when the duration has elapsed.                                                                    |
| FR-DRW-18 | **Magnifier effect, at all times** (while scrolling and once stopped): names in the centre row are displayed **1.3× larger** and fully opaque; names above and below are smaller and faded (30 % opacity), with an additional fade toward the top and bottom edges of the window. A name crossing the frame line is split (magnified part inside, faded part outside). |
| FR-DRW-19 | The centre row MUST be framed by two horizontal lines (accent color, full opacity, 80 % of the width).                                                                                                                                                                                                                                                                 |
| FR-DRW-20 | **Uniform font size**: all names of a reel MUST use the same font size, the largest that lets the **longest name of the reel** fit entirely in the centre row, capped by a maximum size. Names MUST never be truncated or wrapped. The row height is based on the maximum size and does not depend on the names.                                                       |
| FR-DRW-21 | **Result**: when the reel stops, the winner's name MUST turn to the accent color and play a short "pop" (zoom in/out: scale 1 → 1.15 → 0.94 → 1.04 → 1 over 0.6 s); the frame lines pulse at the same time.                                                                                                                                                            |
| FR-DRW-22 | **No animation** (duration 0): the dialog shows the stopped reel with the winner immediately.                                                                                                                                                                                                                                                                          |
| FR-DRW-23 | **Reduced motion** (operating system setting `prefers-reduced-motion: reduce`): the reel MUST NOT scroll and MUST stay hidden until the configured duration has elapsed, then show the stopped reel; the pop and pulse MUST be disabled. The winner MUST never be visible before the end of the duration.                                                              |
| FR-DRW-24 | The body MUST be an `aria-live="polite"` region so that assistive technologies announce the result.                                                                                                                                                                                                                                                                    |

## Duration setting

| ID        | Requirement                                                                                                                                                                                                           |
| --------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| FR-DRW-25 | The Settings panel MUST offer **Draw animation duration** (`drawDuration`, description `drawDurationDescription`) as a dropdown: `drawNoAnimation` (0), then 1, 2, 3, 4, 5 and 10 seconds (`drawSeconds`, `{count}`). |
| FR-DRW-26 | Default: **4 seconds**. The value MUST be persisted with the settings.                                                                                                                                                |

## Acceptance criteria

- **AC-DRW-01** — _Given_ Marie (not checked in), Jean (checked in, absent) and Anne Leroy (manual, checked in), _when_ I start a draw without animation, _then_ the result shows `Anne LEROY` and "Drawn among 1 checked-in participants".
- **AC-DRW-02** — _Given_ nobody is eligible, _then_ the Random draw button is disabled.
- **AC-DRW-03** — _Given_ a duration of 3 s, _when_ I start a draw, _then_ `Drawing…` is shown and no result is exposed at 2.9 s; at 3.1 s the winner is shown.
- **AC-DRW-04** — _Given_ 50 eligible participants and a reel length of 30, _then_ the reel has 30 distinct participants, the winner second to last.
- **AC-DRW-05** — _Given_ a single eligible participant, _then_ the reel is `[empty, winner, empty]`.
- **AC-DRW-06** — _Given_ the reel is scrolling, _then_ **Draw again** is disabled; once stopped, it runs a new draw.
