import type { DeckListItem } from '../../../../frontend/src/lib/api/types';
import {
  COLUMBUS_PODIUM_DECK_IDS,
  extractPodiumPlayerName,
  resolveColumbusPodiumDecks,
} from '../../../../frontend/src/lib/tournaments/columbusPodiumDecks';

function makeDeck(id: string, name: string): DeckListItem {
  return {
    metadata: {
      id,
      name,
      userId: '00000000-0000-0000-0000-000000000003',
      cardCount: 50,
      threat: 76,
      is_valid: true,
      is_private: false,
      isOwner: false,
      created: '2026-07-03T00:00:00.000Z',
      lastModified: '2026-07-03T00:00:00.000Z',
    },
    cards: [],
  };
}

describe('columbusPodiumDecks', () => {
  it('resolves decks by stable production IDs', () => {
    const decks = COLUMBUS_PODIUM_DECK_IDS.map((id, index) =>
      makeDeck(id, `S1 Regionals (Columbus ${index + 1}st, Player ${index + 1})`),
    );

    const resolved = resolveColumbusPodiumDecks(decks);
    expect(resolved).toHaveLength(3);
    expect(resolved[0]?.deck?.metadata.id).toBe(COLUMBUS_PODIUM_DECK_IDS[0]);
    expect(resolved[1]?.deck?.metadata.id).toBe(COLUMBUS_PODIUM_DECK_IDS[1]);
    expect(resolved[2]?.deck?.metadata.id).toBe(COLUMBUS_PODIUM_DECK_IDS[2]);
  });

  it('falls back to name prefix when IDs differ', () => {
    const decks = [
      makeDeck('local-1', 'S1 Regionals (Columbus 1st, Justin Sadaie)'),
      makeDeck('local-2', 'S1 Regionals (Columbus 2nd, Noor El-barrad'),
      makeDeck('local-3', 'S1 Regionals (Columbus 3rd, Charlie Hanford)'),
    ];

    const resolved = resolveColumbusPodiumDecks(decks);
    expect(resolved.every((entry) => entry.deck !== null)).toBe(true);
    expect(resolved[0]?.placement).toBe('1st');
    expect(resolved[2]?.placement).toBe('3rd');
  });

  it('extracts player names from deck titles', () => {
    expect(
      extractPodiumPlayerName('S1 Regionals (Columbus 1st, Justin Sadaie)', '1st'),
    ).toBe('Justin Sadaie');
    expect(
      extractPodiumPlayerName('S1 Regionals (Columbus 2nd, Noor El-barrad', '2nd'),
    ).toBe('Noor El-barrad');
  });
});
