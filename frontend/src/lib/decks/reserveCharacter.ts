import type { DeckCardEntry } from '../api/types';

export type ReserveRowState =
  | 'none'
  | 'active'
  | 'hidden'
  | 'orphaned'
  | 'readonlyActive'
  | 'readonlyHidden';

export interface ReserveCharacterEntry {
  cardId: string;
}

function reserveMatchesDeckCharacter(
  reserveCharacterId: string,
  characterEntries: ReserveCharacterEntry[],
): boolean {
  return characterEntries.some((c) => c.cardId === reserveCharacterId);
}

/**
 * Row-level reserve button state for a character tile in the deck editor.
 * Mirrors v1 `computeReserveCharacterRowState` (cardId match only; no alternate art).
 */
export function computeReserveRowState(
  cardId: string,
  reserveCharacterId: string | null | undefined,
  characterEntries: ReserveCharacterEntry[],
  isReadOnly: boolean,
): ReserveRowState {
  const hasReserveCharacter = Boolean(reserveCharacterId);
  const isReserveCharacter = hasReserveCharacter && reserveCharacterId === cardId;
  const reserveMatchesAnyCard =
    hasReserveCharacter &&
    reserveMatchesDeckCharacter(reserveCharacterId!, characterEntries);

  if (isReadOnly) {
    if (hasReserveCharacter && isReserveCharacter) {
      return 'readonlyActive';
    }
    return 'readonlyHidden';
  }

  if (isReserveCharacter) {
    return 'active';
  }

  if (hasReserveCharacter && !reserveMatchesAnyCard) {
    return 'orphaned';
  }

  if (hasReserveCharacter && reserveMatchesAnyCard) {
    return 'hidden';
  }

  return 'none';
}

/** Whether the reserve slot should occupy layout space on this character tile. */
export function reserveSlotVisible(state: ReserveRowState): boolean {
  return state !== 'readonlyHidden';
}

export function characterDeckEntries(cards: DeckCardEntry[]): ReserveCharacterEntry[] {
  return cards
    .filter((c) => c.type === 'character')
    .map((c) => ({ cardId: c.cardId }));
}
