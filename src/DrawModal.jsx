import { Modal, Box, SpaceBetween, Button } from '@cloudscape-design/components';
import './DrawModal.css';

const fullName = (p) => (p.placeholder ? '' : `${p.firstName} ${p.lastName.toUpperCase()}`.trim());

// One copy of the scrolling strip. The reel stacks two synchronized copies: small faded
// names around the centre row, large names inside it (like a picker magnifier).
function Strip({ items, winnerIndex, steps, duration, rolling, layer }) {
  const isCentre = layer === 'centre';
  return (
    <div className={`draw-reel__layer draw-reel__layer--${layer}`} aria-hidden={!isCentre}>
      <div
        className={`draw-reel__strip${duration > 0 ? ' draw-reel__strip--animated' : ''}`}
        style={{ '--steps': steps, '--duration': `${duration}s` }}
      >
        {items.map((p, index) => {
          const isWinner = index === winnerIndex && !rolling;
          const name = fullName(p);
          return (
            <div
              key={p.id}
              className={['draw-reel__item', isWinner && 'draw-reel__item--winner']
                .filter(Boolean)
                .join(' ')}
              data-testid={isWinner && isCentre ? 'draw-result' : undefined}
            >
              {name}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Slot-machine reel: the names scroll up and decelerate until the winner sits in the
// centre row, with one name above and one below. The animation length is the configured
// draw duration.
function Reel({ items, winnerIndex, duration, rolling }) {
  // Scroll so that the winner ends in the middle of the 3 visible rows
  const steps = Math.max(0, winnerIndex - 1);
  // One font size for the whole reel, fitted to its longest name (see --longest in CSS)
  const longest = Math.max(10, ...items.map((p) => fullName(p).length));
  const props = { items, winnerIndex, steps, duration, rolling };
  return (
    <div
      className={`draw-reel${rolling ? '' : ' draw-reel--stopped'}`}
      style={{ '--longest': longest }}
    >
      <Strip {...props} layer="side" />
      <Strip {...props} layer="centre" />
    </div>
  );
}

// Random draw dialog: a reel of participant names scrolls while `draw.rolling` is true,
// then stops on the winner, in large type so it can be read on a tablet from a distance.
export default function DrawModal({ draw, duration, eligibleCount, onDrawAgain, onDismiss, t }) {
  const rolling = !!draw?.rolling;

  return (
    <Modal
      visible={!!draw}
      onDismiss={onDismiss}
      size="max"
      header={t.drawTitle}
      footer={
        <Box float="right">
          <SpaceBetween direction="horizontal" size="xs">
            <Button variant="link" onClick={onDismiss}>
              {t.close}
            </Button>
            <Button
              variant="primary"
              iconName="refresh"
              onClick={onDrawAgain}
              disabled={rolling || eligibleCount === 0}
            >
              {t.drawAgain}
            </Button>
          </SpaceBetween>
        </Box>
      }
    >
      {draw && (
        <div className="draw-stage" aria-live="polite">
          {/* Remount the reel on each draw so the animation replays */}
          <Reel
            key={draw.id}
            items={draw.reel.items}
            winnerIndex={draw.reel.winnerIndex}
            duration={duration}
            rolling={rolling}
          />
          <Box variant="p" color="text-body-secondary" textAlign="center">
            {rolling ? t.drawRolling : t.drawAmong.replace('{count}', eligibleCount)}
          </Box>
        </div>
      )}
    </Modal>
  );
}
