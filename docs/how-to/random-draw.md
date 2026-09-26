# Draw a Random Participant

This guide shows how to pick a participant at random, for example for a prize draw at the end of the event.

## Who can be drawn

Only participants who are **checked in** and **not marked as absent** can be drawn. Both registered (imported) and manually added participants are included.

The **Random draw** button is disabled when no participant meets these conditions; hovering it explains why.

## Steps

1. Click **Random draw**, next to **Add Participant** above the participants table.
2. A dialog opens and participant names scroll on a reel, slot-machine style, for a few seconds (4 seconds by default). Each eligible participant appears at most once on the reel. Names are small and faded above and below the framed centre row, and grow larger as they pass through it. The reel slows down progressively.
3. The reel stops on the winner, in the framed centre row: their first name and last name (in capitals) are highlighted with a short zoom-in/zoom-out "pop", readable on a tablet from a distance, while the names above and below fade out. The number of participants the winner was drawn from is shown below. Names are always displayed in full, all with the same font size: the size is the largest that lets the longest name of the reel fit in the dialog.
4. Click **Draw again** to run a new draw, or **Close** to close the dialog.

Each draw is independent: the same participant can be drawn again. To exclude a winner from the next draws, mark them as absent (via the `…` button in their row) before drawing again.

## Change the animation duration

1. Open the **Settings** panel.
2. Under **Draw animation duration**, choose _No animation_, 1, 2, 3, 4, 5 or 10 seconds.

With _No animation_, the winner is displayed immediately. The setting is saved with the other preferences.

If the device is set to reduce motion (accessibility setting), the reel does not scroll: it stays hidden, then the result is shown after the configured duration.

## Fairness

The winner is picked with the browser's cryptographic random number generator (`crypto.getRandomValues`), so every eligible participant has the same chance. The other names on the reel are eligible participants shuffled at random; they are decorative and do not influence the result.
