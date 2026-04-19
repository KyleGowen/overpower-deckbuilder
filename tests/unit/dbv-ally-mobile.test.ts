/**
 * DBV Universe: Ally tab — mobile view contract (CSS, markup, caption helper).
 */
import { readFileSync } from 'fs';
import path from 'path';

describe('mobile-layout.css (DBV Ally tab)', () => {
    let css: string;

    beforeAll(() => {
        const cssPath = path.join(__dirname, '../../public/css/mobile-layout.css');
        css = readFileSync(cssPath, 'utf8');
    });

    it('documents Ally mobile filter shell and tbody card rows', () => {
        expect(css).toContain('Ally tab — mobile');
        expect(css).toMatch(
            /\.layout-mobile\s+#ally-universe-table\s+thead\s+tr\.ally-desktop-filter-row\s*\{\s*display:\s*none\s*!important;/
        );
        expect(css).toMatch(
            /\.layout-mobile\s+#ally-universe-table\s+thead\s+tr\.ally-filter-row[\s\S]*?display:\s*flex[\s\S]*?border-radius:\s*12px/
        );
        expect(css).toMatch(
            /\.layout-mobile\s+#ally-universe-table\s+tbody\s+td:nth-child\(n\+3\)[\s\S]*?display:\s*none\s*!important/
        );
    });

    it('defines Ally art tokens and portrait max-height override', () => {
        expect(css).toMatch(
            /\.layout-mobile\s+#ally-universe-table\s*\{[\s\S]*?--dbv-mobile-ally-portrait-img:\s*min\(\s*100%\s*,\s*870px\s*\)/
        );
        expect(css).toMatch(
            /\.layout-mobile\s+#ally-universe-table\s+tbody\s+td:first-child\s+\.card-image-container:not\(\.card-image-container--with-nav\)\s+img:not\(\.horizontal-card\)[\s\S]*?max-height:\s*none\s*!important/
        );
    });

    it('styles ally caption under the card image', () => {
        expect(css).toMatch(
            /\.layout-mobile\s+#ally-universe-table\s+tbody\s+td:first-child\s+\.characters-mobile-card-caption--ally[\s\S]*?display:\s*flex/
        );
        expect(css).toMatch(
            /\.layout-mobile\s+#ally-universe-table\s+tbody\s+td:first-child\s+\.characters-mobile-card-caption__ally-name[\s\S]*?font-size:\s*var\(--font-md\)/
        );
        expect(css).toMatch(
            /\.layout-mobile\s+#ally-universe-table\s+tbody\s+td:first-child\s+\.characters-mobile-card-caption__ally-set-line[\s\S]*?font-size:\s*var\(--font-sm\)/
        );
    });

    it('mirrors Ally at max-width 900px under #database-view', () => {
        expect(css).toMatch(
            /@media\s*\(\s*max-width:\s*900px\s*\)[\s\S]*?#database-view\s+#ally-universe-table[\s\S]*?--dbv-mobile-ally-portrait-img:\s*min\(\s*100%\s*,\s*870px\s*\)/
        );
        expect(css).toMatch(
            /@media\s*\(\s*max-width:\s*900px\s*\)[\s\S]*?#database-view\s+#ally-universe-table\s+tbody\s+td:nth-child\(n\s*\+\s*3\)[\s\S]*?display:\s*none\s*!important/
        );
    });

    it('hides duplicate attack-type icon row on MV (#database-view only)', () => {
        expect(css).toMatch(
            /\.layout-mobile\s+#database-view\s+#ally-universe-table\s+\.ally-filter-icon-row\.ally-filter-attack-icon-row[\s\S]*?display:\s*none\s*!important/
        );
    });

    it('places stat icon strip above name search in ally-mobile-filter-shell (flex order)', () => {
        expect(css).toMatch(
            /\.layout-mobile\s+#database-view\s+#ally-universe-table\s+\.ally-mobile-filter-shell\s*>\s*\.ally-filter-icon-row:not\(\.ally-filter-attack-icon-row\)[\s\S]*?order:\s*1/
        );
        expect(css).toMatch(
            /\.layout-mobile\s+#database-view\s+#ally-universe-table\s+\.ally-mobile-filter-shell\s*>\s*\.ally-mobile-name-row[\s\S]*?order:\s*2/
        );
    });
});

