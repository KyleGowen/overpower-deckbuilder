/**
 * DBV Universe: Teamwork tab — mobile view contract (CSS, markup, caption helper).
 */
import { readFileSync } from 'fs';
import path from 'path';

describe('mobile-layout.css (DBV Teamwork tab)', () => {
    let css: string;

    beforeAll(() => {
        const cssPath = path.join(__dirname, '../../public/css/mobile-layout.css');
        css = readFileSync(cssPath, 'utf8');
    });

    it('documents Teamwork mobile filter shell and tbody card rows', () => {
        expect(css).toContain('Teamwork tab — mobile');
        expect(css).toMatch(
            /\.layout-mobile\s+#teamwork-table\s+thead\s+tr\.teamwork-filter-row[\s\S]*?display:\s*flex[\s\S]*?border-radius:\s*12px/
        );
        expect(css).toMatch(
            /\.layout-mobile\s+#teamwork-table\s+tbody\s+td:nth-child\(n\+3\)[\s\S]*?display:\s*none\s*!important/
        );
    });

    it('defines Teamwork art tokens and portrait max-height override', () => {
        expect(css).toMatch(
            /\.layout-mobile\s+#teamwork-table\s*\{[\s\S]*?--dbv-mobile-teamwork-portrait-img:\s*min\(\s*100%\s*,\s*870px\s*\)/
        );
        expect(css).toMatch(
            /\.layout-mobile\s+#teamwork-table\s+tbody\s+td:first-child\s+\.card-image-container:not\(\.card-image-container--with-nav\)\s+img:not\(\.horizontal-card\)[\s\S]*?max-height:\s*none\s*!important/
        );
    });

    it('styles teamwork caption lines under the card image', () => {
        expect(css).toMatch(
            /\.layout-mobile\s+#teamwork-table\s+tbody\s+td:first-child\s+\.characters-mobile-card-caption--teamwork[\s\S]*?display:\s*flex/
        );
        expect(css).toMatch(
            /\.layout-mobile\s+#teamwork-table\s+tbody\s+td:first-child\s+\.characters-mobile-card-caption__teamwork-line1[\s\S]*?justify-content:\s*center/
        );
        expect(css).toMatch(
            /\.layout-mobile\s+#teamwork-table\s+tbody\s+td:first-child\s+\.characters-mobile-card-caption__teamwork-set-line[\s\S]*?font-size:\s*0\.875rem/
        );
    });

    it('mirrors Teamwork at max-width 900px under #database-view', () => {
        expect(css).toMatch(
            /@media\s*\(\s*max-width:\s*900px\s*\)[\s\S]*?#database-view\s+#teamwork-table[\s\S]*?--dbv-mobile-teamwork-portrait-img:\s*min\(\s*100%\s*,\s*870px\s*\)/
        );
        expect(css).toMatch(
            /@media\s*\(\s*max-width:\s*900px\s*\)[\s\S]*?#database-view\s+#teamwork-table\s+tbody\s+td:nth-child\(n\s*\+\s*3\)[\s\S]*?display:\s*none\s*!important/
        );
    });

    it('hides DTV teamwork desktop filter row on mobile layout and narrow #database-view', () => {
        expect(css).toMatch(
            /\.layout-mobile\s+#teamwork-table\s+thead\s+tr\.teamwork-desktop-filter-row\s*\{\s*display:\s*none\s*!important;\s*\}/
        );
        expect(css).toMatch(
            /#database-view\s+#teamwork-table\s+thead\s+tr\.teamwork-desktop-filter-row\s*\{\s*display:\s*none\s*!important;\s*\}/
        );
    });
});

describe('database-view.css (DBV Teamwork — desktop)', () => {
    let css: string;

    beforeAll(() => {
        const cssPath = path.join(__dirname, '../../public/css/database-view.css');
        css = readFileSync(cssPath, 'utf8');
    });

    it('hides mobile-only teamwork filter shell on desktop without !important (mobile-layout overrides)', () => {
        expect(css).toMatch(
            /#teamwork-table\s+thead\s+tr\.teamwork-filter-row\s*>\s*th\.teamwork-filter-clear-th\s*\{\s*display:\s*none;\s*\}/
        );
        expect(css).toMatch(
            /#teamwork-table\s+thead\s+tr\.teamwork-filter-row\s*>\s*th\.teamwork-filter-controls-th\s*\{\s*display:\s*none;\s*\}/
        );
        expect(css).toMatch(
            /#teamwork-table\s+\.teamwork-mobile-filter-shell\s*\{\s*display:\s*none;\s*\}/
        );
        const teamworkDesktopHide = css.match(
            /\/\* Teamwork: mobile-only filter row shell[\s\S]*?\/\* Missions:/
        );
        expect(teamworkDesktopHide).toBeTruthy();
        expect(teamworkDesktopHide![0]).not.toMatch(
            /\.teamwork-mobile-filter-shell\s*\{[^}]*display:\s*none\s*!important/
        );
    });

    it('styles DTV teamwork desktop filter row (vertical-align, To Use icon+numeric rows)', () => {
        expect(css).toMatch(
            /#teamwork-table\s+thead\s+tr\.teamwork-desktop-filter-row\s+th\s*\{\s*vertical-align:\s*top;\s*\}/
        );
        expect(css).toMatch(
            /#teamwork-table\s+\.teamwork-desktop-to-use-split\s*\{[\s\S]*?display:\s*flex/
        );
        expect(css).toMatch(
            /#teamwork-table\s+\.teamwork-desktop-to-use-icons-column\s*\{[\s\S]*?gap:\s*var\(\s*--teamwork-dtv-numeric-stack-gap\s*\)/
        );
        expect(css).toMatch(
            /#teamwork-table\s+\.teamwork-desktop-bonus-stack\s*\{[\s\S]*?gap:\s*var\(\s*--teamwork-dtv-numeric-stack-gap\s*\)/
        );
        expect(css).toMatch(
            /#teamwork-table\s+\.teamwork-desktop-bonus-stack\s*\{[\s\S]*?flex-direction:\s*column/
        );
    });
});

