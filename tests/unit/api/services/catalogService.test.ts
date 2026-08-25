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
});
