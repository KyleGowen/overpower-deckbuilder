/**
 * GUEST clone-on-open: when a guest opens a preloaded DB deck, clone it to a
 * session `guest_*` deck so edits never persist to the database.
 * See docs/current/GUEST_DECK_LESSONS_LEARNED.md.
 */
import { api } from '../api/client';
import {
  createDeck,
  replaceDeckCards,
  isGuestDeckId,
  type DeckCardInput,
} from '../api/decks';
import type { DeckDetail } from '../api/types';

export { isGuestDeckId };

export function guestNeedsCloneOnOpen(
  deckId: string,
  isGuest: boolean,
  forceReadonly: boolean,
): boolean {
  return (
    isGuest &&
    deckId.length > 0 &&
    !isGuestDeckId(deckId) &&
    !forceReadonly
  );
}

/** Clone a DB deck into a new guest session deck; returns the new `guest_*` id. */
export async function clonePreloadedGuestDeck(sourceDeckId: string): Promise<string> {
  const source = await api.get<DeckDetail>(`/api/v1/decks/${sourceDeckId}/full`);
  const created = await createDeck(
    {
      name: source.metadata.name,
      description: source.metadata.description ?? undefined,
    },
    true,
  );
  const cards: DeckCardInput[] = (source.cards ?? []).map((c) => ({
    cardType: c.type,
    cardId: c.cardId,
    quantity: c.quantity,
    exclude_from_draw: c.exclude_from_draw === true,
  }));
  if (cards.length > 0) {
    await replaceDeckCards(created.id, cards, true);
  }
  return created.id;
}