describe('DBV Teamwork markup (index.html + template)', () => {
    const indexPath = path.join(__dirname, '../../public/index.html');
    const templatePath = path.join(__dirname, '../../public/templates/database-view-complete.html');

    it('index.html includes teamwork mobile filter hooks and value inputs', () => {
        const html = readFileSync(indexPath, 'utf8');
        expect(html).toContain('teamwork-filter-row');
        expect(html).toContain('id="teamwork-to-use-equals"');
        expect(html).toContain('teamwork-to-use-min');
        expect(html).toContain('teamwork-to-use-max');
        expect(html).toContain('teamwork-to-use-power-toggles');
        expect(html).toContain('teamwork-mobile-to-use-equals');
        expect(html).toContain('teamwork-desktop-filter-row');
        expect(html).toContain('teamwork-desktop-to-use-split');
        expect(html).toContain('teamwork-desktop-to-use-icons-column');
        expect(html).toContain('teamwork-desktop-acts-as-toggles');
        expect(html).toContain('teamwork-desktop-followup-toggles');
        expect(html).toContain('teamwork-first-bonus-equals');
        expect(html).toContain('teamwork-desktop-bonus-stack');
        expect(html).toContain('clearTeamworkFilters()');
    });

    it('template mirrors teamwork filter structure', () => {
        const html = readFileSync(templatePath, 'utf8');
        expect(html).toContain('teamwork-filter-row');
        expect(html).toContain('id="teamwork-to-use-equals"');
        expect(html).toContain('teamwork-desktop-filter-row');
        expect(html).toContain('teamwork-desktop-to-use-split');
        expect(html).toContain('teamwork-desktop-to-use-icons-column');
        expect(html).toContain('teamwork-mobile-to-use-equals');
    });
});

describe('card-display.js renderTeamworkActsAsCell', () => {
    const jsPath = path.join(__dirname, '../../public/js/card-display.js');
    let source: string;

    beforeAll(() => {
        source = readFileSync(jsPath, 'utf8');
    });

    it('maps Acts As "4 Attack" to To Use power icon plus Attack label', () => {
        expect(source).toContain('function renderTeamworkActsAsCell');
        expect(source).toMatch(/rest\.toLowerCase\(\)\s*===\s*['"]attack['"]/);
        expect(source).toContain('function teamworkToUsePowerTypeForIcon');
        expect(source).toContain('renderAllyStatTypeIcon(attackIconType)');
        expect(source).toContain('teamwork-acts-as-type-label');
        expect(source).toContain('window.renderTeamworkActsAsCell = renderTeamworkActsAsCell');
    });
});

describe('card-data-display.js buildTeamworkMobileCaptionHtml', () => {
    const jsPath = path.join(__dirname, '../../public/js/card-data-display.js');
    let source: string;

    beforeAll(() => {
        source = readFileSync(jsPath, 'utf8');
    });

    it('exports caption helper and bonus normalizer for tests', () => {
        expect(source).toContain('function buildTeamworkMobileCaptionHtml');
        expect(source).toContain('function formatTeamworkBonusNormalized');
        expect(source).toContain('window.buildTeamworkMobileCaptionHtml = buildTeamworkMobileCaptionHtml');
        expect(source).toContain('renderTeamworkActsAsCell');
        expect(source).toContain('function parseTeamworkFollowupTokens');
        expect(source).toContain('function teamworkActsAsPowerTypeForFilter');
        expect(source).toContain('function teamworkBonusNumericFromField');
        expect(source).toContain('window.parseTeamworkFollowupTokens = parseTeamworkFollowupTokens');
    });

    it('emits teamwork caption class names in returned HTML string', () => {
        expect(source).toContain('characters-mobile-card-caption--teamwork');
        expect(source).toContain('characters-mobile-card-caption__teamwork-line1');
        expect(source).toContain('characters-mobile-card-caption__teamwork-line2');
        expect(source).toContain('characters-mobile-card-caption__teamwork-set-line');
        expect(source).toContain('dbvSetCaptionLineFromCard');
    });
});
