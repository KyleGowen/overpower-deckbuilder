/**
 * DBV Missions tab — mobile view contract (CSS, markup, displayMissions output).
 */
import { readFileSync } from 'fs';
import path from 'path';

describe('mobile-layout.css (DBV Missions tab)', () => {
    let css: string;

    beforeAll(() => {
        const cssPath = path.join(__dirname, '../../public/css/mobile-layout.css');
        css = readFileSync(cssPath, 'utf8');
    });

    it('documents Missions mobile filter shell and hides desktop-only thead cells', () => {
        expect(css).toContain('Missions tab — mobile filter shell');
        expect(css).toMatch(
            /\.layout-mobile\s+#missions-table\s+thead\s+tr\.missions-filter-row[\s\S]*?display:\s*flex[\s\S]*?border-radius:\s*12px/
        );
        expect(css).toMatch(
            /\.layout-mobile\s+#missions-table\s+thead\s+tr\.missions-filter-row\s*>\s*th\.missions-filter-clear-th[\s\S]*?display:\s*none\s*!important/
        );
    });

    it('hides checkbox group and shows mission-set select on mobile', () => {
        expect(css).toMatch(/\.layout-mobile\s+#missions-table\s+\.missions-checkbox-group[\s\S]*?display:\s*none\s*!important/);
        expect(css).toMatch(/\.layout-mobile\s+#missions-table\s+\.missions-mobile-set-row[\s\S]*?display:\s*flex/);
        expect(css).toMatch(/\.layout-mobile\s+#missions-table\s+\.missions-mission-set-filter[\s\S]*?min-height:\s*44px/);
    });

    it('lays out tbody as card rows with hidden detail columns', () => {
        expect(css).toMatch(
            /\.layout-mobile\s+#missions-table\s+tbody\s+tr[\s\S]*?display:\s*block[\s\S]*?border-radius:\s*10px/
        );
        expect(css).toMatch(
            /\.layout-mobile\s+#missions-table\s+tbody\s+td:nth-child\(n\+3\)[\s\S]*?display:\s*none\s*!important/
        );
    });

    it('defines Missions art tokens and portrait max-height override', () => {
        expect(css).toMatch(
            /\.layout-mobile\s+#missions-table\s*\{[\s\S]*?--dbv-mobile-missions-portrait-img:\s*min\(\s*100%\s*,\s*870px\s*\)/
        );
        expect(css).toMatch(
            /\.layout-mobile\s+#missions-table\s+tbody\s+td:first-child\s+\.card-image-container:not\(\.card-image-container--with-nav\)\s+img:not\(\.horizontal-card\)[\s\S]*?max-height:\s*none\s*!important/
        );
    });

    it('styles mobile caption lines for mission set and product set + number', () => {
        expect(css).toMatch(
            /\.layout-mobile\s+#missions-table\s+tbody\s+td:first-child\s+\.characters-mobile-card-caption__mission-set[\s\S]*?font-size:\s*1rem/
        );
        expect(css).toMatch(
            /\.layout-mobile\s+#missions-table\s+tbody\s+td:first-child\s+\.characters-mobile-card-caption__set-line[\s\S]*?font-size:\s*0\.875rem/
        );
    });

    it('mirrors Missions tbody + filter shell at max-width 900px', () => {
        expect(css).toMatch(
            /@media\s*\(\s*max-width:\s*900px\s*\)[\s\S]*?#database-view\s+#missions-table[\s\S]*?--dbv-mobile-missions-portrait-img:\s*min\(\s*100%\s*,\s*870px\s*\)/
        );
        expect(css).toMatch(
            /@media\s*\(\s*max-width:\s*900px\s*\)[\s\S]*?#database-view\s+#missions-table\s+\.missions-checkbox-group[\s\S]*?display:\s*none\s*!important/
        );
    });

    it('uses teal #4ecdc4 for mission-set dropdown label (matches DBV data-label accent)', () => {
        expect(css).toMatch(
            /\.layout-mobile\s+#missions-table\s+\.missions-mobile-set-label\s*\{[\s\S]*?color:\s*#4ecdc4/
        );
        expect(css).toMatch(
            /@media\s*\(\s*max-width:\s*900px\s*\)[\s\S]*?#database-view\s+#missions-table\s+\.missions-mobile-set-label\s*\{[\s\S]*?color:\s*#4ecdc4/
        );
    });
});

describe('database-view.css (DBV Missions — desktop)', () => {
    let css: string;

    beforeAll(() => {
        const cssPath = path.join(__dirname, '../../public/css/database-view.css');
        css = readFileSync(cssPath, 'utf8');
    });

    it('hides mobile-only mission set row on desktop', () => {
        expect(css).toMatch(/#missions-table\s+\.missions-mobile-set-row\s*\{[\s\S]*?display:\s*none/);
    });

    it('hides missions filter-row placeholder th (no Clear button column)', () => {
        expect(css).toMatch(/#missions-table\s+\.missions-filter-clear-th\s*\{[\s\S]*?display:\s*none\s*!important/);
    });
});

describe('DBV Missions mobile markup (index.html + template)', () => {
    const indexPath = path.join(__dirname, '../../public/index.html');
    const templatePath = path.join(__dirname, '../../public/templates/database-view-complete.html');

    it('index.html includes Missions mobile filter hooks (no tab-level Clear control)', () => {
        const html = readFileSync(indexPath, 'utf8');
        expect(html).toContain('missions-filter-row');
        expect(html).toContain('id="missions-mission-set-filter"');
        expect(html).toContain('missions-mission-set-filter');
        expect(html).toContain('missions-checkbox-group');
        expect(html).not.toContain('clear-missions-filters-mobile');
        expect(html).not.toContain('onclick="clearMissionsFilters()"');
    });

    it('template mirrors index Missions structure (4-column table)', () => {
        const html = readFileSync(templatePath, 'utf8');
        expect(html).toContain('missions-filter-row');
        expect(html).toContain('id="missions-mission-set-filter"');
        expect(html).toContain('colspan="4" class="loading">Loading missions');
        expect(html).not.toContain('onclick="clearMissionsFilters()"');
    });
});

describe('card-display-functions.js displayMissions (mobile row contract)', () => {
    const jsPath = path.join(__dirname, '../../public/js/card-display-functions.js');
    let source: string;

    beforeAll(() => {
        source = readFileSync(jsPath, 'utf8');
    });

    it('uses missionUseMobileListArt and mission caption + lightbox context', () => {
        expect(source).toContain('function missionUseMobileListArt()');
        expect(source).toContain('data-dbv-lightbox-context="mission"');
        expect(source).toContain('characters-mobile-card-caption__mission-set');
        expect(source).toContain('characters-mobile-card-caption__set-line');
        expect(source).toContain('window.dbvSetCaptionLineFromCard');
    });
});

describe('search-filter-functions.js (Missions filters)', () => {
    const jsPath = path.join(__dirname, '../../public/js/search-filter-functions.js');
    let source: string;

    beforeAll(() => {
        source = readFileSync(jsPath, 'utf8');
    });

    it('defines populate select, mobile/desktop filter routing, and window exports', () => {
        expect(source).toContain('function missionsFilterUsesMobileSelect()');
        expect(source).toContain('function populateMissionsMissionSetSelect()');
        expect(source).toContain('window.populateMissionsMissionSetSelect = populateMissionsMissionSetSelect');
        expect(source).toContain('window.applyMissionFilters = applyMissionFilters');
        expect(source).toContain("getElementById('missions-mission-set-filter')");
    });

    it('applyMissionFilters intersects search text with mission set selection', () => {
        expect(source).toContain('const rawTerm = searchInput && searchInput.value ? searchInput.value.trim().toLowerCase()');
        expect(source).toContain('let pool = missions');
        expect(source).toContain('missionsFilterUsesMobileSelect()');
    });

    it('re-runs applyMissionFilters on layout-mode-change when Missions tab is visible (caption vs hidden columns)', () => {
        expect(source).toContain('dataset.missionLayoutModeBound');
        expect(source).toContain("'layout-mode-change'");
        expect(source).toMatch(/layout-mode-change[\s\S]{0,400}applyMissionFilters\(\)/);
    });
});

describe('card-data-display.js (loadMissions)', () => {
    const jsPath = path.join(__dirname, '../../public/js/card-data-display.js');
    let source: string;

    beforeAll(() => {
        source = readFileSync(jsPath, 'utf8');
    });

    it('cached path: after missionsData, populate select then applyMissionFilters', () => {
        expect(source).toMatch(
            /window\.missionsData\s*=\s*cached;\s*\n\s*if\s*\(typeof populateMissionsMissionSetSelect/
        );
        expect(source).toMatch(
            /populateMissionsMissionSetSelect\(\);\s*\n\s*if\s*\(typeof applyMissionFilters/
        );
    });

    it('API success path: same populate + apply after missionsData', () => {
        expect(source).toMatch(
            /window\.missionsData\s*=\s*data\.data;\s*\n\s*if\s*\(typeof populateMissionsMissionSetSelect/
        );
    });
});

describe('filter-functions.js (clearMissionsFilters)', () => {
    const jsPath = path.join(__dirname, '../../public/js/filter-functions.js');
    let source: string;

    beforeAll(() => {
        source = readFileSync(jsPath, 'utf8');
    });

    it('clears search, resets checkboxes and select, reloads missions', () => {
        expect(source).toContain('function clearMissionsFilters()');
        expect(source).toContain("getElementById('missions-mission-set-filter')");
        expect(source).toContain('loadMissions()');
        expect(source).toContain("searchInput.value = ''");
        expect(source).not.toMatch(/function clearMissionsFilters\(\)\s*\{\s*applyFilters\(\)/);
    });
});

describe('dbv-render-shared.js (DBV set caption helper)', () => {
    const jsPath = path.join(__dirname, '../../public/js/dbv/dbv-render-shared.js');
    let source: string;

    beforeAll(() => {
        source = readFileSync(jsPath, 'utf8');
    });

    it('exports dbvSetCaptionLineFromCard for missions caption', () => {
        expect(source).toContain('function dbvSetCaptionLineFromCard(card)');
        expect(source).toContain('window.dbvSetCaptionLineFromCard = dbvSetCaptionLineFromCard');
    });
});
