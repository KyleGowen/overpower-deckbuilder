/**
 * Simple unit tests for Basic Universe Type Filter functionality
 * Tests the core behavior without complex HTML parsing
 */

import { readFileSync } from 'fs';
import { join } from 'path';

describe('Basic Universe Type Filter - Simple', () => {
    let indexHtmlContent: string;
    let cardDataDisplayContent: string;
    let cardFilterTogglesContent: string;

    beforeEach(() => {
        // Read the main index.html and external JS files where functions were extracted
        indexHtmlContent = readFileSync(join(__dirname, '../../public/index.html'), 'utf-8');
        cardDataDisplayContent = readFileSync(join(__dirname, '../../public/js/card-data-display.js'), 'utf-8');
        cardFilterTogglesContent = readFileSync(join(__dirname, '../../public/js/card-filter-toggles.js'), 'utf-8');
    });

    describe('Core Functionality', () => {
        it('should contain setupBasicUniverseSearch function', () => {
            expect(cardDataDisplayContent).toContain('function setupBasicUniverseSearch()');
        });

        it('should contain applyBasicUniverseFilters function', () => {
            expect(cardFilterTogglesContent).toContain('async function applyBasicUniverseFilters()');
        });

        it('should contain displayBasicUniverse function', () => {
            expect(cardDataDisplayContent).toContain('function displayBasicUniverse(');
        });

        it('should reference clearBasicUniverseFilters function', () => {
            // clearBasicUniverseFilters is referenced in index.html or filter-functions.js
            const allContent = indexHtmlContent + cardFilterTogglesContent + cardDataDisplayContent;
            expect(allContent).toContain('clearBasicUniverseFilters');
        });
    });

    describe('HTML Structure', () => {
        it('should have Basic Universe tab container', () => {
            expect(indexHtmlContent).toContain('id="basic-universe-tab"');
        });

        it('should have Type filter strip mount points (buttons from dbv-power-type-filter-strip.js)', () => {
            expect(indexHtmlContent).toContain('basic-universe-stat-type-toggles');
            expect(indexHtmlContent).toContain('data-dbv-power-strip="basic-desktop"');
            expect(indexHtmlContent).toContain('data-dbv-power-strip="basic-mobile"');
            expect(indexHtmlContent).toContain('dbv-power-type-filter-strip.js');
        });

        it('should have Clear All Filters button', () => {
            expect(indexHtmlContent).toContain('Clear All Filters');
        });

        it('should have filter input fields', () => {
            expect(indexHtmlContent).toContain('id="basic-value-min"');
            expect(indexHtmlContent).toContain('id="basic-value-max"');
            expect(indexHtmlContent).toContain('id="basic-bonus-min"');
            expect(indexHtmlContent).toContain('id="basic-bonus-max"');
        });

        it('should have mobile To Use and Bonus filter shells', () => {
            expect(indexHtmlContent).toContain('basic-universe-mobile-filter-shell');
            expect(indexHtmlContent).toContain('placeholder="Min To Use"');
            expect(indexHtmlContent).toContain('placeholder="Max Bonus"');
        });
    });

    describe('API Integration', () => {
        it('should fetch from correct API endpoint', () => {
            expect(cardFilterTogglesContent + cardDataDisplayContent).toContain('fetch(\'/api/basic-universe\')');
        });

        it('should handle API response correctly', () => {
            expect(cardFilterTogglesContent + cardDataDisplayContent).toContain('data.success');
            expect(cardFilterTogglesContent + cardDataDisplayContent).toContain('data.data');
        });
    });

    describe('Filtering Logic', () => {
        it('should filter by selected types', () => {
            expect(cardFilterTogglesContent).toContain('selectedTypes.includes(card.type)');
        });

        it('should handle empty selection by showing all cards', () => {
            expect(cardFilterTogglesContent).toContain('selectedTypes.length > 0');
        });

        it('should filter to selected types when toggles are active', () => {
            expect(cardFilterTogglesContent).toContain('selectedTypes.includes(card.type)');
        });
    });

    describe('Event Handling', () => {
        it('should add click event listeners to toggle buttons', () => {
            expect(cardDataDisplayContent).toContain('addEventListener(\'click\'');
        });

        it('should add event listeners to filter inputs', () => {
            expect(cardDataDisplayContent).toContain('addEventListener(\'input\'');
        });
    });

    describe('Toggle State Management', () => {
        it('should sync is-active class across paired type toggles', () => {
            expect(cardDataDisplayContent).toContain('classList.toggle(\'is-active\', willBeActive)');
        });
    });

    describe('Error Handling', () => {
        it('should handle errors gracefully', () => {
            expect(cardFilterTogglesContent).toContain('catch (err)');
            expect(cardFilterTogglesContent).toContain('console.error(\'Error applying basic universe filters:\'');
        });
    });

    describe('Tab Integration', () => {
        it('should be called when tab is switched', () => {
            expect(indexHtmlContent).toContain('setupBasicUniverseSearch()');
            expect(indexHtmlContent).toContain('loadBasicUniverse()');
        });
    });

    describe('Function Registration', () => {
        it('should define functions in extracted modules', () => {
            expect(cardFilterTogglesContent).toContain('async function applyBasicUniverseFilters()');
            expect(cardDataDisplayContent).toContain('function displayBasicUniverse(');
            expect(cardDataDisplayContent).toContain('function setupBasicUniverseSearch()');
        });
    });
});
