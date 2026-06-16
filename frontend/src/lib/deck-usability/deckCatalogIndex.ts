import type { DeckCardType } from '../api/types';

/** Key format used by DeckEditorPage `cardIndex` and usability context lookups. */
export function deckCatalogIndexKey(deckType: DeckCardType | string, cardId: string): string {
  return `${deckType}:${cardId}`;
}
