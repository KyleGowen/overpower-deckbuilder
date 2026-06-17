import type { ReserveRowState } from '../../lib/decks/reserveCharacter';
import { reserveSlotVisible } from '../../lib/decks/reserveCharacter';

export interface ReserveCharacterButtonProps {
  state: ReserveRowState;
  cardName: string;
  onSelect: () => void;
  onDeselect: () => void;
}

/**
 * Reserve control for character tiles. Uses a fixed-width slot so hiding the
 * button on non-reserve characters does not shift the trash control.
 */
export function ReserveCharacterButton({
  state,
  cardName,
  onSelect,
  onDeselect,
}: ReserveCharacterButtonProps) {
  if (!reserveSlotVisible(state)) {
    return null;
  }

  const slotClass =
    state === 'hidden'
      ? 'deck-editor__reserve-slot deck-editor__reserve-slot--hidden'
      : 'deck-editor__reserve-slot';

  if (state === 'hidden') {
    return (
      <span className={slotClass} aria-hidden="true">
        <button type="button" className="deck-editor__reserve-btn" tabIndex={-1}>
          Select Reserve
        </button>
      </span>
    );
  }

  if (state === 'active') {
    return (
      <span className={slotClass}>
        <button
          type="button"
          className="deck-editor__reserve-btn deck-editor__reserve-btn--active"
          onClick={(e) => {
            e.stopPropagation();
            onDeselect();
          }}
          aria-label={`Deselect ${cardName} as reserve`}
        >
          Reserve
        </button>
      </span>
    );
  }

  if (state === 'readonlyActive') {
    return (
      <span className={slotClass}>
        <button
          type="button"
          className="deck-editor__reserve-btn deck-editor__reserve-btn--active"
          disabled
          title="Reserve character"
          aria-label={`${cardName} is the reserve character`}
        >
          Reserve
        </button>
      </span>
    );
  }

  // none | orphaned
  return (
    <span className={slotClass}>
      <button
        type="button"
        className="deck-editor__reserve-btn"
        onClick={(e) => {
          e.stopPropagation();
          onSelect();
        }}
        aria-label={`Select ${cardName} as reserve`}
      >
        Select Reserve
      </button>
    </span>
  );
}
