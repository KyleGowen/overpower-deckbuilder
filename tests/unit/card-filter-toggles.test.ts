/** @jest-environment jsdom */

/**
 * Card Filter Toggles - Unit Tests
 *
 * Tests the card-type filter toggle functions extracted from index.html:
 * - applyFilters() for character database filtering
 * - applyLocationFilters() for location threat-level filtering
 * - update*Filter() helper functions
 *
 * Note: applyEventsFilters lives in search-filter-functions.js (unified DBV events filters).
 */

import fs from 'fs';
import path from 'path';

declare global {
    interface Window {
        applyFilters?: () => Promise<void>;
        applyLocationFilters?: () => Promise<void>;
        applyBasicUniverseFilters?: () => Promise<void>;
        updateSpecialCardsFilter?: () => void;
        updateAdvancedUniverseFilter?: () => void;
        updatePowerCardsFilter?: () => void;
        updateBasicUniverseFilter?: () => void;
        updateTeamworkFilter?: () => void;
        updateTrainingFilter?: () => void;
        updateAllyUniverseFilter?: () => void;
        toggleSpecialCardsCharacterFilter?: () => Promise<void>;
        toggleAdvancedUniverseCharacterFilter?: () => Promise<void>;
        togglePowerCardsCharacterFilter?: () => Promise<void>;
        toggleBasicUniverseCharacterFilter?: () => Promise<void>;
        toggleTeamworkCharacterFilter?: () => Promise<void>;
        toggleTrainingCharacterFilter?: () => Promise<void>;
        toggleAllyUniverseCharacterFilter?: () => Promise<void>;
        toggleEventsMissionFilter?: () => Promise<void>;
        eventsData?: any[];
        deckEditorCards?: any[];
        availableCardsMap?: Map<string, any>;
        showNotification?: (msg: string, type: string) => void;
        displayCharacters?: (chars: any[]) => void;
        displayLocations?: (locs: any[]) => void;
        displayBasicUniverse?: (cards: any[]) => void;
    }
}

describe('Card Filter Toggles', () => {
    let code: string;

    beforeEach(() => {
        const envelopePath = path.join(__dirname, '../../public/js/catalog-v1-envelope.js');
        new Function(fs.readFileSync(envelopePath, 'utf-8'))();
        const filePath = path.join(__dirname, '../../public/js/card-filter-toggles.js');
        code = fs.readFileSync(filePath, 'utf-8');
        new Function(code)();
        document.body.innerHTML = '';
    });

    afterEach(() => {
        document.body.innerHTML = '';
    });

    describe('Module Loading', () => {
        it('should export applyFilters to window', () => {
            expect(typeof window.applyFilters).toBe('function');
        });

        it('should export applyLocationFilters to window', () => {
            expect(typeof window.applyLocationFilters).toBe('function');
        });

        it('should export all toggle filter functions to window', () => {
            expect(typeof window.toggleEventsMissionFilter).toBe('function');
            expect(typeof window.toggleSpecialCardsCharacterFilter).toBe('function');
            expect(typeof window.toggleAdvancedUniverseCharacterFilter).toBe('function');
            expect(typeof window.togglePowerCardsCharacterFilter).toBe('function');
            expect(typeof window.toggleBasicUniverseCharacterFilter).toBe('function');
            expect(typeof window.toggleTeamworkCharacterFilter).toBe('function');
            expect(typeof window.toggleTrainingCharacterFilter).toBe('function');
            expect(typeof window.toggleAllyUniverseCharacterFilter).toBe('function');
        });

        it('should export all update filter functions to window', () => {
            expect(typeof window.updateSpecialCardsFilter).toBe('function');
            expect(typeof window.updateAdvancedUniverseFilter).toBe('function');
            expect(typeof window.updatePowerCardsFilter).toBe('function');
            expect(typeof window.updateBasicUniverseFilter).toBe('function');
            expect(typeof window.updateTeamworkFilter).toBe('function');
            expect(typeof window.updateTrainingFilter).toBe('function');
            expect(typeof window.updateAllyUniverseFilter).toBe('function');
        });
    });

    describe('updateSpecialCardsFilter', () => {
        it('should not call toggle when checkbox is unchecked', () => {
            document.body.innerHTML = `<input type="checkbox" id="specialCardsCharacterFilter">`;
            // Should not throw
            window.updateSpecialCardsFilter!();
        });
    });

    describe('toggleSpecialCardsCharacterFilter with Character Stacks present', () => {
        it('should only filter the Special Cards category and leave Character Stacks visible', async () => {
            document.body.innerHTML = `
                <input type="checkbox" id="specialCardsCharacterFilter" checked>

                <div class="card-category" id="characterStacksCategory">
                    <div class="card-category-header">
                        <div class="category-header-content">
                            <span>Character Stacks (2)</span>
                        </div>
                    </div>
                    <div class="card-category-content">
                        <div class="character-group" id="stackRa">
                            <div class="character-group-header"><span>Ra (7)</span></div>
                        </div>
                        <div class="character-group" id="stackZeus">
                            <div class="character-group-header"><span>Zeus (6)</span></div>
                        </div>
                    </div>
                </div>

                <div class="card-category" id="specialCardsCategory">
                    <div class="card-category-header">
                        <div class="category-header-content">
                            <span>Special Cards (2)</span>
                        </div>
                    </div>
                    <div class="card-category-content">
                        <div class="character-group" id="specialRa">
                            <div class="character-group-header"><span>Ra (3)</span></div>
                        </div>
                        <div class="character-group" id="specialZeus">
                            <div class="character-group-header"><span>Zeus (3)</span></div>
                        </div>
                    </div>
                </div>
            `;

            (global as any).fetch = jest.fn().mockResolvedValue({
                json: async () => ({
                    success: true,
                    data: [
                        { id: 'char-ra', name: 'Ra' },
                        { id: 'char-zeus', name: 'Zeus' }
                    ]
                })
            });

            window.availableCardsMap = new Map([
                ['char-ra', { id: 'char-ra', name: 'Ra' }]
            ]);
            window.deckEditorCards = [
                { type: 'character', cardId: 'char-ra', quantity: 1 }
            ];

            const stackRa = document.getElementById('stackRa') as HTMLElement;
            const stackZeus = document.getElementById('stackZeus') as HTMLElement;
            const specialRa = document.getElementById('specialRa') as HTMLElement;
            const specialZeus = document.getElementById('specialZeus') as HTMLElement;

            stackRa.style.display = 'block';
            stackZeus.style.display = 'block';
            specialRa.style.display = 'block';
            specialZeus.style.display = 'block';

            await window.toggleSpecialCardsCharacterFilter!();

            // Character Stacks should not be filtered by the Special Cards toggle.
            expect(stackRa.style.display).toBe('block');
            expect(stackZeus.style.display).toBe('block');

            // Special Cards should still filter against selected deck characters.
            expect(specialRa.style.display).toBe('block');
            expect(specialZeus.style.display).toBe('none');
        });
    });
});
