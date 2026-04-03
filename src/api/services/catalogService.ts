import type { CardRepository } from '../../repository/CardRepository';

/**
 * Card repository surface used by the catalog service. Keeps HTTP layers from
 * depending on the full `CardRepository` while delegating reads to persistence.
 */
export type CatalogCardRepository = Pick<
  CardRepository,
  | 'getAllCharacters'
  | 'getAllLocations'
  | 'getAllSpecialCards'
  | 'getAllMissions'
  | 'getAllEvents'
  | 'getAllAspects'
  | 'getAllAdvancedUniverse'
  | 'getAllTeamwork'
  | 'getAllAllyUniverse'
  | 'getAllTraining'
  | 'getAllBasicUniverse'
  | 'getAllPowerCards'
  | 'getCardStats'
>;

export interface FoilCardMapReader {
  getFoilCardMap(): Promise<unknown[]>;
}

/**
 * Read-only card catalog for DBV / legacy `/api/*` catalog GETs / v1.
 * HTTP handlers call this service only; the service calls repositories.
 */
export class CatalogService {
  constructor(
    private readonly cards: CatalogCardRepository,
    private readonly foilMap: FoilCardMapReader
  ) {}

  getAllCharacters(): Promise<unknown[]> {
    return this.cards.getAllCharacters();
  }

  getAllLocations(): Promise<unknown[]> {
    return this.cards.getAllLocations();
  }

  getAllSpecialCards(): Promise<unknown[]> {
    return this.cards.getAllSpecialCards();
  }

  getAllMissions(): Promise<unknown[]> {
    return this.cards.getAllMissions();
  }

  getAllEvents(): Promise<unknown[]> {
    return this.cards.getAllEvents();
  }

  getAllAspects(): Promise<unknown[]> {
    return this.cards.getAllAspects();
  }

  getAllAdvancedUniverse(): Promise<unknown[]> {
    return this.cards.getAllAdvancedUniverse();
  }

  getAllTeamwork(): Promise<unknown[]> {
    return this.cards.getAllTeamwork();
  }

  getAllAllyUniverse(): Promise<unknown[]> {
    return this.cards.getAllAllyUniverse();
  }

  getAllTraining(): Promise<unknown[]> {
    return this.cards.getAllTraining();
  }

  getAllBasicUniverse(): Promise<unknown[]> {
    return this.cards.getAllBasicUniverse();
  }

  getAllPowerCards(): Promise<unknown[]> {
    return this.cards.getAllPowerCards();
  }

  getFoilCardMap(): Promise<unknown[]> {
    return this.foilMap.getFoilCardMap();
  }

  getCardStats() {
    return this.cards.getCardStats();
  }
}
