/**
 * DBV Universe: Training tab — mobile view contract (CSS, markup, filters, caption helper).
 */
import { readFileSync } from 'fs';
import path from 'path';

describe('mobile-layout.css (DBV Training tab)', () => {
    let css: string;

    beforeAll(() => {
        const cssPath = path.join(__dirname, '../../public/css/mobile-layout.css');
        css = readFileSync(cssPath, 'utf8');
    });

    it('hides training-desktop-filter-row on layout-mobile', () => {
        expect(css).toMatch(
            /\.layout-mobile\s+#training-table\s+thead\s+tr\.training-desktop-filter-row\s*\{\s*display:\s*none\s*!important;\s*\}/
        );
    });

    it('documents Training mobile filter shell and tbody card rows', () => {
        expect(css).toContain('Training tab — mobile');
        expect(css).toMatch(
            /\.layout-mobile\s+#training-table\s+thead\s+tr\.training-filter-row[\s\S]*?display:\s*flex\s*!important[\s\S]*?border-radius:\s*12px/
        );
        expect(css).toMatch(
            /\.layout-mobile\s+#training-table\s+tbody\s+td:nth-child\(n\+3\)[\s\S]*?display:\s*none\s*!important/
        );
    });

    it('defines Training art tokens and portrait max-height override', () => {
        expect(css).toMatch(
            /\.layout-mobile\s+#training-table\s*\{[\s\S]*?--dbv-mobile-training-portrait-img:\s*min\(\s*100%\s*,\s*870px\s*\)/
        );
        expect(css).toMatch(
            /\.layout-mobile\s+#training-table\s+tbody\s+td:first-child\s+\.card-image-container:not\(\.card-image-container--with-nav\)\s+img:not\(\.horizontal-card\)[\s\S]*?max-height:\s*none\s*!important/
        );
    });

    it('styles training caption under the card image', () => {
        expect(css).toMatch(
            /\.layout-mobile\s+#training-table\s+tbody\s+td:first-child\s+\.characters-mobile-card-caption--training[\s\S]*?display:\s*flex/
        );
        expect(css).toMatch(
            /\.layout-mobile\s+#training-table\s+tbody\s+td:first-child\s+\.characters-mobile-card-caption__training-name[\s\S]*?font-size:\s*var\(--font-lg\)/
        );
        expect(css).toMatch(
            /\.layout-mobile\s+#training-table\s+tbody\s+td:first-child\s+\.characters-mobile-card-caption__training-set-line[\s\S]*?font-size:\s*var\(--font-sm\)/
        );
    });

    it('mirrors Training at max-width 900px under #database-view', () => {
        expect(css).toMatch(
            /@media\s*\(\s*max-width:\s*900px\s*\)[\s\S]*?#database-view\s+#training-table[\s\S]*?--dbv-mobile-training-portrait-img:\s*min\(\s*100%\s*,\s*870px\s*\)/
        );
        expect(css).toMatch(
            /@media\s*\(\s*max-width:\s*900px\s*\)[\s\S]*?#database-view\s+#training-table\s+tbody\s+td:nth-child\(n\s*\+\s*3\)[\s\S]*?display:\s*none\s*!important/
        );
        expect(css).toMatch(
            /@media\s*\(\s*max-width:\s*900px\s*\)[\s\S]*?#database-view\s+#training-table\s+thead\s+tr\.training-desktop-filter-row\s*\{\s*display:\s*none\s*!important;\s*\}/
        );
    });
});

describe('database-view.css (DBV Training — desktop)', () => {
    let css: string;

    beforeAll(() => {
        const cssPath = path.join(__dirname, '../../public/css/database-view.css');
        css = readFileSync(cssPath, 'utf8');
    });

    it('hides mobile training-filter-row on DTV and styles training-desktop-filter-row', () => {
        expect(css).toMatch(
            /#training-table\s+thead\s+tr\.training-filter-row\s*\{\s*display:\s*none;\s*\}/
        );
        expect(css).toMatch(
            /#training-table\s+thead\s+tr\.training-desktop-filter-row\s+th\s*\{\s*vertical-align:\s*top;\s*\}/
        );
        expect(css).toMatch(
            /#training-table\s+\.training-mobile-filter-shell\s*\{\s*display:\s*none;\s*\}/
        );
    });
});

describe('DBV Training markup (index.html)', () => {
    const indexPath = path.join(__dirname, '../../public/index.html');

    it('includes training DTV filter row, mobile filter hooks, and stat type toggles', () => {
        const html = readFileSync(indexPath, 'utf8');
        expect(html).toContain('training-desktop-filter-row');
        expect(html).toContain('data-dbv-name-filter="training-desktop-name"');
        expect(html).toContain('training-type-1-filter-toggles');
        expect(html).toContain('training-type-2-filter-toggles');
        expect(html).toContain('training-filter-row');
        expect(html).toContain('training-stat-type-toggles');
        expect(html).toContain('clear-training-filters-mobile-inline');
        expect(html).toContain('clearTrainingFilters()');
    });
});

describe('card-data-display.js buildTrainingMobileCaptionHtml', () => {
    const jsPath = path.join(__dirname, '../../public/js/card-data-display.js');
    let source: string;

    beforeAll(() => {
        source = readFileSync(jsPath, 'utf8');
    });

    it('exports caption helper for tests', () => {
        expect(source).toContain('function buildTrainingMobileCaptionHtml');
        expect(source).toContain('window.buildTrainingMobileCaptionHtml = buildTrainingMobileCaptionHtml');
    });

    it('emits training caption class names and type lines', () => {
        expect(source).toContain('characters-mobile-card-caption--training');
        expect(source).toContain('characters-mobile-card-caption__training-name');
        expect(source).toContain('characters-mobile-card-caption__training-type-line');
        expect(source).toContain('characters-mobile-card-caption__training-value-bonus');
        expect(source).toContain('characters-mobile-card-caption__training-set-line');
        expect(source).toContain('dbvSetCaptionLineFromCard');
    });
});

describe('search-filter-functions.js Training DBV filters', () => {
    const jsPath = path.join(__dirname, '../../public/js/search-filter-functions.js');
    let source: string;

    beforeAll(() => {
        source = readFileSync(jsPath, 'utf8');
    });

    it('defines apply and table filter setup for training', () => {
        expect(source).toContain('function applyTrainingFilters');
        expect(source).toContain('function setupTrainingTableFilters');
        expect(source).toContain('function trainingCardNameColumnTerm');
        expect(source).toContain('window.applyTrainingFilters = applyTrainingFilters');
        expect(source).toContain('#training-table .training-stat-type-toggles');
        expect(source).toContain('.training-type-1-filter-toggles');
        expect(source).toContain('.training-type-2-filter-toggles');
    });
});
