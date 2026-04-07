import { DeckCard } from '../types';
import { CardRepository } from '../repository/CardRepository';
import { buildAvailableCardsMap, type DeckCatalogBundle } from './deck-validation/build-available-cards-map';
import { buildDeckValidationContext } from './deck-validation/deck-validation-context';
import type { DeckValidationRuleList } from './deck-validation/deck-validation-rule-list';
import { defaultDeckValidationRuleList } from './deck-validation/rules';
import type { ValidationError } from './deck-validation/validation-error';

export type { ValidationError } from './deck-validation/validation-error';

export class DeckValidationService {
    constructor(
        private cardRepository: CardRepository,
        private readonly ruleList: DeckValidationRuleList = defaultDeckValidationRuleList()
    ) {}

    /**
     * Validate a deck for all Overpower rules including unusable cards
     */
    async validateDeck(cards: DeckCard[]): Promise<ValidationError[]> {
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
            allBasicUniverse
        ] = await Promise.all([
            this.cardRepository.getAllCharacters(),
            this.cardRepository.getAllSpecialCards(),
            this.cardRepository.getAllPowerCards(),
            this.cardRepository.getAllMissions(),
            this.cardRepository.getAllEvents(),
            this.cardRepository.getAllLocations(),
            this.cardRepository.getAllAspects(),
            this.cardRepository.getAllAdvancedUniverse(),
            this.cardRepository.getAllTeamwork(),
            this.cardRepository.getAllAllyUniverse(),
            this.cardRepository.getAllTraining(),
            this.cardRepository.getAllBasicUniverse()
        ]);

        const bundle: DeckCatalogBundle = {
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
            allBasicUniverse
        };

        const availableCardsMap = buildAvailableCardsMap(bundle);
        const ctx = buildDeckValidationContext(cards, availableCardsMap);

        const errors: ValidationError[] = [];
        for (const rule of this.ruleList) {
            errors.push(...rule.validate(ctx));
        }
        return errors;
    }
}
