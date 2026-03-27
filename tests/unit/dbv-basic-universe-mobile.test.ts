/**
 * DBV Universe: Basic tab — mobile view contract (CSS, markup, caption helper).
 */
import { readFileSync } from 'fs';
import path from 'path';

describe('mobile-layout.css (DBV Basic Universe tab)', () => {
    let css: string;

    beforeAll(() => {
        const cssPath = path.join(__dirname, '../../public/css/mobile-layout.css');
        css = readFileSync(cssPath, 'utf8');
    });

    it('documents Basic Universe mobile filter shell and tbody card rows', () => {
        expect(css).toContain('Basic Universe tab — mobile');
        expect(css).toMatch(
            /\.layout-mobile\s+#basic-universe-table\s+thead\s+tr\.basic-universe-filter-row[\s\S]*?display:\s*flex[\s\S]*?border-radius:\s*12px/
        );
        expect(css).toMatch(
            /\.layout-mobile\s+#basic-universe-table\s+tbody\s+td:nth-child\(n\+3\)[\s\S]*?display:\s*none\s*!important/
        );
    });

    it('defines Basic Universe art tokens and portrait max-height override', () => {
        expect(css).toMatch(
            /\.layout-mobile\s+#basic-universe-table\s*\{[\s\S]*?--dbv-mobile-basic-universe-portrait-img:\s*min\(\s*100%\s*,\s*870px\s*\)/
        );
        expect(css).toMatch(
            /\.layout-mobile\s+#basic-universe-table\s+tbody\s+td:first-child\s+\.card-image-container:not\(\.card-image-container--with-nav\)\s+img:not\(\.horizontal-card\)[\s\S]*?max-height:\s*none\s*!important/
        );
    });

    it('styles basic-universe caption under the card image', () => {
        expect(css).toMatch(
            /\.layout-mobile\s+#basic-universe-table\s+tbody\s+td:first-child\s+\.characters-mobile-card-caption--basic-universe[\s\S]*?display:\s*flex/
        );
        expect(css).toMatch(
            /\.layout-mobile\s+#basic-universe-table\s+tbody\s+td:first-child\s+\.characters-mobile-card-caption__basic-universe-name[\s\S]*?font-size:\s*1\.35rem/
        );
        expect(css).toMatch(
            /\.layout-mobile\s+#basic-universe-table\s+tbody\s+td:first-child\s+\.characters-mobile-card-caption__basic-universe-set-line[\s\S]*?font-size:\s*0\.875rem/
        );
    });

    it('mirrors Basic Universe at max-width 900px under #database-view', () => {
        expect(css).toMatch(
            /@media\s*\(\s*max-width:\s*900px\s*\)[\s\S]*?#database-view\s+#basic-universe-table[\s\S]*?--dbv-mobile-basic-universe-portrait-img:\s*min\(\s*100%\s*,\s*870px\s*\)/
        );
    });
});

describe('database-view.css (DBV Basic Universe — desktop)', () => {
    let css: string;

    beforeAll(() => {
        const cssPath = path.join(__dirname, '../../public/css/database-view.css');
        css = readFileSync(cssPath, 'utf8');
    });

    it('hides mobile-only basic-universe filter shell on desktop without !important', () => {
        expect(css).toMatch(
            /#basic-universe-table\s+thead\s+tr\.basic-universe-filter-row\s*>\s*th\.basic-universe-filter-controls-th\s*\{\s*display:\s*none;\s*\}/
        );
        expect(css).toMatch(
            /#basic-universe-table\s+\.basic-universe-mobile-filter-shell\s*\{\s*display:\s*none;\s*\}/
        );
    });
});

describe('DBV Basic Universe markup (index.html)', () => {
    const indexPath = path.join(__dirname, '../../public/index.html');

    it('includes mobile filter hooks, type toggles, and value shells', () => {
        const html = readFileSync(indexPath, 'utf8');
        expect(html).toContain('basic-universe-filter-row');
        expect(html).toContain('basic-universe-stat-type-toggles');
        expect(html).toContain('basic-universe-desktop-filter-row');
        expect(html).toContain('placeholder="Min To Use"');
        expect(html).toContain('placeholder="Bonus ="');
        expect(html).toContain('clear-basic-universe-filters-mobile-inline');
    });
});

describe('card-data-display.js Basic Universe mobile caption', () => {
    const jsPath = path.join(__dirname, '../../public/js/card-data-display.js');
    let source: string;

    beforeAll(() => {
        source = readFileSync(jsPath, 'utf8');
    });

    it('defines helpers and exports for mobile basic-universe list', () => {
        expect(source).toContain('function basicUniverseUseMobileListArt');
        expect(source).toContain('function buildBasicUniverseMobileCaptionHtml');
        expect(source).toContain('window.buildBasicUniverseMobileCaptionHtml = buildBasicUniverseMobileCaptionHtml');
    });

    it('emits basic-universe caption class names', () => {
        expect(source).toContain('characters-mobile-card-caption--basic-universe');
        expect(source).toContain('characters-mobile-card-caption__basic-universe-name');
        expect(source).toContain('characters-mobile-card-caption__basic-universe-stat-line');
        expect(source).toContain('characters-mobile-card-caption__basic-universe-set-line');
        expect(source).toContain('dbvSetCaptionLineFromCard');
    });
});
