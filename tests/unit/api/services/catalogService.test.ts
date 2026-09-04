import type { CatalogCardRepository } from '../../../../src/api/services/catalogService';
import { CatalogService } from '../../../../src/api/services/catalogService';

const emptyStats = {
  characters: 0,
  locations: 0,
  battlegrounds: 0,
  specialCards: 0,
  missions: 0,
  events: 0,
  aspects: 0,
  advancedUniverse: 0,
  teamwork: 0,
  allyUniverse: 0,
  training: 0,
  basicUniverse: 0,
  powerCards: 0
};

function stubCards(overrides: Partial<CatalogCardRepository> = {}): CatalogCardRepository {
  const base: CatalogCardRepository = {
    getAllCharacters: jest.fn().mockResolvedValue([]),
    getAllLocations: jest.fn().mockResolvedValue([]),
    getAllBattlegrounds: jest.fn().mockResolvedValue([]),
    getAllSpecialCards: jest.fn().mockResolvedValue([]),
    getAllMissions: jest.fn().mockResolvedValue([]),
    getAllEvents: jest.fn().mockResolvedValue([]),
    getAllAspects: jest.fn().mockResolvedValue([]),
    getAllAdvancedUniverse: jest.fn().mockResolvedValue([]),
    getAllTeamwork: jest.fn().mockResolvedValue([]),
    getAllAllyUniverse: jest.fn().mockResolvedValue([]),
    getAllTraining: jest.fn().mockResolvedValue([]),
    getAllBasicUniverse: jest.fn().mockResolvedValue([]),
    getAllPowerCards: jest.fn().mockResolvedValue([]),
    getCardStats: jest.fn().mockResolvedValue(emptyStats)
  };
  return { ...base, ...overrides };
}

const stubFoil = () => ({ getFoilCardMap: jest.fn().mockResolvedValue([]) });
const stubErrata = (entries: any[] = []) => ({
  getAllCardErrata: jest.fn().mockResolvedValue(entries)
});

describe('CatalogService', () => {
  it('getAllCharacters delegates to card repository', async () => {
    const cards = stubCards({
      getAllCharacters: jest.fn().mockResolvedValue([{ id: 'a' }])
    });
    const svc = new CatalogService(cards, stubFoil());
    const out = await svc.getAllCharacters();
    expect(out).toEqual([{ id: 'a' }]);
    expect(cards.getAllCharacters).toHaveBeenCalledTimes(1);
  });

  it('getFoilCardMap delegates to foil repository', async () => {
    const foil = { getFoilCardMap: jest.fn().mockResolvedValue([{ foil_card_id: 'f1' }]) };
    const svc = new CatalogService(stubCards(), foil);
    const out = await svc.getFoilCardMap();
    expect(out).toEqual([{ foil_card_id: 'f1' }]);
    expect(foil.getFoilCardMap).toHaveBeenCalledTimes(1);
  });

  it('getCardStats delegates to card repository', async () => {
    const cards = stubCards({
      getCardStats: jest.fn().mockResolvedValue({ ...emptyStats, characters: 5 })
    });
    const svc = new CatalogService(cards, stubFoil());
    const stats = await svc.getCardStats();
    expect(stats.characters).toBe(5);
    expect(cards.getCardStats).toHaveBeenCalledTimes(1);
  });

  it('adds ordered errata only to the linked card type and printing', async () => {
    const cards = stubCards({
      getAllSpecialCards: jest.fn().mockResolvedValue([
        { id: 'special-1', name: 'I am Immortal' },
        { id: 'special-2', name: 'Unlinked' }
      ])
    });
    const errata = stubErrata([
      {
        card_type: 'special',
        card_id: 'special-1',
        id: 'errata-12',
        source_section: 12,
        entry_title: 'I am Immortal',
        entry_text: 'Second ruling.',
        source_url: 'https://overpowercardgame.com/errata/#s12'
      },
      {
        card_type: 'special',
        card_id: 'special-1',
        id: 'errata-1',
        source_section: 1,
        entry_title: 'Absolute KO',
        entry_text: 'First ruling.',
        source_url: 'https://overpowercardgame.com/errata/#s1'
      },
      {
        card_type: 'character',
        card_id: 'special-1',
        id: 'wrong-type',
        source_section: 18,
        entry_title: 'Wrong type',
        entry_text: 'Must not appear.',
        source_url: 'https://overpowercardgame.com/errata/#s18'
      }
    ]);

    const svc = new CatalogService(cards, stubFoil(), errata);
    const output = await svc.getAllSpecialCards();

    expect(output).toEqual([
      {
        id: 'special-1',
        name: 'I am Immortal',
        errata: [
          expect.objectContaining({ id: 'errata-1', source_section: 1 }),
          expect.objectContaining({ id: 'errata-12', source_section: 12 })
        ]
      },
      { id: 'special-2', name: 'Unlinked' }
    ]);
    expect(errata.getAllCardErrata).toHaveBeenCalledTimes(1);
  });
});
