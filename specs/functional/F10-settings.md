# F10 — Settings, About and Changelog

## User story

> As a user, I want to choose the language and theme, and see which version I am using and what changed.

## Settings panel

| ID        | Requirement                                                                                                                                                                                                                                                                                                                             |
| --------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| FR-SET-01 | Settings MUST be in a split panel titled `settingsTitle`, closed by default, opened with the panel's toggle at the edge of the window. It MUST be displayable on the side (default) or at the bottom and resizable (default size 300 px); position and size MUST be persisted.                                                          |
| FR-SET-02 | **Language** (`language`): dropdown with, in this order: English (US) `en_US`, Français (FR) `fr_FR`, Español (ES) `es_ES`, Italiano (IT) `it_IT`, tlhIngan Hol `tlh_TLH`. Default: **Français (FR)**. Changing it MUST update the whole interface immediately. See [i18n](../05-i18n.md).                                              |
| FR-SET-03 | **Dark mode** (`darkMode`): toggle whose text is `toggleOn` / `toggleOff`. Default: the operating system preference (`prefers-color-scheme: dark`) at first launch. It MUST switch the whole design system theme.                                                                                                                       |
| FR-SET-04 | **Draw animation duration**: see [F08](F08-random-draw.md) (FR-DRW-25, FR-DRW-26).                                                                                                                                                                                                                                                      |
| FR-SET-05 | At the bottom of the panel, centred: a link `footerGithub` to `https://github.com/arnaduga/event-checkin-tool` (opens in a new tab, external icon) and a link `v<version>` opening the changelog dialog; below, in small secondary text, `lastLoad`: the date and time of the **current page load**, formatted with the current locale. |
| FR-SET-06 | All settings (language, dark mode, event name, page size, status filter, panel layout, draw duration) MUST be persisted on every change and restored at startup **before the first render** (no flash of default values).                                                                                                               |

## Changelog dialog

| ID        | Requirement                                                                                                                                                                                                                                                                                             |
| --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| FR-SET-07 | The version link MUST open a large dialog titled "Changelog" rendering the project's `CHANGELOG.md` (without its first-level title) as Markdown.                                                                                                                                                        |
| FR-SET-08 | Third-level headings (change types) MUST be rendered as rounded uppercase badges, colored by type: Added (bg `#d4edda`, text `#1a5c2a`), Changed (`#d0e8ff` / `#0a4a8a`), Fixed (`#fde8d0` / `#7a3010`), Removed (`#fdd` / `#8b0000`), Deprecated (`#fff3cd` / `#6b4c00`), others (`#e8e8e8` / `#333`). |
| FR-SET-09 | The displayed version MUST be the latest version of `CHANGELOG.md` (see [build](../11-build-release-deployment.md)).                                                                                                                                                                                    |

## Acceptance criteria

- **AC-SET-01** — _Given_ no stored settings, _then_ the interface is in French and follows the system theme.
- **AC-SET-02** — _Given_ I switch to English and reload, _then_ the interface is in English.
