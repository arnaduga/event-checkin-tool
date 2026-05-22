# Why Check-Out Requires a Confirmation Dialog

## The problem

On a mobile device, the check-in and check-out actions both live on the same button in the Actions column. A single tap checks in; a single tap on the same button (now labelled "Checked In") would check out.

In practice, event staff using the application on a phone frequently trigger accidental check-outs. A misplaced tap — caused by screen glare, a jostled hand, or simply the smaller touch targets on a phone — immediately undoes a check-in with no confirmation and no undo.

An earlier implementation used a double-click/double-tap gesture to guard against accidental check-outs. While this avoided accidental unchecks, it caused mobile browsers to zoom in on the double-tap, making the experience awkward.

## The design decision

Check-out (unchecking a participant) now requires a **single click followed by a confirmation dialog**:

1. Click (or tap) the "Checked In" button.
2. A modal dialog asks: "Mark this participant as not checked in?"
3. Confirm to proceed, or cancel to leave the participant checked in.

A confirmation dialog is the appropriate guard here: it works identically on desktop and touch, requires no gesture timing, and does not trigger browser zoom on mobile. The extra step is acceptable because check-out is an infrequent, deliberate action — not part of the high-volume check-in flow.

## Why not double-click/double-tap?

The previous double-click/double-tap approach worked but caused mobile browsers to interpret the double-tap as a zoom gesture, disrupting the display during busy events. The confirmation dialog provides the same accidental-action protection with a simpler, cross-platform interaction model.
