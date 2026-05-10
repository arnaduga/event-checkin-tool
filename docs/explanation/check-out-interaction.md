# Why Check-Out Requires a Double Interaction

## The problem

On a mobile device, the check-in and check-out actions both live on the same button in the Actions column. A single tap checks in; a single tap on the same button (now labelled "Checked In") would check out.

In practice, event staff using the application on a phone frequently trigger accidental check-outs. A misplaced tap — caused by screen glare, a jostled hand, or simply the smaller touch targets on a phone — immediately undoes a check-in with no confirmation dialog and no undo.

## The design decision

Check-out (unchecking a participant) requires a **double interaction**:

- **Desktop:** double-click the ✓ Checked In button
- **Touch screen:** double-tap the ✓ Checked In button within 350 ms

A single click or tap on the checked-in button does nothing. This makes check-out a deliberate action, not an accidental one.

## Why not a confirmation dialog?

A confirmation dialog would also prevent accidental check-outs, but at significant cost: every intentional check-out requires two interactions (click + confirm), adding friction to the main workflow. During a busy event with a queue of arrivals, that added step matters.

Double-click/double-tap achieves the same protection with the same interaction count, and the gesture is already a familiar convention for "I really mean this."

## Why not long-press?

Long-press was considered and prototyped first. It works on touch but introduces a problem on desktop: there is no standard long-press on a mouse, and the implementation required replacing Cloudscape's `Button` component with a native `<button>` element anyway (because Cloudscape's `Button` intercepts `mousedown`/`mouseup` events internally). The double-click approach was simpler, worked natively on both platforms, and required only `onDoubleClick` on desktop and a manual timestamp check on `onTouchEnd` for touch.

## Touch-specific implementation note

The `dblclick` DOM event does not fire on touch devices. The double-tap is detected manually: `onTouchEnd` records a timestamp on each tap and checks whether the interval since the previous tap is under 350 ms. When the second tap is detected, `e.preventDefault()` is called to suppress the synthetic `click` event that browsers fire after `touchend` — without this, the "Check In" button that replaces the checked-out button would immediately re-fire and re-check the participant in.
