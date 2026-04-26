/**
 * Unit tests for Basic Universe Type Filter functionality
 * Tests the setupBasicUniverseSearch and applyBasicUniverseFilters functions
 */

import { readFileSync } from 'fs';
import { join } from 'path';

describe('Basic Universe Type Filter', () => {
    let indexHtmlContent: string;
    let indexPageJsContent: string;
    let cardDataDisplayContent: string;
    let cardFilterTogglesContent: string;
    let mockDocument: any;
    let mockFetch: jest.Mock;
    let mockConsole: any;

    beforeEach(() => {
        // Read the main index.html and external JS files where functions were extracted
        indexHtmlContent = readFileSync(join(__dirname, '../../public/index.html'), 'utf-8');
        indexPageJsContent = readFileSync(join(__dirname, '../../public/js/index-page.js'), 'utf-8');
        cardDataDisplayContent = readFileSync(join(__dirname, '../../public/js/card-data-display.js'), 'utf-8');
        cardFilterTogglesContent = readFileSync(join(__dirname, '../../public/js/card-filter-toggles.js'), 'utf-8');

        // Mock document object
        mockDocument = {
            querySelectorAll: jest.fn(),
            querySelector: jest.fn(),
            getElementById: jest.fn(),
            addEventListener: jest.fn()
        };

        // Mock fetch
        mockFetch = jest.fn();
        global.fetch = mockFetch;

        // Mock console
        mockConsole = {
            log: jest.fn(),
            error: jest.fn()
        };
        global.console = mockConsole;

        // Mock window object
        global.window = {
            ...global.window,
            document: mockDocument
        } as any;
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    // Helper function to extract complete function body by counting braces
    function extractFunctionBody(content: string, functionName: string): string | null {
        const functionRegex = new RegExp(`(?:async\\s+)?function\\s+${functionName}\\s*\\([^)]*\\)\\s*\\{`);
        const match = content.match(functionRegex);
        if (!match) return null;

        const startIndex = match.index! + match[0].length - 1; // Start at the opening brace
        let braceCount = 0;
        let i = startIndex;

        while (i < content.length) {
            if (content[i] === '{') {
                braceCount++;
            } else if (content[i] === '}') {
                braceCount--;
                if (braceCount === 0) {
                    return content.substring(startIndex, i + 1);
                }
            }
            i++;
        }

        return null;
    }

    describe('setupBasicUniverseSearch function', () => {
        it('should be defined in card-data-display.js', () => {
            expect(cardDataDisplayContent).toContain('function setupBasicUniverseSearch()');
        });

        it('should wire power-type toggle buttons with click listeners', () => {
            const functionCode = extractFunctionBody(cardDataDisplayContent, 'setupBasicUniverseSearch');
            expect(functionCode).toBeTruthy();
            expect(functionCode).toContain('power-type-filter-toggle');
            expect(functionCode).toContain('addEventListener(\'click\'');
        });

        it('should sync is-active across desktop and mobile type toggles', () => {
            const functionCode = extractFunctionBody(cardDataDisplayContent, 'setupBasicUniverseSearch');
            expect(functionCode).toBeTruthy();
            expect(functionCode).toContain('classList.toggle(\'is-active\', willBeActive)');
            expect(functionCode).toContain('applyBasicUniverseFilters()');
        });

        it('should add event listeners to desktop and mobile filter inputs', () => {
            const functionCode = extractFunctionBody(cardDataDisplayContent, 'setupBasicUniverseSearch');
            expect(functionCode).toBeTruthy();

            expect(functionCode).toContain('basic-value-min');
            expect(functionCode).toContain('debouncedApply');
            expect(functionCode).toContain('basic-universe-mobile-to-use-equals');
            expect(functionCode).toContain('syncBasicUniverseMobileNumericToDesktop');
        });

        it('should setup search to use applyBasicUniverseFilters with in-memory data', () => {
            const functionCode = extractFunctionBody(cardDataDisplayContent, 'setupBasicUniverseSearch');
            expect(functionCode).toBeTruthy();

            expect(functionCode).toContain('searchInput.addEventListener(\'input\', async () => {');
            expect(functionCode).toContain('applyBasicUniverseFilters()');
        });
    });

    describe('applyBasicUniverseFilters function', () => {
        it('should be defined in card-filter-toggles.js', () => {
            expect(cardFilterTogglesContent).toContain('async function applyBasicUniverseFilters()');
        });

        it('should load basic universe from v1 catalog when pool is empty', () => {
            const functionCode = extractFunctionBody(cardFilterTogglesContent, 'applyBasicUniverseFilters');
            expect(functionCode).toBeTruthy();
            expect(functionCode).toContain('\'/api/v1/catalog/basic-universe\'');
        });

        it('should filter by active toggle buttons', () => {
            const functionCode = extractFunctionBody(cardFilterTogglesContent, 'applyBasicUniverseFilters');
            expect(functionCode).toBeTruthy();
            expect(functionCode).toContain('power-type-filter-toggle.is-active');
            expect(functionCode).toContain('selectedTypes.includes(card.type)');
        });

        it('should show all cards when no toggles are active', () => {
            const functionCode = extractFunctionBody(cardFilterTogglesContent, 'applyBasicUniverseFilters');
            expect(functionCode).toBeTruthy();
            expect(functionCode).toContain('if (selectedTypes.length > 0)');
        });

        it('should handle value range filtering', () => {
            const functionCode = extractFunctionBody(cardFilterTogglesContent, 'applyBasicUniverseFilters');
            expect(functionCode).toBeTruthy();
            expect(functionCode).toContain('basic-value-min');
            expect(functionCode).toContain('basic-value-max');
            expect(functionCode).toContain('value_to_use');
        });

        it('should handle bonus range filtering', () => {
            const functionCode = extractFunctionBody(cardFilterTogglesContent, 'applyBasicUniverseFilters');
            expect(functionCode).toBeTruthy();
            expect(functionCode).toContain('basic-bonus-min');
            expect(functionCode).toContain('basic-bonus-max');
            expect(functionCode).toContain('card.bonus');
        });

        it('should call displayBasicUniverse with filtered results', () => {
            const functionCode = extractFunctionBody(cardFilterTogglesContent, 'applyBasicUniverseFilters');
            expect(functionCode).toBeTruthy();
            expect(functionCode).toContain('displayBasicUniverse(filtered)');
        });

        it('should prefer window.basicUniverseData before refetching', () => {
            const functionCode = extractFunctionBody(cardFilterTogglesContent, 'applyBasicUniverseFilters');
            expect(functionCode).toBeTruthy();
            expect(functionCode).toContain('basicUniverseData');
            expect(functionCode).toContain('pool.slice()');
        });

        it('should handle errors gracefully', () => {
            const functionCode = extractFunctionBody(cardFilterTogglesContent, 'applyBasicUniverseFilters');
            expect(functionCode).toBeTruthy();
            expect(functionCode).toContain('catch (err)');
            expect(functionCode).toContain('console.error(\'Error applying basic universe filters:\', err)');
        });
    });

    describe('Type Filter Integration', () => {
        it('should have proper HTML structure for toggle buttons', () => {
            expect(indexHtmlContent).toContain('id="basic-universe-tab"');
            expect(indexHtmlContent).toContain('data-dbv-power-strip="basic-desktop"');
            expect(indexHtmlContent).toContain('data-dbv-power-strip="basic-mobile"');
            expect(indexHtmlContent).toContain('basic-universe-desktop-stat-type-toggles');
        });

        it('should have Clear All Filters button', () => {
            expect(indexHtmlContent).toContain('Clear All Filters');
            expect(indexHtmlContent).toContain('onclick="clearBasicUniverseFilters()"');
        });

        it('should have proper tab switching integration', () => {
            expect(indexPageJsContent).toContain('setupBasicUniverseSearch()');
            expect(indexPageJsContent).toContain('loadBasicUniverse()');
        });
    });

    describe('Filter Logic Validation', () => {
        it('should handle empty selected types correctly', () => {
            const functionCode = extractFunctionBody(cardFilterTogglesContent, 'applyBasicUniverseFilters');
            expect(functionCode).toBeTruthy();
            // No active toggles = show all (selectedTypes.length > 0 guard)
            expect(functionCode).toContain('selectedTypes.length > 0');
        });

        it('should filter cards by type when types are selected', () => {
            const functionCode = extractFunctionBody(cardFilterTogglesContent, 'applyBasicUniverseFilters');
            expect(functionCode).toBeTruthy();

            expect(functionCode).toContain('selectedTypes.includes(card.type)');
        });

        it('should include Training-parity stat type toggles including Any-Power and Multi-Power', () => {
            expect(indexHtmlContent).toContain('dbv-power-type-filter-strip.js');
            const stripSrc = readFileSync(join(__dirname, '../../public/js/dbv-power-type-filter-strip.js'), 'utf-8');
            expect(stripSrc).toContain("'basic-desktop'");
            expect(stripSrc).toContain("'basic-mobile'");
            expect(stripSrc).toContain("'Any-Power'");
            expect(stripSrc).toContain("'Multi-Power'");
        });
    });

    describe('Error Handling', () => {
        it('should handle API fetch errors', () => {
            const functionCode = extractFunctionBody(cardFilterTogglesContent, 'applyBasicUniverseFilters');
            expect(functionCode).toBeTruthy();
            expect(functionCode).toContain('if (!ok)');
            expect(functionCode).toContain('return');
        });

        it('should handle missing DOM elements gracefully', () => {
            const functionCode = extractFunctionBody(cardDataDisplayContent, 'setupBasicUniverseSearch');
            expect(functionCode).toBeTruthy();
            expect(functionCode).toContain('if (valueEquals)');
            expect(functionCode).toContain('if (bonusEquals)');
            expect(functionCode).toContain('if (el)');
            expect(functionCode).toContain('searchInput && searchInput.dataset.basicUniverseSearchBound');
        });
    });

    describe('Performance Considerations', () => {
        it('should use efficient DOM queries', () => {
            const functionCode = extractFunctionBody(cardFilterTogglesContent, 'applyBasicUniverseFilters');
            expect(functionCode).toBeTruthy();
            expect(functionCode).toContain('#basic-universe-tab .power-type-filter-toggle.is-active');
        });

        it('should load data once when search runs with empty pool', () => {
            const functionCode = extractFunctionBody(cardDataDisplayContent, 'setupBasicUniverseSearch');
            expect(functionCode).toBeTruthy();

            expect(functionCode).toContain('basicUniverseData');
            expect(functionCode).toContain('loadBasicUniverse');
        });
    });
});
