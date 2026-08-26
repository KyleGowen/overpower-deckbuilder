import type { DeckListItem } from '../../../../frontend/src/lib/api/types';
import {
  COLUMBUS_PODIUM_DECK_IDS,
  NIAGARA_PODIUM_DECK_IDS,
  REGIONAL_TOURNAMENTS,
} from '../../../../frontend/src/lib/tournaments/regionalTournaments';
import {
  extractTournamentPodiumPlayerName,
  resolveTournamentPodiumDecks,
} from '../../../../frontend/src/lib/tournaments/tournamentPodiumDecks';

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

const columbus = REGIONAL_TOURNAMENTS.find((event) => event.id === 's1-columbus')!;
const niagara = REGIONAL_TOURNAMENTS.find((event) => event.id === 's1-niagara')!;

describe('tournamentPodiumDecks', () => {
  it('resolves decks by stable production IDs', () => {
    const decks = Object.values(COLUMBUS_PODIUM_DECK_IDS).map((id, index) =>
      makeDeck(id, `S1 Regionals (Columbus ${index + 1}, Player ${index + 1})`),
    );

    const resolved = resolveTournamentPodiumDecks(decks, columbus);
    expect(resolved).toHaveLength(3);
    expect(resolved[0]?.deck?.metadata.id).toBe(COLUMBUS_PODIUM_DECK_IDS['1st']);
    expect(resolved[1]?.deck?.metadata.id).toBe(COLUMBUS_PODIUM_DECK_IDS['2nd']);
    expect(resolved[2]?.deck?.metadata.id).toBe(COLUMBUS_PODIUM_DECK_IDS['3rd']);
  });

  it('falls back to name prefix when IDs differ', () => {
    const decks = [
      makeDeck('local-1', 'S1 Regionals (Columbus 1st, Justin Sadaie)'),
      makeDeck('local-2', 'S1 Regionals (Columbus 2nd, Noor El-barrad'),
      makeDeck('local-3', 'S1 Regionals (Columbus 3rd, Charlie Hanford)'),
    ];

    const resolved = resolveTournamentPodiumDecks(decks, columbus);
    expect(resolved.every((entry) => entry.deck !== null)).toBe(true);
    expect(resolved[0]?.placement).toBe('1st');
    expect(resolved[2]?.placement).toBe('3rd');
  });

  it('extracts player names from deck titles', () => {
    expect(
      extractTournamentPodiumPlayerName('S1 Regionals (Columbus 1st, Justin Sadaie)', '1st', 'Columbus'),
    ).toBe('Justin Sadaie');
    expect(
      extractTournamentPodiumPlayerName('S1 Regionals (Columbus 2nd, Noor El-barrad', '2nd', 'Columbus'),
    ).toBe('Noor El-barrad');
  });

  it('resolves Niagara decks by the shared tournament title convention', () => {
    const decks = [makeDeck('niagara-1', 'S1 Regionals (Niagara 1st, Jessica Simms)')];
    const [winner] = resolveTournamentPodiumDecks(decks, niagara);

    expect(winner?.deck?.metadata.id).toBe('niagara-1');
    expect(winner?.playerName).toBe('Jessica Simms');
  });

  it('resolves the available Niagara podium decks by stable ID and leaves third place pending', () => {
    const decks = [
      makeDeck(NIAGARA_PODIUM_DECK_IDS['1st'], 'Jessica Simms Niagara Regional'),
      makeDeck(NIAGARA_PODIUM_DECK_IDS['2nd'], 'Justin Sadaie Niagara Regional'),
    ];
    const resolved = resolveTournamentPodiumDecks(decks, niagara);

    expect(resolved[0]?.deck?.metadata.id).toBe(NIAGARA_PODIUM_DECK_IDS['1st']);
    expect(resolved[1]?.deck?.metadata.id).toBe(NIAGARA_PODIUM_DECK_IDS['2nd']);
    expect(resolved[0]?.deckId).toBe(NIAGARA_PODIUM_DECK_IDS['1st']);
    expect(resolved[1]?.deckId).toBe(NIAGARA_PODIUM_DECK_IDS['2nd']);
    expect(resolved[2]?.playerName).toBe('Sean Ballantyne');
    expect(resolved[2]?.deck).toBeNull();
    expect(resolved[2]?.deckId).toBeNull();
  });

  it('keeps stable podium links active before the deck feed contains the records', () => {
    const resolved = resolveTournamentPodiumDecks([], niagara);

    expect(resolved[0]).toMatchObject({
      deck: null,
      deckId: NIAGARA_PODIUM_DECK_IDS['1st'],
      userId: '00000000-0000-0000-0000-000000000003',
    });
    expect(resolved[1]).toMatchObject({
      deck: null,
      deckId: NIAGARA_PODIUM_DECK_IDS['2nd'],
      userId: '00000000-0000-0000-0000-000000000003',
    });
    expect(resolved[2]).toMatchObject({ deck: null, deckId: null, userId: null });
  });
});
