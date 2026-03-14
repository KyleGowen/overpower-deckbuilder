/** @jest-environment jsdom */

/**
 * Deck Export - Card Types, Edge Cases, Real-World Scenarios
 * Part of comprehensive deck-export tests; uses deckExportTestHelpers.
 */

import {
    setupDeckExportBootstrap,
    teardownDeckExportMocks
} from '../helpers/deckExportTestHelpers';

describe('Deck Export Component - Types and Edge', () => {
    let exportDeckAsJson: () => Promise<void>;
    let getExportedJson: () => any;
    let mockLoadAvailableCards: jest.Mock;
    let mockValidateDeck: jest.Mock;
    let mockDeckEditorCards: any[];
    let mockAvailableCardsMap: Map<string, any>;

    beforeEach(() => {
        jest.useFakeTimers();
        const setup = setupDeckExportBootstrap();
        exportDeckAsJson = setup.exportDeckAsJson;
        getExportedJson = setup.getExportedJson;
        mockLoadAvailableCards = setup.mocks.mockLoadAvailableCards;
        mockValidateDeck = setup.mocks.mockValidateDeck;
        mockDeckEditorCards = (window as any).deckEditorCards;
        mockAvailableCardsMap = (window as any).availableCardsMap;
    });

    afterEach(() => {
        teardownDeckExportMocks(window);
        jest.useRealTimers();
    });

    describe('Card Types - All Categories', () => {
        it('should handle all card types correctly', async () => {
            mockDeckEditorCards = [
                { cardId: 'char1', type: 'character', quantity: 1 },
                { cardId: 'special1', type: 'special', quantity: 1 },
                { cardId: 'loc1', type: 'location', quantity: 1 },
                { cardId: 'mission1', type: 'mission', quantity: 1 },
                { cardId: 'event1', type: 'event', quantity: 1 },
                { cardId: 'aspect1', type: 'aspect', quantity: 1 },
                { cardId: 'adv1', type: 'advanced-universe', quantity: 1 },
                { cardId: 'teamwork1', type: 'teamwork', quantity: 1 },
                { cardId: 'ally1', type: 'ally-universe', quantity: 1 },
                { cardId: 'training1', type: 'training', quantity: 1 },
                { cardId: 'basic1', type: 'basic-universe', quantity: 1 },
                { cardId: 'power1', type: 'power', quantity: 1 }
            ];

            mockAvailableCardsMap.set('char1', { name: 'Character' });
            mockAvailableCardsMap.set('special1', { name: 'Special', character_name: 'Test Character' });
            mockAvailableCardsMap.set('loc1', { name: 'Location' });
            mockAvailableCardsMap.set('mission1', { name: 'Mission', mission_set: 'Test Set' });
            mockAvailableCardsMap.set('event1', { name: 'Event', mission_set: 'Test Set' });
            mockAvailableCardsMap.set('aspect1', { name: 'Aspect' });
            mockAvailableCardsMap.set('adv1', { name: 'Advanced', character: 'Ra' });
            mockAvailableCardsMap.set('teamwork1', { name: '6 Combat', followup_attack_types: 'Brute Force + Energy' });
            mockAvailableCardsMap.set('ally1', { name: 'Ally' });
            mockAvailableCardsMap.set('training1', { name: 'Training' });
            mockAvailableCardsMap.set('basic1', { name: 'Basic' });
            mockAvailableCardsMap.set('power1', { name: 'Power' });

            (window as any).deckEditorCards = mockDeckEditorCards;
            (window as any).availableCardsMap = mockAvailableCardsMap;
            const promise = exportDeckAsJson();
            await jest.runAllTimersAsync();
            await promise;

            const result = getExportedJson();

            expect(Array.isArray(result.cards.characters)).toBe(true);
            expect(typeof result.cards.special_cards).toBe('object');
            expect(Array.isArray(result.cards.locations)).toBe(true);
            expect(typeof result.cards.missions).toBe('object');
            expect(typeof result.cards.events).toBe('object');
            expect(Array.isArray(result.cards.aspects)).toBe(true);
            expect(typeof result.cards.advanced_universe).toBe('object');
            expect(Array.isArray(result.cards.teamwork)).toBe(true);
            expect(Array.isArray(result.cards.allies)).toBe(true);
            expect(Array.isArray(result.cards.training)).toBe(true);
            expect(Array.isArray(result.cards.basic_universe)).toBe(true);
            expect(Array.isArray(result.cards.power_cards)).toBe(true);
        });
    });

    describe('Edge Cases and Error Handling', () => {
        it('should handle cards missing from availableCardsMap', async () => {
            mockDeckEditorCards = [
                { cardId: 'missing1', type: 'character', quantity: 1 },
                { cardId: 'missing2', type: 'special', quantity: 1 }
            ];

            // Add at least one card to the map to avoid early return
            // but don't add the cards we're testing (missing1, missing2)
            mockAvailableCardsMap.set('someOtherCard', { name: 'Other Card' });

            (window as any).deckEditorCards = mockDeckEditorCards;
            (window as any).availableCardsMap = mockAvailableCardsMap;
            const promise = exportDeckAsJson();
            await jest.runAllTimersAsync();
            await promise;

            const result = getExportedJson();

            // Characters can be strings or objects (for reserve)
            expect(result.cards.characters).toBeDefined();
            expect(Array.isArray(result.cards.characters)).toBe(true);
            expect(result.cards.special_cards).toEqual({});
        });

        it('should handle cards with quantity 0', async () => {
            mockDeckEditorCards = [
                { cardId: 'char1', type: 'character', quantity: 0 }
            ];

            mockAvailableCardsMap.set('char1', { name: 'Character', energy: 5, combat: 4, brute_force: 3, intelligence: 2 });

            (window as any).deckEditorCards = mockDeckEditorCards;
            (window as any).availableCardsMap = mockAvailableCardsMap;
            const promise = exportDeckAsJson();
            await jest.runAllTimersAsync();
            await promise;

            const result = getExportedJson();

            // The function uses quantity || 1, so quantity 0 becomes 1
            // This is expected behavior - quantity 0 shouldn't exist in a deck in practice
            expect(result.cards.characters).toBeDefined();
            expect(Array.isArray(result.cards.characters)).toBe(true);
            expect(result.cards.characters.length).toBeGreaterThanOrEqual(1);
        });

        it('should handle cards with undefined quantity', async () => {
            mockDeckEditorCards = [
                { cardId: 'char1', type: 'character' } // No quantity field
            ];

            mockAvailableCardsMap.set('char1', { name: 'Character' });

            (window as any).deckEditorCards = mockDeckEditorCards;
            (window as any).availableCardsMap = mockAvailableCardsMap;
            const promise = exportDeckAsJson();
            await jest.runAllTimersAsync();
            await promise;

            const result = getExportedJson();

            // Character should be in array (could be string or object for reserve)
            expect(result.cards.characters).toBeDefined();
            expect(Array.isArray(result.cards.characters)).toBe(true);
        });

        it('should handle availableCardsMap not loaded initially', async () => {
            mockLoadAvailableCards.mockImplementation(() => {
                // Simulate loading cards after delay
                setTimeout(() => {
                    mockAvailableCardsMap.set('char1', { name: 'Character' });
                    (window as any).availableCardsMap = mockAvailableCardsMap;
                }, 500);
            });

            mockDeckEditorCards = [{ cardId: 'char1', type: 'character', quantity: 1 }];
            (window as any).deckEditorCards = mockDeckEditorCards;
            (window as any).availableCardsMap = new Map(); // Start empty
            const promise = exportDeckAsJson();
            await jest.runAllTimersAsync();
            await promise;

            const result = getExportedJson();

            expect(mockLoadAvailableCards).toHaveBeenCalled();
            // Note: In real scenario, cards might still not be loaded after 1 second
            // This test verifies the loading attempt is made
        });

        it('should handle validation errors gracefully', async () => {
            mockValidateDeck.mockReturnValue({
                errors: ['Test validation error'],
                warnings: []
            });

            mockDeckEditorCards = [{ cardId: 'char1', type: 'character', quantity: 1 }];
            mockAvailableCardsMap.set('char1', { name: 'Character' });

            (window as any).deckEditorCards = mockDeckEditorCards;
            (window as any).availableCardsMap = mockAvailableCardsMap;
            const promise = exportDeckAsJson();
            await jest.runAllTimersAsync();
            await promise;

            const result = getExportedJson();

            expect(result.legal).toBe(false);
        });

        it('should handle limited deck flag', async () => {
            (window as any).isDeckLimited = true;

            // Need at least one card in the map to avoid early return
            mockAvailableCardsMap.set('char1', { name: 'Character' });
            
            mockDeckEditorCards = [];
            (window as any).deckEditorCards = mockDeckEditorCards;
            (window as any).availableCardsMap = mockAvailableCardsMap;
            const promise = exportDeckAsJson();
            await jest.runAllTimersAsync();
            await promise;

            const result = getExportedJson();

            expect(result.limited).toBe(true);
        });

        it('should calculate max stats correctly with multiple characters', async () => {
            mockDeckEditorCards = [
                { cardId: 'char1', type: 'character', quantity: 1 },
                { cardId: 'char2', type: 'character', quantity: 1 },
                { cardId: 'char3', type: 'character', quantity: 1 }
            ];

            mockAvailableCardsMap.set('char1', { name: 'Char 1', energy: 3, combat: 5, brute_force: 2, intelligence: 4 });
            mockAvailableCardsMap.set('char2', { name: 'Char 2', energy: 6, combat: 3, brute_force: 7, intelligence: 2 });
            mockAvailableCardsMap.set('char3', { name: 'Char 3', energy: 4, combat: 4, brute_force: 3, intelligence: 8 });

            (window as any).deckEditorCards = mockDeckEditorCards;
            (window as any).availableCardsMap = mockAvailableCardsMap;
            const promise = exportDeckAsJson();
            await jest.runAllTimersAsync();
            await promise;

            const result = getExportedJson();

            expect(result.max_energy).toBe(6);
            expect(result.max_combat).toBe(5);
            expect(result.max_brute_force).toBe(7);
            expect(result.max_intelligence).toBe(8);
        });

        it('should exclude mission, character, and location from total_cards count', async () => {
            mockDeckEditorCards = [
                { cardId: 'char1', type: 'character', quantity: 1 },
                { cardId: 'mission1', type: 'mission', quantity: 1 },
                { cardId: 'loc1', type: 'location', quantity: 1 },
                { cardId: 'power1', type: 'power', quantity: 3 },
                { cardId: 'special1', type: 'special', quantity: 2 }
            ];

            mockAvailableCardsMap.set('char1', { name: 'Character' });
            mockAvailableCardsMap.set('mission1', { name: 'Mission' });
            mockAvailableCardsMap.set('loc1', { name: 'Location' });
            mockAvailableCardsMap.set('power1', { name: 'Power' });
            mockAvailableCardsMap.set('special1', { name: 'Special', character_name: 'Test' });

            (window as any).deckEditorCards = mockDeckEditorCards;
            (window as any).availableCardsMap = mockAvailableCardsMap;
            const promise = exportDeckAsJson();
            await jest.runAllTimersAsync();
            await promise;

            const result = getExportedJson();

            // Should only count power (3) + special (2) = 5
            // Excludes character (1), mission (1), location (1)
            expect(result.total_cards).toBe(5);
        });

        it('should handle characters with missing stats', async () => {
            mockDeckEditorCards = [
                { cardId: 'char1', type: 'character', quantity: 1 }
            ];

            mockAvailableCardsMap.set('char1', { name: 'Character' }); // No stats

            (window as any).deckEditorCards = mockDeckEditorCards;
            (window as any).availableCardsMap = mockAvailableCardsMap;
            const promise = exportDeckAsJson();
            await jest.runAllTimersAsync();
            await promise;

            const result = getExportedJson();

            expect(result.max_energy).toBe(0);
            expect(result.max_combat).toBe(0);
            expect(result.max_brute_force).toBe(0);
            expect(result.max_intelligence).toBe(0);
        });

        it('should handle location with missing threat_level', async () => {
            mockDeckEditorCards = [
                { cardId: 'loc1', type: 'location', quantity: 1 }
            ];

            mockAvailableCardsMap.set('loc1', { name: 'Location' }); // No threat_level

            (window as any).deckEditorCards = mockDeckEditorCards;
            (window as any).availableCardsMap = mockAvailableCardsMap;
            const promise = exportDeckAsJson();
            await jest.runAllTimersAsync();
            await promise;

            const result = getExportedJson();

            expect(result.total_threat).toBe(0);
        });

        it('should calculate icon totals correctly', async () => {
            mockDeckEditorCards = [
                { cardId: 'power1', type: 'power', quantity: 2 },
                { cardId: 'power2', type: 'power', quantity: 1 },
                { cardId: 'special1', type: 'special', quantity: 3 },
                { cardId: 'teamwork1', type: 'teamwork', quantity: 1 },
                { cardId: 'aspect1', type: 'aspect', quantity: 1 }
            ];

            mockAvailableCardsMap.set('power1', { name: 'Energy Power', power_type: 'Energy' });
            mockAvailableCardsMap.set('power2', { name: 'Multi Power', power_type: 'Multi-Power' });
            mockAvailableCardsMap.set('special1', { name: 'Special Card', icons: ['Energy', 'Combat'] });
            mockAvailableCardsMap.set('teamwork1', { name: '6 Combat', followup_attack_types: 'Brute Force + Energy', to_use: '6 Combat' });
            mockAvailableCardsMap.set('aspect1', { name: 'Aspect Card', icons: ['Brute Force'] });

            (window as any).deckEditorCards = mockDeckEditorCards;
            (window as any).availableCardsMap = mockAvailableCardsMap;
            const promise = exportDeckAsJson();
            await jest.runAllTimersAsync();
            await promise;

            const result = getExportedJson();

            // Energy: power1 (2x Energy) + power2 multi (1x all types) + special1 (3x Energy) = 2+1+3 = 6
            // Combat: power2 multi (1x) + special1 (3x Combat) + teamwork1 (1x Combat from to_use: "6 Combat") = 1+3+1 = 5
            // Brute Force: power2 multi (1x) + aspect1 (1x) = 1+1 = 2
            // Intelligence: power2 multi (1x) = 1
            expect(result.total_energy_icons).toBe(6);
            expect(result.total_combat_icons).toBe(5);
            expect(result.total_brute_force_icons).toBe(2);
            expect(result.total_intelligence_icons).toBe(1);
        });

        it('should handle icon totals with cards that have no icons', async () => {
            mockDeckEditorCards = [
                { cardId: 'power1', type: 'power', quantity: 1 },
                { cardId: 'special1', type: 'special', quantity: 1 }
            ];

            mockAvailableCardsMap.set('power1', { name: 'Any Power', power_type: 'Any-Power' });
            mockAvailableCardsMap.set('special1', { name: 'Special Card', icons: [] }); // No icons

            (window as any).deckEditorCards = mockDeckEditorCards;
            (window as any).availableCardsMap = mockAvailableCardsMap;
            const promise = exportDeckAsJson();
            await jest.runAllTimersAsync();
            await promise;

            const result = getExportedJson();

            expect(result.total_energy_icons).toBe(0);
            expect(result.total_combat_icons).toBe(0);
            expect(result.total_brute_force_icons).toBe(0);
            expect(result.total_intelligence_icons).toBe(0);
        });
    });

    describe('Real-World Scenarios', () => {
        it('should export a complete deck with all card types and groupings', async () => {
            // Simulate a real deck export
            mockDeckEditorCards = [
                // Characters
                { cardId: 'nemo', type: 'character', quantity: 1 },
                { cardId: 'monte', type: 'character', quantity: 1 },
                { cardId: 'korak', type: 'character', quantity: 1 },
                { cardId: 'mob', type: 'character', quantity: 1 },
                // Special cards (multiple characters)
                { cardId: 'special1', type: 'special', quantity: 1 },
                { cardId: 'special2', type: 'special', quantity: 6 },
                { cardId: 'special3', type: 'special', quantity: 1 },
                // Missions (multiple sets)
                { cardId: 'mission1', type: 'mission', quantity: 1 },
                { cardId: 'mission2', type: 'mission', quantity: 1 },
                // Events
                { cardId: 'event1', type: 'event', quantity: 1 },
                // Advanced universe
                { cardId: 'adv1', type: 'advanced-universe', quantity: 3 },
                // Power cards
                { cardId: 'power1', type: 'power', quantity: 23 }
            ];

            mockAvailableCardsMap.set('nemo', { name: 'Captain Nemo', energy: 4, combat: 6, brute_force: 7, intelligence: 7, threat_level: 19 });
            mockAvailableCardsMap.set('monte', { name: 'Count of Monte Cristo', energy: 3, combat: 5, brute_force: 6, intelligence: 8, threat_level: 18 });
            mockAvailableCardsMap.set('korak', { name: 'Korak', energy: 2, combat: 4, brute_force: 5, intelligence: 3, threat_level: 17 });
            mockAvailableCardsMap.set('mob', { name: 'Angry Mob (Industrial Age)', energy: 1, combat: 2, brute_force: 1, intelligence: 1, threat_level: 16 });
            
            mockAvailableCardsMap.set('special1', { name: 'The Gemini', character_name: 'Any Character' });
            mockAvailableCardsMap.set('special2', { name: 'Preternatural Healing', character_name: 'Count of Monte Cristo' });
            mockAvailableCardsMap.set('special3', { name: 'The Nautilus', character_name: 'Captain Nemo' });
            
            mockAvailableCardsMap.set('mission1', { name: 'Battle at Olympus', mission_set: 'Battle at Olympus' });
            mockAvailableCardsMap.set('mission2', { name: 'Divine Retribution', mission_set: 'Divine Retribution' });
            
            mockAvailableCardsMap.set('event1', { name: 'Getting Our Hands Dirty', mission_set: 'Getting Our Hands Dirty' });
            
            mockAvailableCardsMap.set('adv1', { name: 'Shards of the Staff', character: 'Ra' });
            
            mockAvailableCardsMap.set('power1', { name: 'Test Power', value: 5, power_type: 'Energy' });

            (window as any).deckEditorCards = mockDeckEditorCards;
            (window as any).availableCardsMap = mockAvailableCardsMap;
            const promise = exportDeckAsJson();
            await jest.runAllTimersAsync();
            await promise;

            const result = getExportedJson();

            // Verify structure
            expect(result).toBeDefined();
            expect(result.cards).toBeDefined();

            // Verify special cards grouping
            expect(result.cards.special_cards['Any Character']).toEqual(['The Gemini']);
            expect(result.cards.special_cards['Count of Monte Cristo']).toHaveLength(6);
            expect(result.cards.special_cards['Captain Nemo']).toEqual(['The Nautilus']);

            // Verify missions grouping
            expect(result.cards.missions['Battle at Olympus']).toEqual(['Battle at Olympus']);
            expect(result.cards.missions['Divine Retribution']).toEqual(['Divine Retribution']);

            // Verify events grouping
            expect(result.cards.events['Getting Our Hands Dirty']).toEqual(['Getting Our Hands Dirty']);

            // Verify advanced universe grouping
            expect(result.cards.advanced_universe['Ra']).toHaveLength(3);

            // Verify threat calculation (characters only in this case)
            const expectedThreat = 19 + 18 + 17 + 16; // 70
            expect(result.total_threat).toBe(expectedThreat);

            // Verify max stats
            expect(result.max_energy).toBe(4);
            expect(result.max_combat).toBe(6);
            expect(result.max_brute_force).toBe(7);
            expect(result.max_intelligence).toBe(8);

            // Verify total cards (excludes characters, missions, locations)
            // special (8) + event (1) + adv (3) + power (23) = 35
            expect(result.total_cards).toBe(35);
        });
    });

});
