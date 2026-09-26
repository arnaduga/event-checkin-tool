# 10 — Quality and Testing

## Quality gates

| ID    | Gate                                                     | Command                |
| ----- | -------------------------------------------------------- | ---------------------- |
| QA-01 | ESLint reports no error and no warning                   | `npm run lint`         |
| QA-02 | All files are formatted with Prettier                    | `npm run format:check` |
| QA-03 | All tests pass                                           | `npm test`             |
| QA-04 | Production build succeeds (output contains `✓ built in`) | `npm run build`        |
| QA-05 | No known vulnerability                                   | `npm audit`            |

`npm run check` runs QA-01 to QA-03. CI runs QA-01 to QA-04 and blocks the deployment on any failure.

Lint rules of note: React Hooks rules including the React Compiler rules — no synchronous `setState` in effects (use lazy state initializers or event handlers), no impure calls (`Date.now`, `Math.random`) during render (produce ids and random values in handlers through `lib/` helpers).

## Test strategy

| Level       | Scope                                                             | Tools                                         | Location                   |
| ----------- | ----------------------------------------------------------------- | --------------------------------------------- | -------------------------- |
| Unit        | Every pure function of `lib/participants.js` and `lib/storage.js` | Vitest                                        | `src/lib/*.test.js`        |
| Consistency | Translation tables                                                | Vitest                                        | `src/translations.test.js` |
| Integration | The whole application rendered in jsdom, driven like a user       | Vitest, Testing Library, user-event, jest-dom | `src/App.test.jsx`         |

Test setup (`src/test/setup.js`): jest-dom matchers, `cleanup()` and `localStorage.clear()` after each test, polyfills for `window.matchMedia` and `ResizeObserver` (used by Cloudscape, missing in jsdom).

Integration testing rules:

- Seed state through `localStorage` (settings with English language, participants) before rendering.
- Generate Excel files in memory with SheetJS (`XLSX.write(..., { type: 'array' })`) and upload them to the hidden file input.
- Cloudscape keeps every modal in the DOM (including the changelog, whose text contains sample names): locate a dialog by its own content and table cells inside `table tbody`, never with global text queries.
- Use fake timers (`vi.useFakeTimers({ shouldAdvanceTime: true })`) for draw durations.
- Assert on persisted `localStorage` content as well as on the screen.

## Mandatory test cases

Each acceptance criterion of the functional documents MUST have an automated test. The minimum set:

**Unit**

- `normalizeName`: every example of the [normalization table](functional/F01-import.md#name-normalization), empty values, numbers.
- `toLocale`: standard codes and the Klingon fallback.
- `parseParticipantRows`: French and English headers, trimming of emails, rows with only one name kept, rows without names skipped with count, unrecognized columns.
- `findDuplicates`: same name different case, same email different case, empty emails ignored, clean list; `formatNames` truncation.
- `filterParticipants`: each status, search on each field, combination.
- `sortParticipants`: text case-insensitive both directions, status and type, input not mutated.
- `computeStats`, `computeProgressSeries` (null case and [AC-STA-02](functional/F05-statistics-chart.md)).
- `buildExportRows` (headers order, localized values, dashes), `buildExportFileName` (sanitization, no event name).
- `createId` format and uniqueness.
- `getDrawEligible`, `secureRandom` range, `pickRandom` (empty, index mapping, every item reachable), `shuffle` (permutation, no mutation), `buildReel` (uniqueness, winner position, limited by eligible count, placeholders, length 3), `reelLength` bounds.
- Storage helpers: round trip, missing key, invalid JSON, storage throwing.
- Translations: same keys as `en_US` in every language, no empty values except the two check-out fragments.

**Integration**

- Empty state; restore from storage and check in; check-out confirmation (confirm and cancel); absent participant name click ignored.
- Import: success with skipped rows and duplicates warnings and event name from file; no recognized columns keeps the list.
- Manual addition with normalization, checked in by default.
- Stored status filter restored.
- Reset check-ins only; full reset removes the storage key.
- Random draw: button disabled without eligible participant; only eligible participants drawn; draw again; reel duration respected with fake timers.

A test SHOULD be verified to fail when the behaviour it protects is removed (mutation check) for critical rules (absent protection, winner not revealed early).
