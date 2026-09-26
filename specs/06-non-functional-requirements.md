# 06 — Non-Functional Requirements

## Availability and offline operation

| ID         | Requirement                                                                                                                                                                                                                                                       |
| ---------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| NFR-OFF-01 | After a first visit with network, the application MUST work **entirely offline**, including a full page reload and a browser restart.                                                                                                                             |
| NFR-OFF-02 | This MUST be achieved with a service worker (PWA) that pre-caches all built assets (`js`, `css`, `html`, `ico`, `png`, `svg`, `woff`, `woff2`), with a maximum cached file size of at least 5 MB (the main bundle exceeds the 2 MB default).                      |
| NFR-OFF-03 | New versions MUST be installed automatically (`autoUpdate`): a device gets the new version at its next load with network, without user action.                                                                                                                    |
| NFR-OFF-04 | A web app manifest MUST allow installation on the home screen: name "Event Check-in", short name "Check-in", description "Event participant check-in management", theme color `#0972d3`, background `#ffffff`, display `standalone`, icon `/favicon.ico` (48×48). |
| NFR-OFF-05 | The application code MUST NOT make any network request after loading (no API, analytics, fonts or CDN at runtime). Only the service worker's own update checks and user-initiated navigation (e.g. the GitHub link) reach the network.                            |

## Data durability and privacy

| ID         | Requirement                                                                                                                                                                                                  |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| NFR-DAT-01 | Every change MUST be persisted immediately to local storage; there is no "save" action. Reloading or closing the page MUST NOT lose data.                                                                    |
| NFR-DAT-02 | Participant data (names, emails) MUST stay on the device: never sent to any server, never placed in URLs.                                                                                                    |
| NFR-DAT-03 | If local storage is unavailable or full, the application MUST keep working for the current session and log the error to the console (see [data model](03-data-model.md)).                                    |
| NFR-DAT-04 | Stored data MUST remain compatible across versions (older data readable, unknown fields ignored), so that rolling back to a previous version keeps the data (see [release](11-build-release-deployment.md)). |

## Performance

> The targets below are **not yet measured**: they describe the expected behaviour and SHOULD be verified with a benchmark (e.g. an import of 1,000 generated rows) before being relied upon.

| ID         | Requirement                                                                                                                                                                       |
| ---------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| NFR-PRF-01 | The application MUST remain fluid with at least **1,000 participants** on a mid-range tablet: check-in, search and filter reflect in the UI without perceptible delay (< 100 ms). |
| NFR-PRF-02 | Importing a file of 1,000 rows SHOULD complete in under 2 seconds.                                                                                                                |
| NFR-PRF-03 | Derived data (filtered/sorted list, statistics, chart series, eligible participants) SHOULD be memoized on their inputs.                                                          |
| NFR-PRF-04 | Draw animations MUST only animate `transform` and `opacity` (GPU-friendly), never layout properties.                                                                              |

## Usability and accessibility

| ID          | Requirement                                                                                                                                                              |
| ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| NFR-UX-01   | Main actions MUST be reachable with one tap; touch targets use design system sizes.                                                                                      |
| NFR-UX-02   | Destructive actions MUST be confirmed ([F11](functional/F11-notifications-confirmations.md)); check-out MUST NOT rely on double-tap (mobile zoom).                       |
| NFR-UX-03   | The layout MUST work from phone width (360 px) to desktop, and in particular on a 10" tablet in portrait (≈ 800 × 1280 CSS px) and landscape. No horizontal page scroll. |
| NFR-UX-04   | The draw result MUST be readable from several meters on a tablet (large bold type, high contrast, full name never truncated).                                            |
| NFR-A11Y-01 | Components MUST come from the design system (keyboard navigation, focus management, ARIA roles).                                                                         |
| NFR-A11Y-02 | Forms MUST expose labels, constraint texts and inline errors; dialogs focus their first input.                                                                           |
| NFR-A11Y-03 | Animations MUST honour `prefers-reduced-motion: reduce` (no motion, and never reveal a draw result early).                                                               |
| NFR-A11Y-04 | The draw result MUST be announced through an `aria-live="polite"` region; decorative duplicate content MUST be hidden from assistive technologies.                       |
| NFR-A11Y-05 | Custom colors MUST keep sufficient contrast in light and dark modes.                                                                                                     |

## Security

| ID         | Requirement                                                                                                                                                                          |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| NFR-SEC-01 | Imported files are untrusted input. The spreadsheet library MUST be a version without known vulnerabilities (SheetJS ≥ 0.20.3; 0.18.5 has prototype pollution and ReDoS advisories). |
| NFR-SEC-02 | `npm audit` MUST report no known vulnerability at release time.                                                                                                                      |
| NFR-SEC-03 | No dynamic code evaluation, no `dangerouslySetInnerHTML`. Markdown (changelog) is rendered by a library that does not render raw HTML.                                               |
| NFR-SEC-04 | Random draws MUST use a cryptographically secure generator (`crypto.getRandomValues`) so that results cannot be predicted or biased.                                                 |

## Compatibility

| ID         | Requirement                                                                                                                                                                                 |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| NFR-CMP-01 | Supported browsers: current versions of Chrome / Edge, Safari (iOS and macOS), Firefox, Samsung Internet. Required features: service workers, Web Crypto, CSS container queries, CSS masks. |
| NFR-CMP-02 | Internet Explorer and legacy browsers are not supported.                                                                                                                                    |

## Maintainability

| ID         | Requirement                                                                                                                         |
| ---------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| NFR-MNT-01 | Business logic MUST be implemented as pure functions, independent from React, and unit tested ([architecture](08-architecture.md)). |
| NFR-MNT-02 | Lint, formatting and tests MUST pass before any deployment ([quality](10-quality-and-testing.md)).                                  |
| NFR-MNT-03 | Code, comments and documentation are written in English.                                                                            |
