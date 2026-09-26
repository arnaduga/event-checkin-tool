# Event Check-in Tool — Specifications

This folder is the **specification** of the Event Check-in Tool. It is written so that a developer — or an LLM — can (re)generate the application from it, without reading the existing source code.

It was produced by retro-specification of version **1.5.0** and is meant to become the source of truth for future changes (spec-driven development): a change is first described here, then implemented.

## Reading order

| #   | Document                                                         | Content                                                             |
| --- | ---------------------------------------------------------------- | ------------------------------------------------------------------- |
| 00  | [Product vision](00-product-vision.md)                           | Purpose, users, context of use, scope and non-goals                 |
| 01  | [Glossary](01-glossary.md)                                       | Domain vocabulary used in all documents                             |
| 02  | [Functional requirements](functional/)                           | One document per feature, with requirements and acceptance criteria |
| 03  | [Data model](03-data-model.md)                                   | Entities, persisted data, file formats                              |
| 04  | [UI specification](04-ui-specification.md)                       | Layout, components, interactions, visual rules                      |
| 05  | [Internationalization](05-i18n.md)                               | Languages, locale rules, complete text catalogue                    |
| 06  | [Non-functional requirements](06-non-functional-requirements.md) | Offline, performance, accessibility, security, privacy…             |
| 07  | [Technical stack](07-technical-stack.md)                         | Runtime, libraries, versions, tooling                               |
| 08  | [Architecture](08-architecture.md)                               | Modules, state management, algorithms                               |
| 09  | [Constraints and decisions](09-constraints-and-decisions.md)     | Imposed constraints and architecture decision records               |
| 10  | [Quality and testing](10-quality-and-testing.md)                 | Lint, formatting, test strategy, mandatory test cases               |
| 11  | [Build, release and deployment](11-build-release-deployment.md)  | Scripts, versioning, CI/CD, rollback                                |
| 12  | [Generation guide](12-generation-guide.md)                       | How to generate the application from these specs, step by step      |

Functional documents:

| ID  | Feature                                                                                |
| --- | -------------------------------------------------------------------------------------- |
| F01 | [Participant list import](functional/F01-import.md)                                    |
| F02 | [Check-in and check-out](functional/F02-check-in.md)                                   |
| F03 | [Participant management (add, edit, absent)](functional/F03-participant-management.md) |
| F04 | [Browsing: table, search, filter, sort, pagination](functional/F04-browsing.md)        |
| F05 | [Statistics and progress chart](functional/F05-statistics-chart.md)                    |
| F06 | [Excel export](functional/F06-export.md)                                               |
| F07 | [Reset](functional/F07-reset.md)                                                       |
| F08 | [Random draw](functional/F08-random-draw.md)                                           |
| F09 | [Event name](functional/F09-event-name.md)                                             |
| F10 | [Settings, about and changelog](functional/F10-settings.md)                            |
| F11 | [Notifications and confirmations](functional/F11-notifications-confirmations.md)       |

## Conventions

- **Requirement keywords** follow [RFC 2119](https://www.rfc-editor.org/rfc/rfc2119): **MUST** (mandatory), **SHOULD** (recommended, deviations must be justified), **MAY** (optional).
- **Requirement IDs** are stable and never reused: `FR-<AREA>-<NN>` for functional requirements, `NFR-<AREA>-<NN>` for non-functional ones, `C-<NN>` for constraints, `ADR-<NN>` for decisions. Code comments, tests and commits MAY reference them.
- **Acceptance criteria** use the _Given / When / Then_ form. Each one SHOULD be covered by an automated test.
- **Texts shown to users** are referenced by their translation key in `code` font (e.g. `importSuccess`); the actual wording is in the [text catalogue](05-i18n.md#text-catalogue). Examples in these documents use the English wording.
- Documentation, code comments and user-facing texts in the source language are written in **English**.

## Changing the specifications

1. Describe the change in the relevant documents (new or updated requirements, acceptance criteria, data model, texts).
2. Keep IDs stable: deprecate a requirement (mark it ~~struck~~ with a note) instead of renumbering.
3. Implement, then check that every acceptance criterion is covered by a test.
4. Record the user-visible change in `CHANGELOG.md` (see [Build, release and deployment](11-build-release-deployment.md)).
