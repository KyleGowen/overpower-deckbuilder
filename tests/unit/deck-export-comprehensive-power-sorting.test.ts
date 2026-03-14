/** @jest-environment jsdom */

/**
 * Deck Export - Power Card Sorting
 * Part of comprehensive deck-export tests; uses deckExportTestHelpers.
 */

import {
    setupDeckExportBootstrap,
    teardownDeckExportMocks
} from '../helpers/deckExportTestHelpers';

describe('Deck Export Component - Power Card Sorting', () => {
    let exportDeckAsJson: () => Promise<void>;
    let getExportedJson: () => any;
    let mockDeckEditorCards: any[];
    let mockAvailableCardsMap: Map<string, any>;

    beforeEach(() => {
        jest.useFakeTimers();
        const setup = setupDeckExportBootstrap();
        exportDeckAsJson = setup.exportDeckAsJson;
        getExportedJson = setup.getExportedJson;
        mockDeckEditorCards = (window as any).deckEditorCards;
        mockAvailableCardsMap = (window as any).availableCardsMap;
    });

    afterEach(() => {
        teardownDeckExportMocks(window);
        jest.useRealTimers();
    });

    describe('Power Card Sorting', () => {
        it('should sort power cards by value ascending, then by type order', async () => {
            mockDeckEditorCards = [
                { cardId: 'power1', type: 'power', quantity: 1 },
                { cardId: 'power2', type: 'power', quantity: 1 },
                { cardId: 'power3', type: 'power', quantity: 1 },
                { cardId: 'power4', type: 'power', quantity: 1 },
                { cardId: 'power5', type: 'power', quantity: 1 },
                { cardId: 'power6', type: 'power', quantity: 1 },
                { cardId: 'power7', type: 'power', quantity: 1 },
                { cardId: 'power8', type: 'power', quantity: 1 }
            ];

            // Add power cards in mixed order
            mockAvailableCardsMap.set('power1', { name: '5 - Any-Power' });
            mockAvailableCardsMap.set('power2', { name: '3 - Energy' });
            mockAvailableCardsMap.set('power3', { name: '5 - Combat' });
            mockAvailableCardsMap.set('power4', { name: '3 - Multi Power' });
            mockAvailableCardsMap.set('power5', { name: '5 - Energy' });
            mockAvailableCardsMap.set('power6', { name: '3 - Brute Force' });
            mockAvailableCardsMap.set('power7', { name: '3 - Intelligence' });
            mockAvailableCardsMap.set('power8', { name: '1 - Combat' });

            (window as any).deckEditorCards = mockDeckEditorCards;
            (window as any).availableCardsMap = mockAvailableCardsMap;
            const promise = exportDeckAsJson();
            await jest.runAllTimersAsync();
            await promise;

            const result = getExportedJson();

            // Expected order: by value (1, 3, 3, 3, 3, 5, 5, 5), then by type
            // Value 1: Combat
            // Value 3: Energy, Brute Force, Intelligence, Multi Power (in that order)
            // Value 5: Energy, Combat, Any-Power (in that order)
            expect(result.cards.power_cards).toEqual([
                '1 - Combat',
                '3 - Energy',
                '3 - Brute Force',
                '3 - Intelligence',
                '3 - Multi Power',
                '5 - Energy',
                '5 - Combat',
                '5 - Any-Power'
            ]);
        });

        it('should handle multiple quantities of same power card correctly', async () => {
            mockDeckEditorCards = [
                { cardId: 'power1', type: 'power', quantity: 2 },
                { cardId: 'power2', type: 'power', quantity: 3 },
                { cardId: 'power3', type: 'power', quantity: 1 }
            ];

            mockAvailableCardsMap.set('power1', { name: '5 - Energy' });
            mockAvailableCardsMap.set('power2', { name: '3 - Combat' });
            mockAvailableCardsMap.set('power3', { name: '8 - Energy' });

            (window as any).deckEditorCards = mockDeckEditorCards;
            (window as any).availableCardsMap = mockAvailableCardsMap;
            const promise = exportDeckAsJson();
            await jest.runAllTimersAsync();
            await promise;

            const result = getExportedJson();

            // Should be sorted: 3 Combat (x3), 5 Energy (x2), 8 Energy (x1)
            expect(result.cards.power_cards).toEqual([
                '3 - Combat',
                '3 - Combat',
                '3 - Combat',
                '5 - Energy',
                '5 - Energy',
                '8 - Energy'
            ]);
        });

        it('should handle power cards with different type format variations', async () => {
            mockDeckEditorCards = [
                { cardId: 'power1', type: 'power', quantity: 1 },
                { cardId: 'power2', type: 'power', quantity: 1 },
                { cardId: 'power3', type: 'power', quantity: 1 }
            ];

            mockAvailableCardsMap.set('power1', { name: '5 - Multi-Power' }); // With hyphen
            mockAvailableCardsMap.set('power2', { name: '5 - Multi Power' }); // Without hyphen
            mockAvailableCardsMap.set('power3', { name: '5 - Energy' });

            (window as any).deckEditorCards = mockDeckEditorCards;
            (window as any).availableCardsMap = mockAvailableCardsMap;
            const promise = exportDeckAsJson();
            await jest.runAllTimersAsync();
            await promise;

            const result = getExportedJson();

            // Should sort: Energy (1), then Multi Power/Multi-Power (both order 5)
            expect(result.cards.power_cards[0]).toBe('5 - Energy');
            expect(result.cards.power_cards).toHaveLength(3);
        });

        it('should correctly order all power card types when same value', async () => {
            mockDeckEditorCards = [
                { cardId: 'power1', type: 'power', quantity: 1 },
                { cardId: 'power2', type: 'power', quantity: 1 },
                { cardId: 'power3', type: 'power', quantity: 1 },
                { cardId: 'power4', type: 'power', quantity: 1 },
                { cardId: 'power5', type: 'power', quantity: 1 },
                { cardId: 'power6', type: 'power', quantity: 1 }
            ];

            // All value 5, different types - should order: Energy, Combat, Brute Force, Intelligence, Multi, Any-Power
            mockAvailableCardsMap.set('power1', { name: '5 - Any-Power' });
            mockAvailableCardsMap.set('power2', { name: '5 - Energy' });
            mockAvailableCardsMap.set('power3', { name: '5 - Combat' });
            mockAvailableCardsMap.set('power4', { name: '5 - Brute Force' });
            mockAvailableCardsMap.set('power5', { name: '5 - Intelligence' });
            mockAvailableCardsMap.set('power6', { name: '5 - Multi Power' });

            (window as any).deckEditorCards = mockDeckEditorCards;
            (window as any).availableCardsMap = mockAvailableCardsMap;
            const promise = exportDeckAsJson();
            await jest.runAllTimersAsync();
            await promise;

            const result = getExportedJson();

            // Expected order: Energy, Combat, Brute Force, Intelligence, Multi Power, Any-Power
            expect(result.cards.power_cards).toEqual([
                '5 - Energy',
                '5 - Combat',
                '5 - Brute Force',
                '5 - Intelligence',
                '5 - Multi Power',
                '5 - Any-Power'
            ]);
        });

        it('should handle real-world power card list from user example', async () => {
            mockDeckEditorCards = [
                { cardId: 'p1', type: 'power', quantity: 1 },
                { cardId: 'p2', type: 'power', quantity: 1 },
                { cardId: 'p3', type: 'power', quantity: 1 },
                { cardId: 'p4', type: 'power', quantity: 1 },
                { cardId: 'p5', type: 'power', quantity: 1 },
                { cardId: 'p6', type: 'power', quantity: 1 },
                { cardId: 'p7', type: 'power', quantity: 1 },
                { cardId: 'p8', type: 'power', quantity: 1 },
                { cardId: 'p9', type: 'power', quantity: 1 },
                { cardId: 'p10', type: 'power', quantity: 1 },
                { cardId: 'p11', type: 'power', quantity: 1 },
                { cardId: 'p12', type: 'power', quantity: 1 },
                { cardId: 'p13', type: 'power', quantity: 1 },
                { cardId: 'p14', type: 'power', quantity: 1 },
                { cardId: 'p15', type: 'power', quantity: 1 },
                { cardId: 'p16', type: 'power', quantity: 1 },
                { cardId: 'p17', type: 'power', quantity: 1 },
                { cardId: 'p18', type: 'power', quantity: 1 },
                { cardId: 'p19', type: 'power', quantity: 1 },
                { cardId: 'p20', type: 'power', quantity: 1 },
                { cardId: 'p21', type: 'power', quantity: 1 },
                { cardId: 'p22', type: 'power', quantity: 1 },
                { cardId: 'p23', type: 'power', quantity: 1 },
                { cardId: 'p24', type: 'power', quantity: 1 }
            ];

            // User's original unsorted list
            mockAvailableCardsMap.set('p1', { name: '5 - Any-Power' });
            mockAvailableCardsMap.set('p2', { name: '6 - Any-Power' });
            mockAvailableCardsMap.set('p3', { name: '8 - Any-Power' });
            mockAvailableCardsMap.set('p4', { name: '7 - Any-Power' });
            mockAvailableCardsMap.set('p5', { name: '3 - Multi Power' });
            mockAvailableCardsMap.set('p6', { name: '4 - Multi Power' });
            mockAvailableCardsMap.set('p7', { name: '5 - Multi Power' });
            mockAvailableCardsMap.set('p8', { name: '6 - Intelligence' });
            mockAvailableCardsMap.set('p9', { name: '3 - Intelligence' });
            mockAvailableCardsMap.set('p10', { name: '2 - Intelligence' });
            mockAvailableCardsMap.set('p11', { name: '2 - Brute Force' });
            mockAvailableCardsMap.set('p12', { name: '6 - Brute Force' });
            mockAvailableCardsMap.set('p13', { name: '8 - Brute Force' });
            mockAvailableCardsMap.set('p14', { name: '8 - Combat' });
            mockAvailableCardsMap.set('p15', { name: '4 - Combat' });
            mockAvailableCardsMap.set('p16', { name: '1 - Combat' });
            mockAvailableCardsMap.set('p17', { name: '4 - Energy' });
            mockAvailableCardsMap.set('p18', { name: '8 - Energy' });
            mockAvailableCardsMap.set('p19', { name: '5 - Energy' });
            mockAvailableCardsMap.set('p20', { name: '3 - Energy' });
            mockAvailableCardsMap.set('p21', { name: '2 - Energy' });
            mockAvailableCardsMap.set('p22', { name: '2 - Energy' });
            mockAvailableCardsMap.set('p23', { name: '2 - Energy' });
            mockAvailableCardsMap.set('p24', { name: '2 - Energy' });

            (window as any).deckEditorCards = mockDeckEditorCards;
            (window as any).availableCardsMap = mockAvailableCardsMap;
            const promise = exportDeckAsJson();
            await jest.runAllTimersAsync();
            await promise;

            const result = getExportedJson();

            // Expected sorted order: by value (1, 2, 3, 4, 5, 6, 7, 8), then by type
            expect(result.cards.power_cards).toEqual([
                '1 - Combat',
                '2 - Energy',
                '2 - Energy',
                '2 - Energy',
                '2 - Energy',
                '2 - Brute Force',
                '2 - Intelligence',
                '3 - Energy',
                '3 - Intelligence',
                '3 - Multi Power',
                '4 - Energy',
                '4 - Combat',
                '4 - Multi Power',
                '5 - Energy',
                '5 - Multi Power',
                '5 - Any-Power',
                '6 - Brute Force',
                '6 - Intelligence',
                '6 - Any-Power',
                '7 - Any-Power',
                '8 - Energy',
                '8 - Combat',
                '8 - Brute Force',
                '8 - Any-Power'
            ]);
        });

        it('should handle empty power cards array', async () => {
            mockDeckEditorCards = [
                { cardId: 'char1', type: 'character', quantity: 1 }
            ];

            mockAvailableCardsMap.set('char1', { name: 'Test Character', threat_level: 18 });
            
            (window as any).deckEditorCards = mockDeckEditorCards;
            (window as any).availableCardsMap = mockAvailableCardsMap;
            const promise = exportDeckAsJson();
            await jest.runAllTimersAsync();
            await promise;

            const result = getExportedJson();

            expect(result.cards.power_cards).toEqual([]);
            expect(Array.isArray(result.cards.power_cards)).toBe(true);
        });

        it('should handle single power card', async () => {
            mockDeckEditorCards = [
                { cardId: 'power1', type: 'power', quantity: 1 }
            ];

            mockAvailableCardsMap.set('power1', { name: '5 - Energy' });

            (window as any).deckEditorCards = mockDeckEditorCards;
            (window as any).availableCardsMap = mockAvailableCardsMap;
            const promise = exportDeckAsJson();
            await jest.runAllTimersAsync();
            await promise;

            const result = getExportedJson();

            expect(result.cards.power_cards).toEqual(['5 - Energy']);
        });

        it('should handle power cards with very high values', async () => {
            mockDeckEditorCards = [
                { cardId: 'power1', type: 'power', quantity: 1 },
                { cardId: 'power2', type: 'power', quantity: 1 },
                { cardId: 'power3', type: 'power', quantity: 1 }
            ];

            mockAvailableCardsMap.set('power1', { name: '99 - Energy' });
            mockAvailableCardsMap.set('power2', { name: '10 - Combat' });
            mockAvailableCardsMap.set('power3', { name: '100 - Any-Power' });

            (window as any).deckEditorCards = mockDeckEditorCards;
            (window as any).availableCardsMap = mockAvailableCardsMap;
            const promise = exportDeckAsJson();
            await jest.runAllTimersAsync();
            await promise;

            const result = getExportedJson();

            expect(result.cards.power_cards).toEqual([
                '10 - Combat',
                '99 - Energy',
                '100 - Any-Power'
            ]);
        });

        it('should handle power cards with value 1 correctly', async () => {
            mockDeckEditorCards = [
                { cardId: 'power1', type: 'power', quantity: 1 },
                { cardId: 'power2', type: 'power', quantity: 1 },
                { cardId: 'power3', type: 'power', quantity: 1 }
            ];

            mockAvailableCardsMap.set('power1', { name: '1 - Any-Power' });
            mockAvailableCardsMap.set('power2', { name: '1 - Energy' });
            mockAvailableCardsMap.set('power3', { name: '1 - Combat' });

            (window as any).deckEditorCards = mockDeckEditorCards;
            (window as any).availableCardsMap = mockAvailableCardsMap;
            const promise = exportDeckAsJson();
            await jest.runAllTimersAsync();
            await promise;

            const result = getExportedJson();

            expect(result.cards.power_cards).toEqual([
                '1 - Energy',
                '1 - Combat',
                '1 - Any-Power'
            ]);
        });

        it('should handle power cards with unexpected format gracefully', async () => {
            mockDeckEditorCards = [
                { cardId: 'power1', type: 'power', quantity: 1 },
                { cardId: 'power2', type: 'power', quantity: 1 },
                { cardId: 'power3', type: 'power', quantity: 1 }
            ];

            mockAvailableCardsMap.set('power1', { name: '5 - Energy' });
            mockAvailableCardsMap.set('power2', { name: 'Invalid Format' }); // Doesn't match pattern
            mockAvailableCardsMap.set('power3', { name: '3 - Combat' });

            (window as any).deckEditorCards = mockDeckEditorCards;
            (window as any).availableCardsMap = mockAvailableCardsMap;
            const promise = exportDeckAsJson();
            await jest.runAllTimersAsync();
            await promise;

            const result = getExportedJson();

            // Invalid format should be sorted last (value 999), but should still be included
            expect(result.cards.power_cards).toContain('3 - Combat');
            expect(result.cards.power_cards).toContain('5 - Energy');
            expect(result.cards.power_cards).toContain('Invalid Format');
            // Invalid format should come after valid ones
            const invalidIndex = result.cards.power_cards.indexOf('Invalid Format');
            const validIndices = [
                result.cards.power_cards.indexOf('3 - Combat'),
                result.cards.power_cards.indexOf('5 - Energy')
            ];
            expect(invalidIndex).toBeGreaterThan(Math.max(...validIndices));
        });

        it('should maintain stable sort for cards with same value and type', async () => {
            mockDeckEditorCards = [
                { cardId: 'power1', type: 'power', quantity: 1 },
                { cardId: 'power2', type: 'power', quantity: 1 },
                { cardId: 'power3', type: 'power', quantity: 1 }
            ];

            // All same value and type - should maintain insertion order
            mockAvailableCardsMap.set('power1', { name: '5 - Energy' });
            mockAvailableCardsMap.set('power2', { name: '5 - Energy' });
            mockAvailableCardsMap.set('power3', { name: '5 - Energy' });

            (window as any).deckEditorCards = mockDeckEditorCards;
            (window as any).availableCardsMap = mockAvailableCardsMap;
            const promise = exportDeckAsJson();
            await jest.runAllTimersAsync();
            await promise;

            const result = getExportedJson();

            // All should be present and sorted together
            expect(result.cards.power_cards).toEqual([
                '5 - Energy',
                '5 - Energy',
                '5 - Energy'
            ]);
        });

        it('should handle Any Power format variations', async () => {
            mockDeckEditorCards = [
                { cardId: 'power1', type: 'power', quantity: 1 },
                { cardId: 'power2', type: 'power', quantity: 1 },
                { cardId: 'power3', type: 'power', quantity: 1 }
            ];

            mockAvailableCardsMap.set('power1', { name: '5 - Any-Power' }); // With hyphen
            mockAvailableCardsMap.set('power2', { name: '5 - Any Power' }); // Without hyphen
            mockAvailableCardsMap.set('power3', { name: '5 - Energy' });

            (window as any).deckEditorCards = mockDeckEditorCards;
            (window as any).availableCardsMap = mockAvailableCardsMap;
            const promise = exportDeckAsJson();
            await jest.runAllTimersAsync();
            await promise;

            const result = getExportedJson();

            // Both Any-Power and Any Power should be treated the same (order 6)
            expect(result.cards.power_cards[0]).toBe('5 - Energy');
            // Both Any variations should come after Energy
            expect(result.cards.power_cards.filter((c: string) => c.includes('Any'))).toHaveLength(2);
        });

        it('should handle large quantities with mixed values and types', async () => {
            mockDeckEditorCards = [
                { cardId: 'power1', type: 'power', quantity: 4 }, // 4x "2 - Energy"
                { cardId: 'power2', type: 'power', quantity: 2 }, // 2x "2 - Combat"
                { cardId: 'power3', type: 'power', quantity: 3 }, // 3x "2 - Brute Force"
                { cardId: 'power4', type: 'power', quantity: 1 }   // 1x "2 - Intelligence"
            ];

            mockAvailableCardsMap.set('power1', { name: '2 - Energy' });
            mockAvailableCardsMap.set('power2', { name: '2 - Combat' });
            mockAvailableCardsMap.set('power3', { name: '2 - Brute Force' });
            mockAvailableCardsMap.set('power4', { name: '2 - Intelligence' });

            (window as any).deckEditorCards = mockDeckEditorCards;
            (window as any).availableCardsMap = mockAvailableCardsMap;
            const promise = exportDeckAsJson();
            await jest.runAllTimersAsync();
            await promise;

            const result = getExportedJson();

            // Should be sorted: Energy (x4), Combat (x2), Brute Force (x3), Intelligence (x1)
            expect(result.cards.power_cards).toEqual([
                '2 - Energy',
                '2 - Energy',
                '2 - Energy',
                '2 - Energy',
                '2 - Combat',
                '2 - Combat',
                '2 - Brute Force',
                '2 - Brute Force',
                '2 - Brute Force',
                '2 - Intelligence'
            ]);
        });

        it('should handle whitespace variations in power card names', async () => {
            mockDeckEditorCards = [
                { cardId: 'power1', type: 'power', quantity: 1 },
                { cardId: 'power2', type: 'power', quantity: 1 },
                { cardId: 'power3', type: 'power', quantity: 1 }
            ];

            mockAvailableCardsMap.set('power1', { name: '5 -Energy' }); // No space before dash
            mockAvailableCardsMap.set('power2', { name: '5- Energy' }); // No space after dash
            mockAvailableCardsMap.set('power3', { name: '5  -  Energy' }); // Multiple spaces

            (window as any).deckEditorCards = mockDeckEditorCards;
            (window as any).availableCardsMap = mockAvailableCardsMap;
            const promise = exportDeckAsJson();
            await jest.runAllTimersAsync();
            await promise;

            const result = getExportedJson();

            // Regex handles whitespace variations with \s*
            expect(result.cards.power_cards).toHaveLength(3);
            // All should parse correctly and sort together
            expect(result.cards.power_cards.every((card: string) => card.includes('5'))).toBe(true);
        });
    });

});
