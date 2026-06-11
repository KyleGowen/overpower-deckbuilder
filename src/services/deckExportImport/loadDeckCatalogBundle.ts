import type { CardRepository } from '../../repository/CardRepository';
import type { DeckCatalogBundle } from '../deck-validation/build-available-cards-map';

export async function loadDeckCatalogBundle(
  cardRepository: CardRepository
): Promise<DeckCatalogBundle> {
  const [
    allCharacters,
    allSpecialCards,
    allPowerCards,
    allMissions,
    allEvents,
    allLocations,
    allAspects,
    allAdvancedUniverse,
    allTeamwork,
    allAllyUniverse,
    allTraining,
    allBasicUniverse,
  ] = await Promise.all([
    cardRepository.getAllCharacters(),
    cardRepository.getAllSpecialCards(),
    cardRepository.getAllPowerCards(),
    cardRepository.getAllMissions(),
    cardRepository.getAllEvents(),
    cardRepository.getAllLocations(),
    cardRepository.getAllAspects(),
    cardRepository.getAllAdvancedUniverse(),
    cardRepository.getAllTeamwork(),
    cardRepository.getAllAllyUniverse(),
    cardRepository.getAllTraining(),
    cardRepository.getAllBasicUniverse(),
  ]);

  return {
    allCharacters,
    allSpecialCards,
    allPowerCards,
    allMissions,
    allEvents,
    allLocations,
    allAspects,
    allAdvancedUniverse,
    allTeamwork,
    allAllyUniverse,
    allTraining,
    allBasicUniverse,
  };
}
