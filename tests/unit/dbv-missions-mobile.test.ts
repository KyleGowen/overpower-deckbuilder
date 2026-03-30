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
            /\.layout-mobile\s+#missions-table\s+thead\s+tr\.missions-filter-row\s*>\s*th\.missions-filter-leading-th[\s\S]*?display:\s*none\s*!important/
        );
        expect(css).toMatch(
            /\.layout-mobile\s+#missions-table\s+thead\s+tr\.missions-filter-row\s*>\s*th\.missions-filter-card-name-th[\s\S]*?display:\s*none\s*!important/
        );
    });

    it('shows mission-set select shell on mobile', () => {
        expect(css).toMatch(/\.layout-mobile\s+#missions-table\s+\.missions-mobile-set-row[\s\S]*?display:\s*flex/);
        expect(css).toMatch(
            /\.layout-mobile\s+#missions-table\s+\.missions-mobile-set-row\s*,\s*\.layout-mobile\s+#missions-table\s+\.missions-mobile-card-name-row\s*\{[\s\S]*?display:\s*flex/
        );
        expect(css).toMatch(
            /\.layout-mobile\s+#missions-table\s+\.missions-mission-set-filter\s*,\s*\.layout-mobile\s+#missions-table\s+\.missions-mobile-card-name-filter\s*\{[\s\S]*?min-height:\s*44px/
        );
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

    it('shows mission-set row on desktop; hides mobile-only card-name row', () => {
        expect(css).toMatch(/#missions-table\s+\.missions-mobile-set-row\s*\{[\s\S]*?display:\s*flex/);
        expect(css).toMatch(/#missions-table\s+\.missions-mobile-card-name-row\s*\{[\s\S]*?display:\s*none/);
    });

    it('hides redundant mission-set inline label on DTV (thead already says Mission Set)', () => {
        expect(css).toMatch(
            /#missions-table\s+\.missions-mobile-set-row\s*>\s*\.missions-mobile-set-label\s*\{[\s\S]*?display:\s*none/
        );
    });

    it('keeps filter-row column alignment via colspan leading th (not display:none on a cell)', () => {
        expect(css).toMatch(/#missions-table\s+\.missions-filter-leading-th\s*\{[\s\S]*?padding:\s*0/);
        expect(css).not.toMatch(
            /#missions-table\s+\.missions-filter-clear-th\s*\{[\s\S]*?display:\s*none\s*!important/
        );
    });
});

describe('DBV Missions mobile markup (index.html + template)', () => {
    const indexPath = path.join(__dirname, '../../public/index.html');
    const templatePath = path.join(__dirname, '../../public/templates/database-view-complete.html');

    it('index.html includes Missions mobile filter hooks (no tab-level Clear control)', () => {
        const html = readFileSync(indexPath, 'utf8');
        expect(html).toContain('missions-filter-row');
        expect(html).toContain('colspan="2"');
        expect(html).toContain('missions-filter-leading-th');
        expect(html).not.toContain('missions-filter-clear-th');
        expect(html).toContain('data-dbv-mission-set-filter="missions"');
        expect(html).toContain('dbv-mission-set-filter.js');
        expect(html).toContain('missions-mobile-set-row');
        expect(html).toContain('data-dbv-name-filter="missions-mobile-name"');
        expect(html).toContain('missions-mobile-card-name-row');
        expect(html).toContain('data-dbv-name-filter="missions-header-name"');
        expect(html).toContain('missions-filter-card-name-th');
        expect(html).toContain('dbv-card-name-filter.js');
        expect(html).not.toContain('missions-checkbox-group');
        expect(html).not.toContain('clear-missions-filters-mobile');
        expect(html).not.toContain('onclick="clearMissionsFilters()"');
    });

    it('template mirrors index Missions structure (5-column table)', () => {
        const html = readFileSync(templatePath, 'utf8');
        expect(html).toContain('missions-filter-row');
        expect(html).toContain('colspan="2"');
        expect(html).toContain('missions-filter-leading-th');
        expect(html).toContain('data-dbv-mission-set-filter="missions"');
        expect(html).toContain('missions-mobile-set-row');
        expect(html).toContain('data-dbv-name-filter="missions-mobile-name"');
        expect(html).toContain('data-dbv-name-filter="missions-header-name"');
        expect(html).toMatch(
            /id="missions-table"[\s\S]*?<th>Card Name<\/th>\s*<th>Set<\/th>/
        );
        expect(html).toContain('colspan="5" class="loading">Loading missions');
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

    it('DTV tbody includes product Set column after Card Name (colspan 5 empty state)', () => {
        expect(source).toContain('colspan="5">No missions found');
        expect(source).toContain("${esc(String(setLine || '').trim())}");
    });
});

describe('search-filter-functions.js (Missions filters)', () => {
    const jsPath = path.join(__dirname, '../../public/js/search-filter-functions.js');
    let source: string;

    beforeAll(() => {
        source = readFileSync(jsPath, 'utf8');
    });

    it('defines mobile/desktop filter routing, applyMissionFilters, and window export', () => {
        expect(source).toContain('function missionsFilterUsesMobileSelect()');
        expect(source).toContain('window.applyMissionFilters = applyMissionFilters');
        expect(source).toContain("getElementById('missions-mission-set-filter')");
        expect(source).toContain("getElementById('missions-mobile-card-name-filter')");
        expect(source).toContain("getElementById('missions-header-card-name-filter')");
    });

    it('applyMissionFilters intersects search text with mission set select', () => {
        expect(source).toContain('const rawTerm = searchInput && searchInput.value ? searchInput.value.trim().toLowerCase()');
        expect(source).toContain('let pool = missions');
        expect(source).toContain('missionsFilterUsesMobileSelect()');
        expect(source).toContain('m.mission_set === v');
    });

    it('re-runs applyMissionFilters on layout-mode-change when Missions tab is visible (caption vs hidden columns)', () => {
        expect(source).toContain('dataset.missionLayoutModeBound');
        expect(source).toContain("'layout-mode-change'");
        expect(source).toMatch(/layout-mode-change[\s\S]{0,400}applyMissionFilters\(\)/);
    });
});

describe('dbv-mission-set-filter.js (Missions mount + populate)', () => {
    const jsPath = path.join(__dirname, '../../public/js/dbv-mission-set-filter.js');
    let source: string;

    beforeAll(() => {
        source = readFileSync(jsPath, 'utf8');
    });

    it('exposes init, populate, and missions preset key', () => {
        expect(source).toContain('function initDbvMissionSetFilters(');
        expect(source).toContain('window.initDbvMissionSetFilters = initDbvMissionSetFilters');
        expect(source).toContain('function populateMissionsMissionSetSelect()');
        expect(source).toContain('window.populateMissionsMissionSetSelect = populateMissionsMissionSetSelect');
        expect(source).toContain("populateMissionSetSelect('missions-mission-set-filter'");
        expect(source).toMatch(/data-dbv-mission-set-filter|dbvMissionSetInitialized/);
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

    it('clears search, resets mission-set select and card-name inputs, reloads missions', () => {
        expect(source).toContain('function clearMissionsFilters()');
        expect(source).toContain("getElementById('missions-mission-set-filter')");
        expect(source).toContain("getElementById('missions-mobile-card-name-filter')");
        expect(source).toContain("getElementById('missions-header-card-name-filter')");
        expect(source).toContain('loadMissions()');
        expect(source).toContain("searchInput.value = ''");
        expect(source).not.toContain("querySelectorAll('#missions-tab input[type=\"checkbox\"]')");
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

    it('appends foil suffix to set caption when is_foil is true', () => {
        expect(source).toContain('is_foil');
        expect(source).toContain(' · Foil');
    });
});
