import type {
    AdvancedUniverse,
    AllyUniverse,
    Aspect,
    BasicUniverse,
    Character,
    Event,
    Location,
    Mission,
    PowerCard,
    SpecialCard,
    Teamwork,
    TrainingCard
} from '../../types';

export interface DeckCatalogBundle {
    allCharacters: Character[];
    allSpecialCards: SpecialCard[];
    allPowerCards: PowerCard[];
    allMissions: Mission[];
    allEvents: Event[];
    allLocations: Location[];
    allAspects: Aspect[];
    allAdvancedUniverse: AdvancedUniverse[];
    allTeamwork: Teamwork[];
    allAllyUniverse: AllyUniverse[];
    allTraining: TrainingCard[];
    allBasicUniverse: BasicUniverse[];
}

export function buildAvailableCardsMap(bundle: DeckCatalogBundle): Map<string, Record<string, unknown>> {
    const availableCardsMap = new Map<string, Record<string, unknown>>();

    bundle.allCharacters.forEach(card => {
        const key = `character_${card.id}`;
        availableCardsMap.set(key, { ...card, type: 'character' });
    });
    bundle.allSpecialCards.forEach(card => {
        const key = `special_${card.id}`;
        availableCardsMap.set(key, { ...card, type: 'special' });
    });
    bundle.allPowerCards.forEach(card => {
        const key = `power_${card.id}`;
        availableCardsMap.set(key, { ...card, type: 'power' });
    });
    bundle.allMissions.forEach(card => {
        const key = `mission_${card.id}`;
        availableCardsMap.set(key, { ...card, type: 'mission' });
    });
    bundle.allEvents.forEach(card => {
        const key = `event_${card.id}`;
        availableCardsMap.set(key, { ...card, type: 'event' });
    });
    bundle.allLocations.forEach(card => {
        const key = `location_${card.id}`;
        availableCardsMap.set(key, { ...card, type: 'location' });
    });
    bundle.allAspects.forEach(card => {
        const key = `aspect_${card.id}`;
        availableCardsMap.set(key, { ...card, type: 'aspect' });
    });
    bundle.allAdvancedUniverse.forEach(card => {
        const key = `advanced_universe_${card.id}`;
        availableCardsMap.set(key, { ...card, type: 'advanced_universe' });
    });
    bundle.allTeamwork.forEach(card => {
        const key = `teamwork_${card.id}`;
        availableCardsMap.set(key, { ...card, type: 'teamwork' });
    });
    bundle.allAllyUniverse.forEach(card => {
        const key = `ally_universe_${card.id}`;
        availableCardsMap.set(key, { ...card, type: 'ally_universe' });
    });
    bundle.allTraining.forEach(card => {
        const key = `training_${card.id}`;
        availableCardsMap.set(key, { ...card, type: 'training' });
    });
    bundle.allBasicUniverse.forEach(card => {
        const key = `basic_universe_${card.id}`;
        const gridSkillType = card.type;
        availableCardsMap.set(key, { ...card, type: 'basic_universe', basic_skill_type: gridSkillType });
    });

    return availableCardsMap;
}
