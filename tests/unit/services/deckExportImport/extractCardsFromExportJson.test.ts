import { extractCardsFromExportJson } from '../../../../src/services/deckExportImport/extractCardsFromExportJson';

describe('extractCardsFromExportJson', () => {
  it('flattens v2.0 export cards into typed entries', () => {
    const entries = extractCardsFromExportJson({
      characters: ['Dracula', 'Dracula'],
      locations: ['Castle Dracula'],
      power_cards: ['3 - Energy', '5 - Combat'],
      teamwork: ['6 Combat - Brute Force + Intelligence'],
      aspects: ['Hidden Resources'],
    });

    expect(entries).toEqual(
      expect.arrayContaining([
        { name: 'Dracula', type: 'character' },
        { name: 'Dracula', type: 'character' },
        { name: 'Castle Dracula', type: 'location' },
        { name: '3 - Energy', type: 'power' },
        { name: '5 - Combat', type: 'power' },
        {
          name: '6 Combat',
          type: 'teamwork',
          followup_attack_types: 'Brute Force + Intelligence',
        },
        { name: 'Hidden Resources', type: 'aspect' },
      ])
    );
    expect(entries).toHaveLength(7);
  });

  it('extracts grouped special cards', () => {
    const entries = extractCardsFromExportJson({
      special_cards: {
        Dracula: ['Hypnosis'],
      },
    });
    expect(entries).toEqual([{ name: 'Hypnosis', type: 'special' }]);
  });

  it('extracts Battlegrounds and upgrades legacy G.D.A. location exports', () => {
    expect(extractCardsFromExportJson({
      locations: ['Global Defense Agency'],
      battlegrounds: ['Future Battleground'],
    })).toEqual([
      { name: 'Global Defense Agency', type: 'battleground' },
      { name: 'Future Battleground', type: 'battleground' },
    ]);
  });
});
