import type { DeckListItem } from '../api/types';

/** Production-stable deck IDs for Columbus S1 podium finishes (1st → 3rd). */
export const COLUMBUS_PODIUM_DECK_IDS = [
  '81d73769-e987-4c85-a9f8-6629980a1807',
  'a6df76ba-c073-4e65-bc68-2046ee3919b1',
  'bb9a2144-9c15-4cb3-9c38-851e66972c74',
] as const;

export const COLUMBUS_PODIUM_PLACEMENTS = ['1st', '2nd', '3rd'] as const;

export type ColumbusPodiumPlacement = (typeof COLUMBUS_PODIUM_PLACEMENTS)[number];

export interface ColumbusPodiumDeckEntry {
  placement: ColumbusPodiumPlacement;
  deck: DeckListItem | null;
}

const NAME_PREFIXES: Record<ColumbusPodiumPlacement, string> = {
  '1st': 'S1 Regionals (Columbus 1st',
  '2nd': 'S1 Regionals (Columbus 2nd',
  '3rd': 'S1 Regionals (Columbus 3rd',
};

function findDeckById(decks: DeckListItem[], deckId: string): DeckListItem | undefined {
  return decks.find((deck) => deck.metadata.id === deckId);
}

function findDeckByNamePrefix(decks: DeckListItem[], prefix: string): DeckListItem | undefined {
  const lower = prefix.toLowerCase();
  return decks.find((deck) => deck.metadata.name.toLowerCase().startsWith(lower));
}

/** Resolve Columbus podium decks by stable ID, with name-prefix fallback. */
export function resolveColumbusPodiumDecks(decks: DeckListItem[]): ColumbusPodiumDeckEntry[] {
  return COLUMBUS_PODIUM_PLACEMENTS.map((placement, index) => {
    const deckId = COLUMBUS_PODIUM_DECK_IDS[index];
    const deck =
      findDeckById(decks, deckId) ?? findDeckByNamePrefix(decks, NAME_PREFIXES[placement]) ?? null;
    return { placement, deck };
  });
}

/** Extract player name from deck title, e.g. "S1 Regionals (Columbus 1st, Justin Sadaie)". */
export function extractPodiumPlayerName(deckName: string, placement: ColumbusPodiumPlacement): string {
  const ordinal = placement;
  const match = deckName.match(new RegExp(`Columbus\\s+${ordinal},\\s*(.+?)\\)?$`, 'i'));
  if (match?.[1]) {
    return match[1].trim();
  }
  return deckName;
}
