/** @jest-environment jsdom */

/**
 * Deck Export - Special Card Attributes (reserve_character, cataclysm, assist, ambush)
 * Part of comprehensive deck-export tests; uses deckExportTestHelpers.
 */

import {
    setupDeckExportBootstrap,
    teardownDeckExportMocks
} from '../helpers/deckExportTestHelpers';

describe('Deck Export Component - Special Card Attributes', () => {
    let exportDeckAsJson: () => Promise<void>;
    let getExportedJson: () => any;
    let mockDeckEditorCards: any[];
    let mockAvailableCardsMap: Map<string, any>;
    let mockCurrentDeckData: any;

    beforeEach(() => {
        jest.useFakeTimers();
        const setup = setupDeckExportBootstrap();
        exportDeckAsJson = setup.exportDeckAsJson;
        getExportedJson = setup.getExportedJson;
        mockDeckEditorCards = (window as any).deckEditorCards;
        mockAvailableCardsMap = (window as any).availableCardsMap;
        mockCurrentDeckData = (window as any)._currentDeckData;
    });

    afterEach(() => {
        teardownDeckExportMocks(window);
        jest.useRealTimers();
    });

    describe('Special Card Attributes - Root Level Fields', () => {
        it('should export reserve_character when present', async () => {
            mockDeckEditorCards = [
                { cardId: 'char1', type: 'character', quantity: 1 },
                { cardId: 'char2', type: 'character', quantity: 1 }
            ];

            mockAvailableCardsMap.set('char1', { name: 'Captain Nemo', threat_level: 19 });
            mockAvailableCardsMap.set('char2', { name: 'Count of Monte Cristo', threat_level: 18 });

            mockCurrentDeckData = {
                metadata: {
                    reserve_character: 'char1'
                }
            };
            (window as any).currentDeckData = mockCurrentDeckData;
            (window as any).deckEditorCards = mockDeckEditorCards;
            (window as any).availableCardsMap = mockAvailableCardsMap;
            const promise = exportDeckAsJson();
            await jest.runAllTimersAsync();
            await promise;

            const result = getExportedJson();

            expect(result.reserve_character).toBe('Captain Nemo');
            expect(typeof result.reserve_character).toBe('string');
        });

        it('should export reserve_character as null when not present', async () => {
            mockDeckEditorCards = [
                { cardId: 'char1', type: 'character', quantity: 1 }
            ];

            mockAvailableCardsMap.set('char1', { name: 'Captain Nemo', threat_level: 19 });

            mockCurrentDeckData = {
                metadata: {}
            };
            (window as any).currentDeckData = mockCurrentDeckData;
            (window as any).deckEditorCards = mockDeckEditorCards;
            (window as any).availableCardsMap = mockAvailableCardsMap;
            const promise = exportDeckAsJson();
            await jest.runAllTimersAsync();
            await promise;

            const result = getExportedJson();

            expect(result.reserve_character).toBeNull();
        });

        it('should export reserve_character as null when currentDeckData is null', async () => {
            mockDeckEditorCards = [
                { cardId: 'char1', type: 'character', quantity: 1 }
            ];

            mockAvailableCardsMap.set('char1', { name: 'Captain Nemo', threat_level: 19 });

            (window as any).currentDeckData = null;
            (window as any).deckEditorCards = mockDeckEditorCards;
            (window as any).availableCardsMap = mockAvailableCardsMap;
            const promise = exportDeckAsJson();
            await jest.runAllTimersAsync();
            await promise;

            const result = getExportedJson();

            expect(result.reserve_character).toBeNull();
        });

        it('should export cataclysm_special when present', async () => {
            mockDeckEditorCards = [
                { cardId: 'special1', type: 'special', quantity: 1 },
                { cardId: 'special2', type: 'special', quantity: 1 }
            ];

            mockAvailableCardsMap.set('special1', { name: 'Fairy Protection', is_cataclysm: true, character_name: 'Any Character' });
            mockAvailableCardsMap.set('special2', { name: 'Regular Special', is_cataclysm: false, character_name: 'Any Character' });

            (window as any).deckEditorCards = mockDeckEditorCards;
            (window as any).availableCardsMap = mockAvailableCardsMap;
            const promise = exportDeckAsJson();
            await jest.runAllTimersAsync();
            await promise;

            const result = getExportedJson();

            expect(result.cataclysm_special).toBe('Fairy Protection');
            expect(typeof result.cataclysm_special).toBe('string');
        });

        it('should export cataclysm_special using cataclysm property when is_cataclysm is not present', async () => {
            mockDeckEditorCards = [
                { cardId: 'special1', type: 'special', quantity: 1 }
            ];

            mockAvailableCardsMap.set('special1', { name: 'Fairy Protection', cataclysm: true, character_name: 'Any Character' });

            (window as any).deckEditorCards = mockDeckEditorCards;
            (window as any).availableCardsMap = mockAvailableCardsMap;
            const promise = exportDeckAsJson();
            await jest.runAllTimersAsync();
            await promise;

            const result = getExportedJson();

            expect(result.cataclysm_special).toBe('Fairy Protection');
        });

        it('should export cataclysm_special as null when not present', async () => {
            mockDeckEditorCards = [
                { cardId: 'special1', type: 'special', quantity: 1 }
            ];

            mockAvailableCardsMap.set('special1', { name: 'Regular Special', is_cataclysm: false, character_name: 'Any Character' });

            (window as any).deckEditorCards = mockDeckEditorCards;
            (window as any).availableCardsMap = mockAvailableCardsMap;
            const promise = exportDeckAsJson();
            await jest.runAllTimersAsync();
            await promise;

            const result = getExportedJson();

            expect(result.cataclysm_special).toBeNull();
        });

        it('should take first cataclysm_special when multiple are present', async () => {
            mockDeckEditorCards = [
                { cardId: 'special1', type: 'special', quantity: 1 },
                { cardId: 'special2', type: 'special', quantity: 1 }
            ];

            mockAvailableCardsMap.set('special1', { name: 'First Cataclysm', is_cataclysm: true, character_name: 'Any Character' });
            mockAvailableCardsMap.set('special2', { name: 'Second Cataclysm', is_cataclysm: true, character_name: 'Any Character' });

            (window as any).deckEditorCards = mockDeckEditorCards;
            (window as any).availableCardsMap = mockAvailableCardsMap;
            const promise = exportDeckAsJson();
            await jest.runAllTimersAsync();
            await promise;

            const result = getExportedJson();

            expect(result.cataclysm_special).toBe('First Cataclysm');
        });

        it('should export assist_special when present', async () => {
            mockDeckEditorCards = [
                { cardId: 'special1', type: 'special', quantity: 1 }
            ];

            mockAvailableCardsMap.set('special1', { name: 'Charge into Battle!', is_assist: true, character_name: 'Any Character' });

            (window as any).deckEditorCards = mockDeckEditorCards;
            (window as any).availableCardsMap = mockAvailableCardsMap;
            const promise = exportDeckAsJson();
            await jest.runAllTimersAsync();
            await promise;

            const result = getExportedJson();

            expect(result.assist_special).toBe('Charge into Battle!');
            expect(typeof result.assist_special).toBe('string');
        });

        it('should export assist_special using assist property when is_assist is not present', async () => {
            mockDeckEditorCards = [
                { cardId: 'special1', type: 'special', quantity: 1 }
            ];

            mockAvailableCardsMap.set('special1', { name: 'Charge into Battle!', assist: true, character_name: 'Any Character' });

            (window as any).deckEditorCards = mockDeckEditorCards;
            (window as any).availableCardsMap = mockAvailableCardsMap;
            const promise = exportDeckAsJson();
            await jest.runAllTimersAsync();
            await promise;

            const result = getExportedJson();

            expect(result.assist_special).toBe('Charge into Battle!');
        });

        it('should export assist_special as null when not present', async () => {
            mockDeckEditorCards = [
                { cardId: 'special1', type: 'special', quantity: 1 }
            ];

            mockAvailableCardsMap.set('special1', { name: 'Regular Special', is_assist: false, character_name: 'Any Character' });

            (window as any).deckEditorCards = mockDeckEditorCards;
            (window as any).availableCardsMap = mockAvailableCardsMap;
            const promise = exportDeckAsJson();
            await jest.runAllTimersAsync();
            await promise;

            const result = getExportedJson();

            expect(result.assist_special).toBeNull();
        });

        it('should take first assist_special when multiple are present', async () => {
            mockDeckEditorCards = [
                { cardId: 'special1', type: 'special', quantity: 1 },
                { cardId: 'special2', type: 'special', quantity: 1 }
            ];

            mockAvailableCardsMap.set('special1', { name: 'First Assist', is_assist: true, character_name: 'Any Character' });
            mockAvailableCardsMap.set('special2', { name: 'Second Assist', is_assist: true, character_name: 'Any Character' });

            (window as any).deckEditorCards = mockDeckEditorCards;
            (window as any).availableCardsMap = mockAvailableCardsMap;
            const promise = exportDeckAsJson();
            await jest.runAllTimersAsync();
            await promise;

            const result = getExportedJson();

            expect(result.assist_special).toBe('First Assist');
        });

        it('should export ambush_special when present', async () => {
            mockDeckEditorCards = [
                { cardId: 'special1', type: 'special', quantity: 1 }
            ];

            mockAvailableCardsMap.set('special1', { name: 'Bodhisattva: Enlightened One', is_ambush: true, character_name: 'Any Character' });

            (window as any).deckEditorCards = mockDeckEditorCards;
            (window as any).availableCardsMap = mockAvailableCardsMap;
            const promise = exportDeckAsJson();
            await jest.runAllTimersAsync();
            await promise;

            const result = getExportedJson();

            expect(result.ambush_special).toBe('Bodhisattva: Enlightened One');
            expect(typeof result.ambush_special).toBe('string');
        });

        it('should export ambush_special using ambush property when is_ambush is not present', async () => {
            mockDeckEditorCards = [
                { cardId: 'special1', type: 'special', quantity: 1 }
            ];

            mockAvailableCardsMap.set('special1', { name: 'Bodhisattva: Enlightened One', ambush: true, character_name: 'Any Character' });

            (window as any).deckEditorCards = mockDeckEditorCards;
            (window as any).availableCardsMap = mockAvailableCardsMap;
            const promise = exportDeckAsJson();
            await jest.runAllTimersAsync();
            await promise;

            const result = getExportedJson();

            expect(result.ambush_special).toBe('Bodhisattva: Enlightened One');
        });

        it('should export ambush_special as null when not present', async () => {
            mockDeckEditorCards = [
                { cardId: 'special1', type: 'special', quantity: 1 }
            ];

            mockAvailableCardsMap.set('special1', { name: 'Regular Special', is_ambush: false, character_name: 'Any Character' });

            (window as any).deckEditorCards = mockDeckEditorCards;
            (window as any).availableCardsMap = mockAvailableCardsMap;
            const promise = exportDeckAsJson();
            await jest.runAllTimersAsync();
            await promise;

            const result = getExportedJson();

            expect(result.ambush_special).toBeNull();
        });

        it('should take first ambush_special when multiple are present', async () => {
            mockDeckEditorCards = [
                { cardId: 'special1', type: 'special', quantity: 1 },
                { cardId: 'special2', type: 'special', quantity: 1 }
            ];

            mockAvailableCardsMap.set('special1', { name: 'First Ambush', is_ambush: true, character_name: 'Any Character' });
            mockAvailableCardsMap.set('special2', { name: 'Second Ambush', is_ambush: true, character_name: 'Any Character' });

            (window as any).deckEditorCards = mockDeckEditorCards;
            (window as any).availableCardsMap = mockAvailableCardsMap;
            const promise = exportDeckAsJson();
            await jest.runAllTimersAsync();
            await promise;

            const result = getExportedJson();

            expect(result.ambush_special).toBe('First Ambush');
        });

        it('should export all four attribute types when present', async () => {
            mockDeckEditorCards = [
                { cardId: 'char1', type: 'character', quantity: 1 },
                { cardId: 'special1', type: 'special', quantity: 1 },
                { cardId: 'special2', type: 'special', quantity: 1 },
                { cardId: 'special3', type: 'special', quantity: 1 }
            ];

            mockAvailableCardsMap.set('char1', { name: 'Captain Nemo', threat_level: 19 });
            mockAvailableCardsMap.set('special1', { name: 'Fairy Protection', is_cataclysm: true, character_name: 'Any Character' });
            mockAvailableCardsMap.set('special2', { name: 'Charge into Battle!', is_assist: true, character_name: 'Any Character' });
            mockAvailableCardsMap.set('special3', { name: 'Bodhisattva: Enlightened One', is_ambush: true, character_name: 'Any Character' });

            mockCurrentDeckData = {
                metadata: {
                    reserve_character: 'char1'
                }
            };
            (window as any).currentDeckData = mockCurrentDeckData;
            (window as any).deckEditorCards = mockDeckEditorCards;
            (window as any).availableCardsMap = mockAvailableCardsMap;
            const promise = exportDeckAsJson();
            await jest.runAllTimersAsync();
            await promise;

            const result = getExportedJson();

            expect(result.reserve_character).toBe('Captain Nemo');
            expect(result.cataclysm_special).toBe('Fairy Protection');
            expect(result.assist_special).toBe('Charge into Battle!');
            expect(result.ambush_special).toBe('Bodhisattva: Enlightened One');
        });

        it('should handle special card with multiple types (cataclysm and assist)', async () => {
            mockDeckEditorCards = [
                { cardId: 'special1', type: 'special', quantity: 1 },
                { cardId: 'special2', type: 'special', quantity: 1 }
            ];

            // Card with both cataclysm and assist (should appear in both fields)
            mockAvailableCardsMap.set('special1', { 
                name: 'Multi-Type Card', 
                is_cataclysm: true, 
                is_assist: true,
                character_name: 'Any Character' 
            });
            mockAvailableCardsMap.set('special2', { 
                name: 'Regular Special',
                is_cataclysm: false,
                is_assist: false,
                character_name: 'Any Character'
            });

            (window as any).deckEditorCards = mockDeckEditorCards;
            (window as any).availableCardsMap = mockAvailableCardsMap;
            const promise = exportDeckAsJson();
            await jest.runAllTimersAsync();
            await promise;

            const result = getExportedJson();

            // First card should be captured as cataclysm (checked first in loop)
            expect(result.cataclysm_special).toBe('Multi-Type Card');
            // Since cataclysm is checked first, it will be set as cataclysm_special
            // but assist_special should also be set to the same card
            expect(result.assist_special).toBe('Multi-Type Card');
        });

        it('should handle cards with undefined special properties gracefully', async () => {
            mockDeckEditorCards = [
                { cardId: 'special1', type: 'special', quantity: 1 }
            ];

            mockAvailableCardsMap.set('special1', { 
                name: 'Card Without Properties', 
                character_name: 'Any Character'
                // No is_cataclysm, is_assist, or is_ambush properties
            });

            (window as any).deckEditorCards = mockDeckEditorCards;
            (window as any).availableCardsMap = mockAvailableCardsMap;
            const promise = exportDeckAsJson();
            await jest.runAllTimersAsync();
            await promise;

            const result = getExportedJson();

            expect(result.cataclysm_special).toBeNull();
            expect(result.assist_special).toBeNull();
            expect(result.ambush_special).toBeNull();
        });

        it('should handle cards missing from availableCardsMap gracefully', async () => {
            mockDeckEditorCards = [
                { cardId: 'missing1', type: 'special', quantity: 1 }
            ];

            // Need at least one card in map to avoid early return
            mockAvailableCardsMap.set('dummy', { name: 'Dummy Card' });

            (window as any).deckEditorCards = mockDeckEditorCards;
            (window as any).availableCardsMap = mockAvailableCardsMap;
            const promise = exportDeckAsJson();
            await jest.runAllTimersAsync();
            await promise;

            const result = getExportedJson();

            expect(result.cataclysm_special).toBeNull();
            expect(result.assist_special).toBeNull();
            expect(result.ambush_special).toBeNull();
        });

        it('should handle reserve character missing from availableCardsMap gracefully', async () => {
            mockDeckEditorCards = [
                { cardId: 'missing1', type: 'character', quantity: 1 }
            ];

            // Need at least one card in map to avoid early return
            mockAvailableCardsMap.set('dummy', { name: 'Dummy Card' });

            mockCurrentDeckData = {
                metadata: {
                    reserve_character: 'missing1'
                }
            };
            (window as any).currentDeckData = mockCurrentDeckData;
            (window as any).deckEditorCards = mockDeckEditorCards;
            (window as any).availableCardsMap = mockAvailableCardsMap;
            const promise = exportDeckAsJson();
            await jest.runAllTimersAsync();
            await promise;

            const result = getExportedJson();

            // When card is missing from availableCardsMap, reserve_character is null
            expect(result.reserve_character).toBeNull();
        });

        it('should use card_name if name is not present for special cards', async () => {
            mockDeckEditorCards = [
                { cardId: 'special1', type: 'special', quantity: 1 }
            ];

            // Create object without 'name' property (only card_name)
            const specialCardData: any = { 
                card_name: 'Card With Card Name', 
                is_cataclysm: true,
                character_name: 'Any Character'
            };
            // Explicitly delete name if it exists
            delete specialCardData.name;
            
            mockAvailableCardsMap.set('special1', specialCardData);

            (window as any).deckEditorCards = mockDeckEditorCards;
            (window as any).availableCardsMap = mockAvailableCardsMap;
            const promise = exportDeckAsJson();
            await jest.runAllTimersAsync();
            await promise;

            const result = getExportedJson();

            // The export function uses: availableCard.name || availableCard.card_name || 'Unknown Card'
            // So if name is undefined, it should use card_name
            expect(result.cataclysm_special).toBe('Card With Card Name');
        });

        it('should handle empty deck with all attributes as null', async () => {
            mockDeckEditorCards = [];
            
            // Need at least one card in map to avoid early return
            mockAvailableCardsMap.set('dummy', { name: 'Dummy Card' });

            (window as any).deckEditorCards = mockDeckEditorCards;
            (window as any).availableCardsMap = mockAvailableCardsMap;
            const promise = exportDeckAsJson();
            await jest.runAllTimersAsync();
            await promise;

            const result = getExportedJson();

            expect(result.reserve_character).toBeNull();
            expect(result.cataclysm_special).toBeNull();
            expect(result.assist_special).toBeNull();
            expect(result.ambush_special).toBeNull();
        });
    });

});
