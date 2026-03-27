/**
 * DBV Power Cards tab — mobile view contract (CSS, markup, filters, caption).
 */
import { readFileSync } from 'fs';
import path from 'path';

describe('mobile-layout.css (DBV Power Cards tab)', () => {
    let css: string;

    beforeAll(() => {
        const cssPath = path.join(__dirname, '../../public/css/mobile-layout.css');
        css = readFileSync(cssPath, 'utf8');
    });

    it('documents Power mobile filter shell and tbody card rows', () => {
        expect(css).toContain('Power Cards tab');
        expect(css).toMatch(
            /\.layout-mobile\s+#power-cards-table\s+thead\s+tr\.power-cards-filter-row[\s\S]*?display:\s*flex[\s\S]*?border-radius:\s*12px/
        );
        expect(css).toMatch(
            /\.layout-mobile\s+#power-cards-table\s+tbody\s+td:nth-child\(n\+3\)[\s\S]*?display:\s*none\s*!important/
        );
    });

    it('defines Power art tokens and portrait max-height override', () => {
        expect(css).toMatch(
            /\.layout-mobile\s+#power-cards-table\s*\{[\s\S]*?--dbv-mobile-power-portrait-img:\s*min\(\s*100%\s*,\s*870px\s*\)/
        );
        expect(css).toMatch(
            /\.layout-mobile\s+#power-cards-table\s+tbody\s+td:first-child\s+\.card-image-container:not\(\.card-image-container--with-nav\)\s+img:not\(\.horizontal-card\)[\s\S]*?max-height:\s*none\s*!important/
        );
    });

    it('styles power caption under the card image', () => {
        expect(css).toMatch(
            /\.layout-mobile\s+#power-cards-table\s+tbody\s+td:first-child\s+\.characters-mobile-card-caption--power[\s\S]*?display:\s*flex/
        );
        expect(css).toMatch(
            /\.layout-mobile\s+#power-cards-table\s+tbody\s+td:first-child\s+\.characters-mobile-card-caption__power-type-value-line[\s\S]*?font-size:\s*1\.05rem/
        );
        expect(css).toMatch(
            /\.layout-mobile\s+#power-cards-table\s+tbody\s+td:first-child\s+\.characters-mobile-card-caption__power-set-line[\s\S]*?font-size:\s*0\.875rem/
        );
    });

    it('mirrors Power at max-width 900px under #database-view', () => {
        expect(css).toMatch(
            /@media\s*\(\s*max-width:\s*900px\s*\)[\s\S]*?#database-view\s+#power-cards-table[\s\S]*?--dbv-mobile-power-portrait-img:\s*min\(\s*100%\s*,\s*870px\s*\)/
        );
        expect(css).toMatch(
            /@media\s*\(\s*max-width:\s*900px\s*\)[\s\S]*?#database-view\s+#power-cards-table\s+tbody\s+td:nth-child\(n\s*\+\s*3\)[\s\S]*?display:\s*none\s*!important/
        );
    });
});

describe('database-view.css (DBV Power Cards — desktop)', () => {
    let css: string;

    beforeAll(() => {
        const cssPath = path.join(__dirname, '../../public/css/database-view.css');
        css = readFileSync(cssPath, 'utf8');
    });

    it('hides mobile-only power filter shell on desktop without !important', () => {
        expect(css).toMatch(
            /#power-cards-table\s+thead\s+tr\.power-cards-filter-row\s*>\s*th\.power-cards-filter-controls-th\s*\{\s*display:\s*none;\s*\}/
        );
        expect(css).toMatch(
            /#power-cards-table\s+\.power-cards-mobile-filter-shell\s*\{\s*display:\s*none;\s*\}/
        );
    });
});

describe('DBV Power Cards markup (index.html)', () => {
    const indexPath = path.join(__dirname, '../../public/index.html');

    it('includes power mobile filter hooks, value row, and type toggles', () => {
        const html = readFileSync(indexPath, 'utf8');
        expect(html).toContain('power-cards-filter-row');
        expect(html).toContain('power-cards-desktop-filter-row');
        expect(html).toContain('power-cards-type-toggles');
        expect(html).toContain('clear-power-filters-mobile-inline');
        expect(html).toContain('power-value-equals-mobile');
        expect(html).toContain('power-value-clear');
        expect(html).toContain('clearPowerCardFilters()');
        expect(html).toContain('id="power-value-equals"');
    });
});

describe('filter-functions.js Power Cards filters', () => {
    const jsPath = path.join(__dirname, '../../public/js/filter-functions.js');
    let source: string;

    beforeAll(() => {
        source = readFileSync(jsPath, 'utf8');
    });

    it('reads desktop and mobile value inputs and binds filters once', () => {
        expect(source).toContain('powerFilterNumericOrNull');
        expect(source).toContain('power-value-equals-mobile');
        expect(source).toContain('power-value-clear');
        expect(source).toContain("tab.dataset.powerFiltersBound === 'true'");
        expect(source).not.toContain('syncPowerSetCheckboxes');
    });
});

describe('card-display-functions.js Power mobile caption', () => {
    const jsPath = path.join(__dirname, '../../public/js/card-display-functions.js');
    let source: string;

    beforeAll(() => {
        source = readFileSync(jsPath, 'utf8');
    });

    it('defines power mobile list art and caption classes', () => {
        expect(source).toContain('function powerUseMobileListArt');
        expect(source).toContain('characters-mobile-card-caption--power');
        expect(source).toContain('characters-mobile-card-caption__power-type-value-line');
        expect(source).toContain('characters-mobile-card-caption__power-set-line');
        expect(source).toContain('window.powerUseMobileListArt = powerUseMobileListArt');
        expect(source).toContain('powerMobileTypeValueHtml');
        expect(source).toContain('powerMobileCaptionLinesForCard');
        expect(source).toMatch(/powerUseMobileListArt[\s\S]*lockRowHeight/);
    });
});
