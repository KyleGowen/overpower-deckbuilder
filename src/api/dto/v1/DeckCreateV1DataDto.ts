import type { Deck } from '../../../types';

/** `POST /api/v1/decks` success `data` — created row from `DeckRepository.createDeck` / `Deck` type. */
export type DeckCreateV1DataDto = Deck;
