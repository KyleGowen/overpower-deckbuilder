/**
 * Regional stats aggregation — Columbus S1 and shared helpers.
 */
import {
  aggregateRegionalStats,
  parseS1SheetRows,
} from '../../../scripts/lib/regional-stats/aggregateRegionalStats';
import type { RegionalDeckRow } from '../../../scripts/lib/regional-stats/types';

const TEST_META_LOCATION = { city: 'Test City', region: 'TS' };

function makeDeck(
  rank: number,
  frontLine: [string, string, string],
  reserve: string,
  homebase = 'Asclepieion',
  cataclysm = 'Fairy Protection',
): RegionalDeckRow {
  return {
    rank,
    player: `Player ${rank}`,
    frontLine1: frontLine[0],
    frontLine2: frontLine[1],
    frontLine3: frontLine[2],
    reserve,
    homebase,
    cataclysm,
  };
}

describe('aggregateRegionalStats', () => {
  it('counts character appearances across front line and reserve', () => {
    const decks: RegionalDeckRow[] = [
      makeDeck(1, ['Wicked Witch', 'Joan of Arc', 'Jane Porter'], 'Dr. Watson'),
      makeDeck(2, ['Wicked Witch', 'Sun Wukong', 'Mina Harker'], 'Billy the Kid'),
    ];

    const stats = aggregateRegionalStats({
      meta: {
        id: 'test',
        title: 'Test',
        subtitle: '',
        date: '2026-06-27',
        playerCount: 2,
        winnerName: 'Player 1',
        seasonLabel: '',
        location: TEST_META_LOCATION,
      },
      decks,
      priorEventDecks: [],
    });

    const witch = stats.characterAppearances.find((c) => c.name === 'Wicked Witch');
    expect(witch?.count).toBe(2);
  });

  it('limits top-8 character counts to ranks 1–8', () => {
    const decks: RegionalDeckRow[] = [
      makeDeck(1, ['Wicked Witch', 'Joan of Arc', 'Jane Porter'], 'Dr. Watson'),
      makeDeck(9, ['Sherlock Holmes', 'Sherlock Holmes', 'Sherlock Holmes'], 'Sherlock Holmes'),
    ];

    const stats = aggregateRegionalStats({
      meta: {
        id: 'test',
        title: 'Test',
        subtitle: '',
        date: '2026-06-27',
        playerCount: 2,
        winnerName: 'Player 1',
        seasonLabel: '',
        location: TEST_META_LOCATION,
      },
      decks,
      priorEventDecks: [],
    });

    expect(stats.top8CharacterAppearances.find((c) => c.name === 'Sherlock Holmes')).toBeUndefined();
    expect(stats.top8CharacterAppearances.find((c) => c.name === 'Wicked Witch')?.count).toBe(1);
  });

  it('normalizes Morgan Le Fay alias variants into one count', () => {
    const decks: RegionalDeckRow[] = [
      makeDeck(1, ['Morgan Le Fay', 'Wicked Witch', 'Joan of Arc'], 'Jane Porter'),
      makeDeck(2, ['Morgan le Fay', 'Sun Wukong', 'Mina Harker'], 'Billy the Kid'),
    ];

    const stats = aggregateRegionalStats({
      meta: {
        id: 'test',
        title: 'Test',
        subtitle: '',
        date: '2026-06-27',
        playerCount: 2,
        winnerName: 'Player 1',
        seasonLabel: '',
        location: TEST_META_LOCATION,
      },
      decks,
      priorEventDecks: [],
    });

    const morgan = stats.characterAppearances.filter((c) => c.name === 'Morgan le Fay');
    expect(morgan).toHaveLength(1);
    expect(morgan[0]?.count).toBe(2);
  });

  it('identifies most plays without top-8 finish', () => {
    const decks: RegionalDeckRow[] = [
      makeDeck(1, ['Wicked Witch', 'Joan of Arc', 'Jane Porter'], 'Dr. Watson'),
      makeDeck(9, ['Sherlock Holmes', 'Leonidas', 'Zorro'], 'Billy the Kid'),
      makeDeck(10, ['Sherlock Holmes', 'Ra', 'Zeus'], 'Billy the Kid'),
    ];
    for (let rank = 2; rank <= 8; rank += 1) {
      decks.push(makeDeck(rank, ['Sun Wukong', 'Mina Harker', 'Korak'], 'Jane Porter'));
    }

    const stats = aggregateRegionalStats({
      meta: {
        id: 'test',
        title: 'Test',
        subtitle: '',
        date: '2026-06-27',
        playerCount: decks.length,
        winnerName: 'Player 1',
        seasonLabel: '',
        location: TEST_META_LOCATION,
      },
      decks,
      priorEventDecks: [],
    });

    expect(stats.mostPlaysWithoutTop8?.name).toBe('Sherlock Holmes');
    expect(stats.mostPlaysWithoutTop8?.totalPlays).toBe(2);
  });
});

describe('parseS1SheetRows', () => {
  it('skips header and parses rank and cataclysm column', () => {
    const rows = [
      ['Columbus', 'Player', 'FL1', 'FL2', 'FL3', 'Reserve', 'Homebase', 'BG', 'Cataclysm'],
      [1, 'Justin Sadaie', 'Wicked Witch', 'Joan of Arc', 'Jane Porter', 'Cthulhu', 'The Round Table', 'ERB', 'Fairy Protection'],
    ];
    const decks = parseS1SheetRows(rows);
    expect(decks).toHaveLength(1);
    expect(decks[0]?.rank).toBe(1);
    expect(decks[0]?.cataclysm).toBe('Fairy Protection');
  });
});

describe('Columbus S1 committed stats snapshot', () => {
  it('matches known aggregates from the regional workbook', () => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const stats = require('../../../frontend/src/data/tournaments/s1-columbus.json');

    expect(stats.meta.playerCount).toBe(53);
    expect(stats.meta.winnerName).toBe('Justin Sadaie');
    expect(stats.meta.location).toMatchObject({
      venueName: 'Heroes and Games',
      city: 'Columbus',
      region: 'OH',
    });
    expect(stats.characterAppearances[0]).toMatchObject({ name: 'Wicked Witch', count: 22 });
    expect(stats.topCataclysms[0]).toMatchObject({ name: 'Fairy Protection', count: 37 });
    expect(stats.cataclysmReportedCount).toBe(42);
    expect(stats.mostPlaysWithoutTop8?.name).toBe('Sherlock Holmes');
    expect(stats.highestTop8Rate?.name).toBe('Sun Wukong');
  });
});
