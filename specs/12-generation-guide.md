# 12 — Generation Guide

How to (re)generate the application from these specifications, typically with an LLM coding agent. Each step ends with its quality gates green before moving on.

## Inputs to give the generator

1. This whole `specs/` folder, including [`assets/translations.json`](assets/translations.json).
2. `CHANGELOG.md` (version history, displayed in the app).
3. Binary assets that cannot be generated: `favicon.ico`, `template_attendees.xlsx`.

## Generation order

| Step | Goal                                 | Main references                                                                                                                          | Done when                                                                            |
| ---- | ------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| 1    | Project skeleton and tooling         | [Stack](07-technical-stack.md), [Build](11-build-release-deployment.md), [Quality](10-quality-and-testing.md)                            | `npm run check` and `npm run build` pass on an empty app                             |
| 2    | Changelog pipeline                   | [Architecture — changelog pipeline](08-architecture.md#changelog-pipeline)                                                               | `src/changelog.js` generated, version in `package.json`                              |
| 3    | Storage helpers and pure logic       | [Architecture — pure functions](08-architecture.md#pure-functions-srclibparticipantsjs), [Data model](03-data-model.md), functional docs | Unit tests of [mandatory cases](10-quality-and-testing.md#mandatory-test-cases) pass |
| 4    | Translations                         | [i18n](05-i18n.md), `assets/translations.json`                                                                                           | Translation consistency test passes                                                  |
| 5    | Shell, statistics, table, check-in   | [UI](04-ui-specification.md), F02, F04, F05, F09, F10                                                                                    | Integration tests for check-in / check-out / filter pass                             |
| 6    | Import, export, reset, confirmations | F01, F06, F07, F11                                                                                                                       | Import / reset integration tests pass                                                |
| 7    | Participant dialog                   | F03                                                                                                                                      | Add / edit / absent tests pass                                                       |
| 8    | Random draw                          | F08, [UI — draw dialog](04-ui-specification.md#random-draw-dialog), [ADR-08, ADR-09](09-constraints-and-decisions.md)                    | Draw tests pass; visual check on a tablet viewport                                   |
| 9    | PWA and deployment                   | [NFR-OFF](06-non-functional-requirements.md), [Deployment](11-build-release-deployment.md)                                               | Offline reload works in the browser; CI workflow green                               |
| 10   | Documentation                        | `docs/` (Diátaxis: how-to, reference, explanation)                                                                                       | Docs describe the generated behaviour                                                |

## Prompt template

```text
You are implementing the Event Check-in Tool from its specifications in specs/.
Read specs/README.md first, then the documents referenced by step <N> of
specs/12-generation-guide.md. Implement only that step.

Rules:
- Requirements marked MUST are mandatory; follow IDs and acceptance criteria exactly.
- Use only the libraries listed in specs/07-technical-stack.md.
- Every user-facing text comes from src/translations.js, built from specs/assets/translations.json.
- Write tests for every acceptance criterion touched by this step.
- Code, comments and docs in English. Match the Prettier and ESLint configuration.
- Finish by running `npm run check` and `npm run build`; report their output.
```

## Final acceptance checklist

- [ ] All quality gates pass ([QA-01 to QA-05](10-quality-and-testing.md#quality-gates)).
- [ ] Every acceptance criterion (`AC-*`) of `specs/functional/` is covered by a passing test.
- [ ] The app loads, then works after disabling the network and reloading.
- [ ] On an 800 × 1280 viewport: table usable, draw dialog readable, names never truncated.
- [ ] Switching languages updates every text, including the status filter and export headers.
- [ ] Data written by the previous version is read correctly.
