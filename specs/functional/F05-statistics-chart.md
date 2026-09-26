# F05 — Statistics and Progress Chart

## User story

> As an organizer, I want to see how many people have arrived and how arrivals progress over time.

## Statistics panel

Displayed at the top of the page, below the panel header (event name and Import / Reset / Export buttons).

| ID        | Counter (label key) | Value                                | Style                 |
| --------- | ------------------- | ------------------------------------ | --------------------- |
| FR-STA-01 | `statsTotal`        | Number of participants               | Default               |
| FR-STA-02 | `statsCheckedIn`    | Participants checked in              | Success color (green) |
| FR-STA-03 | `statsPending`      | Total − checked in (absent included) | Inactive color (grey) |
| FR-STA-04 | `statsManual`       | Participants of type _Manual_        | Default               |

- **FR-STA-05** — Counters MUST be displayed side by side, each with a small label and a large value, and MUST update immediately after any change.

## Progress chart

| ID        | Requirement                                                                                                                                                                                        |
| --------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| FR-STA-06 | Below the participants table, a container titled `chartTitle` MUST show a line chart, **only when at least one participant is checked in with a check-in time**.                                   |
| FR-STA-07 | X axis: time (`chartXTitle`), ticks formatted as hours and minutes (2 digits each) in the current locale. Y axis: number of participants (`chartYTitle`), linear. Height 300 px. No series filter. |
| FR-STA-08 | Series **Checked in** (`chartCheckedIn`, green `#67a353`): one point per check-in, sorted by time; point _i_ (1-based) has y = _i_ (cumulative count).                                             |
| FR-STA-09 | Series **Expected** (`chartExpected`, blue `#0972d3`), computed as follows.                                                                                                                        |

Expected series algorithm:

1. `start` = earliest check-in time, `end` = latest check-in time.
2. `total` = number of registered participants + number of manual participants **without** check-in time.
3. First point: (`start`, `total`).
4. For each manual participant **with** a check-in time, in time order, if that time ≥ `start`: `total += 1`, add point (time, `total`).
5. If `end` > `start`: add a last point (`end`, `total`).

(Manual participants are approximated as "added" at their check-in time.)

The chart's accessibility texts use `chartDismiss`, `chartLegend` and `chartRoleDescription`.

## Acceptance criteria

- **AC-STA-01** — _Given_ 3 participants of which 2 are checked in and 1 is manual, _then_ counters show Total 3, Checked In 2, Pending 1, Manual Additions 1.
- **AC-STA-02** — _Given_ registered participants checked in at 09:00 and 09:10, one registered not checked in, and a manual participant checked in at 09:05, _then_ the checked-in series is 1, 2, 3 at 09:00, 09:05, 09:10 and the expected series is 3 at 09:00, 4 at 09:05, 4 at 09:10.
- **AC-STA-03** — _Given_ nobody is checked in, _then_ no chart is displayed.
