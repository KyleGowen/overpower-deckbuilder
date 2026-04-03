/** `data` payload for `GET /api/v1/decks` — same transformed rows as legacy list (`transformDeckList`). */
export type DeckListV1DataDto = ReturnType<
  typeof import('../../deckTransform').transformDeckList
>;
