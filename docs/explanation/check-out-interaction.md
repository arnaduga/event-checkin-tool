# Why Check-Out Requires a Confirmation Dialog

## The problem

On a mobile device, the check-in and check-out actions both live on the same button in the first column of the table. A single tap checks in; a single tap on the same button (now labelled **Done**) would check out.

In practice, event staff using the application on a phone frequently trigger accidental check-outs. A misplaced tap — caused by screen glare, a jostled hand, or simply the smaller touch targets on a phone — would immediately undo a check-in with no confirmation and no undo.

## The design decision

Check-out (unchecking a participant) requires a **single click followed by a confirmation dialog**:

1. Click (or tap) the **Done** button, or the participant's name.
2. A modal dialog asks: "Mark **First Last** as not checked in?" — the participant's name is shown so staff can verify they picked the right row.
3. Confirm to proceed, or cancel to leave the participant checked in.

A confirmation dialog is the appropriate guard here: it works identically on desktop and touch, requires no gesture timing, and does not trigger browser zoom on mobile. The extra step is acceptable because check-out is an infrequent, deliberate action — not part of the high-volume check-in flow.

Check-in, on the other hand, stays a single click with no confirmation, to keep the arrival flow as fast as possible.

## Why not double-click/double-tap?

Version 1.1.0 used a double-click/double-tap gesture to guard against accidental check-outs. While this avoided accidental unchecks, mobile browsers interpreted the double-tap as a zoom gesture, disrupting the display during busy events. Version 1.3.1 replaced it with the confirmation dialog, which provides the same protection with a simpler, cross-platform interaction model.