describe('database-view.css (DBV Ally — desktop)', () => {
    let css: string;

    beforeAll(() => {
        const cssPath = path.join(__dirname, '../../public/css/database-view.css');
        css = readFileSync(cssPath, 'utf8');
    });

    it('hides mobile-only ally filter shell on desktop without !important', () => {
        expect(css).toMatch(
            /#ally-universe-table\s+thead\s+tr\.ally-filter-row\s*>\s*th\.ally-filter-controls-th\s*\{\s*display:\s*none;\s*\}/
        );
        expect(css).toMatch(
            /#ally-universe-table\s+\.ally-mobile-filter-shell\s*\{\s*display:\s*none;\s*\}/
        );
    });

    it('defines Ally DTV desktop filter row vertical alignment', () => {
        expect(css).toMatch(
            /#ally-universe-table\s+thead\s+tr\.ally-desktop-filter-row\s+th\s*\{\s*vertical-align:\s*top;/
        );
    });
});

describe('DBV Ally markup (index.html)', () => {
    const indexPath = path.join(__dirname, '../../public/index.html');

    it('includes ally mobile filter hooks and stat type toggles', () => {
        const html = readFileSync(indexPath, 'utf8');
        expect(html).toContain('ally-filter-row');
        expect(html).toContain('ally-desktop-filter-row');
        expect(html).toContain('ally-stat-type-to-use-toggles');
        expect(html).toContain('ally-stat-type-filter-toggles');
        expect(html).toContain('ally-attack-type-filter-toggles');
        expect(html).toContain('data-dbv-name-filter="ally-desktop-name"');
        expect(html).toContain('colspan="7"');
        expect(html).toContain('clear-ally-filters-mobile-inline');
        expect(html).toContain('clearAllyUniverseFilters()');
    });
});

describe('card-data-display.js buildAllyMobileCaptionHtml', () => {
    const jsPath = path.join(__dirname, '../../public/js/card-data-display.js');
    let source: string;

    beforeAll(() => {
        source = readFileSync(jsPath, 'utf8');
    });

    it('exports caption helper for tests', () => {
        expect(source).toContain('function buildAllyMobileCaptionHtml');
        expect(source).toContain('window.buildAllyMobileCaptionHtml = buildAllyMobileCaptionHtml');
    });

    it('emits ally caption class names and Acts as separator', () => {
        expect(source).toContain('characters-mobile-card-caption--ally');
        expect(source).toContain('characters-mobile-card-caption__ally-name');
        expect(source).toContain('characters-mobile-card-caption__ally-stat-line');
        expect(source).toContain('characters-mobile-card-caption__ally-stat-sep');
        expect(source).toContain(' - Acts as ');
        expect(source).toContain('characters-mobile-card-caption__ally-text');
        expect(source).toContain('characters-mobile-card-caption__ally-set-line');
        expect(source).toContain('dbvSetCaptionLineFromCard');
    });
});

describe('search-filter-functions.js Ally DBV filters', () => {
    const jsPath = path.join(__dirname, '../../public/js/search-filter-functions.js');
    let source: string;

    beforeAll(() => {
        source = readFileSync(jsPath, 'utf8');
    });

    it('defines apply and table filter setup for ally universe', () => {
        expect(source).toContain('function applyAllyUniverseFilters');
        expect(source).toContain('function setupAllyUniverseTableFilters');
        expect(source).toContain('window.applyAllyUniverseFilters = applyAllyUniverseFilters');
        expect(source).toContain('ally-stat-type-filter-toggles');
        expect(source).toContain('ally-attack-type-filter-toggles');
        expect(source).toContain('allyCardNameColumnTerm');
    });
});
