# 00 — Product Vision

## Purpose

The Event Check-in Tool lets event staff **record the arrival of participants** at an event, from a list of registered people, on a tablet, phone or laptop — **without any server and without depending on network connectivity**.

It replaces a printed attendance list: staff import the registration list, tick people as they arrive, add walk-ins, follow attendance in real time, export the result, and can run a prize draw among the people present.

## Users

| User                | Description                                                                        | Main goals                                                         |
| ------------------- | ---------------------------------------------------------------------------------- | ------------------------------------------------------------------ |
| **Check-in staff**  | Volunteer or staff member at the entrance, often on a tablet held in one hand      | Find a person fast, check them in with one tap, avoid mistakes     |
| **Event organizer** | Prepares the list before the event, follows attendance, exploits results afterward | Import the registration export, see statistics, export the results |
| **Host / MC**       | Person running a prize draw on stage, showing the tablet to the audience           | Run a fair, visual random draw among present participants          |

Users are not technical. The interface must be self-explanatory and forgiving (confirmation before destructive actions).

## Context of use

- Events of a few dozen to a few hundred participants (associations, clubs, meetups). The sample data has ~80 participants.
- Entrance desks where **network access is unreliable or absent**: the application must keep working offline, including after a page reload.
- **One device per event** in the typical case. There is no synchronization between devices.
- Mainly used on **tablets** (e.g. 10" Android tablet, portrait or landscape), also on phones and laptops.
- The interface is used in **French** by default; other languages are available.

## Main capabilities

1. Import a participant list from an Excel file exported by a registration platform ([F01](functional/F01-import.md)).
2. Check participants in and out, with protection against accidental check-out ([F02](functional/F02-check-in.md)).
3. Add walk-in participants, edit participants, mark participants as absent ([F03](functional/F03-participant-management.md)).
4. Search, filter, sort and paginate the list ([F04](functional/F04-browsing.md)).
5. Follow statistics and a check-in progress chart ([F05](functional/F05-statistics-chart.md)).
6. Export the list with check-in status to Excel ([F06](functional/F06-export.md)).
7. Reset check-ins (to reuse a list) or everything ([F07](functional/F07-reset.md)).
8. Run a random draw among present participants, with a slot-machine animation ([F08](functional/F08-random-draw.md)).
9. Name the event ([F09](functional/F09-event-name.md)) and configure language, theme and draw animation ([F10](functional/F10-settings.md)).

## Success criteria

- Checking in a participant found in the list takes **one tap**.
- Undoing a check-in by mistake is **impossible without an explicit confirmation**.
- Closing the browser, reloading the page or losing the network **never loses data** on the device.
- The draw result is readable **from several meters away** on a tablet.

## Non-goals

The following are explicitly out of scope:

- Multi-device synchronization, shared lists, real-time collaboration.
- User accounts, authentication, roles.
- Server-side storage, backups, analytics, any network call after the application is loaded.
- Online registration, payment, ticketing, QR code / badge scanning.
- Sending emails or messages to participants.
- Editing arbitrary participant attributes beyond first name, last name, email, check-in and absent status.
