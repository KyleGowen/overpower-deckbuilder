import { TOURNAMENT_LEGAL_THREAT_LIMIT } from '../../src/constants/deckRules';
import type { DeckValidationContext } from '../../src/services/deck-validation/deck-validation-context';
import { ThreatLevelRule } from '../../src/services/deck-validation/rules/threat-level.rule';

function makeContext(overrides: Partial<DeckValidationContext>): DeckValidationContext {
    return {
        cards: [],
        availableCardsMap: new Map(),
        characterCards: [],
        missionCards: [],
        eventCards: [],
        locationCards: [],
        battlegroundCards: [],
        characterNames: [],
        characterStats: [],
        angryMobCharacterNames: [],
        ...overrides
    };
}

describe('ThreatLevelRule', () => {
    it('counts location threat with character threat against the tournament cap', () => {
        const availableCardsMap = new Map<string, Record<string, unknown>>([
            ['character_char-1', { name: 'Hero 1', threat_level: 20 }],
            ['character_char-2', { name: 'Hero 2', threat_level: 20 }],
            ['character_char-3', { name: 'Hero 3', threat_level: 20 }],
            ['character_char-4', { name: 'Hero 4', threat_level: 15 }],
            ['location_loc-1', { name: 'Homebase', threat_level: 2 }]
        ]);
        const ctx = makeContext({
            availableCardsMap,
            characterCards: [
                { id: 'deck-char-1', type: 'character', cardId: 'char-1', quantity: 1 },
                { id: 'deck-char-2', type: 'character', cardId: 'char-2', quantity: 1 },
                { id: 'deck-char-3', type: 'character', cardId: 'char-3', quantity: 1 },
                { id: 'deck-char-4', type: 'character', cardId: 'char-4', quantity: 1 }
            ],
            locationCards: [{ id: 'deck-loc-1', type: 'location', cardId: 'loc-1', quantity: 1 }]
        });

        const errors = new ThreatLevelRule().validate(ctx);

        expect(errors).toEqual([
            {
                rule: 'threat_level',
                message: `Deck threat level must be ${TOURNAMENT_LEGAL_THREAT_LIMIT} or less (found 77)`
            }
        ]);
    });

    it('passes when character plus location threat equals the tournament cap', () => {
        const availableCardsMap = new Map<string, Record<string, unknown>>([
            ['character_char-1', { name: 'Hero 1', threat_level: 20 }],
            ['character_char-2', { name: 'Hero 2', threat_level: 20 }],
            ['character_char-3', { name: 'Hero 3', threat_level: 20 }],
            ['character_char-4', { name: 'Hero 4', threat_level: 14 }],
            ['location_loc-1', { name: 'Homebase', threat_level: 2 }]
        ]);
        const ctx = makeContext({
            availableCardsMap,
            characterCards: [
                { id: 'deck-char-1', type: 'character', cardId: 'char-1', quantity: 1 },
                { id: 'deck-char-2', type: 'character', cardId: 'char-2', quantity: 1 },
                { id: 'deck-char-3', type: 'character', cardId: 'char-3', quantity: 1 },
                { id: 'deck-char-4', type: 'character', cardId: 'char-4', quantity: 1 }
            ],
            locationCards: [{ id: 'deck-loc-1', type: 'location', cardId: 'loc-1', quantity: 1 }]
        });

        expect(new ThreatLevelRule().validate(ctx)).toEqual([]);
    });
});
