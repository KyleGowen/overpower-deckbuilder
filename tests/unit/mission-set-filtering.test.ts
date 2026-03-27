/**
 * Mission set filtering — DTV + MV use `#missions-mission-set-filter` (no Missions-tab checkboxes).
 */
import { readFileSync } from 'fs';
import path from 'path';

describe('Mission set filtering (source contract)', () => {
    it('clearAllFiltersGlobally unchecks all checkboxes (no Missions-tab exception)', () => {
        const jsPath = path.join(__dirname, '../../public/js/search-filter.js');
        const src = readFileSync(jsPath, 'utf8');
        expect(src).toContain('checkbox.checked = false');
        expect(src).not.toContain('King of the Jungle');
    });

    it('applyMissionFilters uses mission-set select for all layouts', () => {
        const jsPath = path.join(__dirname, '../../public/js/search-filter-functions.js');
        const src = readFileSync(jsPath, 'utf8');
        expect(src).toContain("getElementById('missions-mission-set-filter')");
        expect(src).toContain('m.mission_set === v');
        expect(src).not.toContain('#missions-tab input[type="checkbox"]');
    });

    it('setupMissionSearch does not bind Missions checkboxes', () => {
        const jsPath = path.join(__dirname, '../../public/js/search-filter-functions.js');
        const src = readFileSync(jsPath, 'utf8');
        expect(src).not.toMatch(/#missions-tab input\[type="checkbox"\]/);
    });

    it('clearMissionsFilters resets select and card-name fields only', () => {
        const jsPath = path.join(__dirname, '../../public/js/filter-functions.js');
        const src = readFileSync(jsPath, 'utf8');
        expect(src).toMatch(/function clearMissionsFilters\(\)[\s\S]+?missions-mission-set-filter[\s\S]+?missions-header-card-name-filter/);
        expect(src).not.toContain("querySelectorAll('#missions-tab input[type=\"checkbox\"]')");
    });
});
