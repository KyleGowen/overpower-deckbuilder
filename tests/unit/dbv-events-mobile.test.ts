/**
 * DBV Events tab — mobile view contract (CSS, markup, displayEvents, filters).
 */
import { readFileSync } from 'fs';
import path from 'path';

describe('mobile-layout.css (DBV Events tab)', () => {
    let css: string;

    beforeAll(() => {
        const cssPath = path.join(__dirname, '../../public/css/mobile-layout.css');
        css = readFileSync(cssPath, 'utf8');
    });

    it('documents Events mobile filter shell and tbody card rows', () => {
        expect(css).toContain('Events tab — mobile filter shell');
        expect(css).toMatch(
            /\.layout-mobile\s+#events-table\s+thead\s+tr\.events-filter-row[\s\S]*?display:\s*flex[\s\S]*?border-radius:\s*12px/
        );
        expect(css).toMatch(
            /\.layout-mobile\s+#events-table\s+thead\s+tr\.events-filter-row\s*>\s*th\.events-filter-clear-th[\s\S]*?display:\s*none\s*!important/
        );
    });

    it('shows mission-set select row on mobile (grid select + clear)', () => {
        expect(css).toMatch(/\.layout-mobile\s+#events-table\s+\.events-mobile-set-row[\s\S]*?display:\s*flex/);
        expect(css).toMatch(
            /\.layout-mobile\s+#events-table\s+\.events-mobile-set-select-clear-row[\s\S]*?grid-template-columns:\s*8fr\s+2fr/
        );
        expect(css).toMatch(
            /#database-view\s+#events-table\s+\.events-mobile-set-select-clear-row[\s\S]*?grid-template-columns:\s*8fr\s+2fr/
        );
        expect(css).toMatch(/\.layout-mobile\s+#events-table\s+\.events-mission-set-filter[\s\S]*?min-height:\s*44px/);
    });

    it('lays out tbody as card rows with hidden detail columns', () => {
        expect(css).toMatch(
            /\.layout-mobile\s+#events-table\s+tbody\s+tr[\s\S]*?display:\s*block[\s\S]*?border-radius:\s*10px/
        );
        expect(css).toMatch(
            /\.layout-mobile\s+#events-table\s+tbody\s+td:nth-child\(n\s*\+\s*3\)[\s\S]*?display:\s*none\s*!important/
        );
    });

    it('defines portrait max-height override for Events art', () => {
        expect(css).toMatch(
            /\.layout-mobile\s+#events-table\s+tbody\s+td:first-child\s+\.card-image-container:not\(\.card-image-container--with-nav\)\s+img:not\(\.horizontal-card\)[\s\S]*?max-height:\s*none\s*!important/
        );
    });

    it('styles Events caption: mission set + game effect 1rem, half-line gap, centered 20% flavor divider + italic', () => {
        expect(css).toMatch(
            /\.layout-mobile\s+#events-table\s+tbody\s+td:first-child\s+\.characters-mobile-card-caption__set\s*\{[\s\S]*?font-size:\s*1rem/
        );
        expect(css).toMatch(
            /\.layout-mobile\s+#events-table\s+tbody\s+td:first-child\s+\.characters-mobile-card-caption__game-effect\s*\{[\s\S]*?margin-top:\s*calc\(0\.5\s*\*\s*1\.35em\)[\s\S]*?font-size:\s*1rem/
        );
        expect(css).toMatch(
            /\.layout-mobile\s+#events-table\s+tbody\s+td:first-child\s+\.characters-mobile-card-caption__flavor::before[\s\S]*?width:\s*20%[\s\S]*?margin:\s*0\s+auto\s+10px[\s\S]*?border-top:\s*1px\s+solid\s+rgba\(78,\s*205,\s*196,\s*0\.35\)/
        );
        expect(css).toMatch(
            /\.layout-mobile\s+#events-table\s+tbody\s+td:first-child\s+\.characters-mobile-card-caption__set-line::before[\s\S]*?width:\s*20%[\s\S]*?border-top:\s*1px\s+solid\s+rgba\(78,\s*205,\s*196,\s*0\.35\)/
        );
        expect(css).toMatch(
            /#database-view\s+#events-table\s+tbody\s+td:first-child\s+\.characters-mobile-card-caption__game-effect[\s\S]*?font-size:\s*1rem[\s\S]*?margin-top:\s*calc\(0\.5\s*\*\s*1\.35em\)/
        );
        expect(css).toMatch(
            /#database-view\s+#events-table\s+tbody\s+td:first-child\s+\.characters-mobile-card-caption__set-line::before[\s\S]*?width:\s*20%[\s\S]*?border-top:\s*1px\s+solid\s+rgba\(78,\s*205,\s*196,\s*0\.35\)/
        );
    });

    it('mirrors Events tbody + filter shell at max-width 900px', () => {
        expect(css).toMatch(
            /@media\s*\(\s*max-width:\s*900px\s*\)[\s\S]*?#database-view\s+#events-table[\s\S]*?tbody\s+tr[\s\S]*?display:\s*block/
        );
        expect(css).toMatch(
            /@media\s*\(\s*max-width:\s*900px\s*\)[\s\S]*?#database-view\s+#events-table\s+\.events-mobile-set-row[\s\S]*?display:\s*flex/
        );
    });

    it('uses teal #4ecdc4 for events mission-set dropdown label', () => {
        expect(css).toMatch(
            /\.layout-mobile\s+#events-table\s+\.events-mobile-set-label\s*\{[\s\S]*?color:\s*#4ecdc4/
        );
    });
});

describe('database-view.css (DBV Events — desktop)', () => {
    let css: string;

    beforeAll(() => {
        const cssPath = path.join(__dirname, '../../public/css/database-view.css');
        css = readFileSync(cssPath, 'utf8');
    });

    it('shows events mission-set select row on desktop (same shell as Missions)', () => {
        expect(css).toMatch(/#events-table\s+\.events-mobile-set-row\s*\{[\s\S]*?display:\s*flex/);
    });

    it('hides mobile inline clear on desktop', () => {
        expect(css).toMatch(
            /#events-table\s+#clear-events-filters-mobile\.clear-filters-btn--events-mobile-inline\s*\{[\s\S]*?display:\s*none/
        );
    });
});

describe('DBV Events mobile markup (index.html + template)', () => {
    const indexPath = path.join(__dirname, '../../public/index.html');
    const templatePath = path.join(__dirname, '../../public/templates/database-view-complete.html');

    it('index.html includes Events mobile filter hooks', () => {
        const html = readFileSync(indexPath, 'utf8');
        expect(html).toContain('events-filter-row');
        expect(html).toContain('id="events-mission-set-filter"');
        expect(html).toContain('events-mission-set-filter');
        expect(html).toContain('events-mobile-set-select-clear-row');
        expect(html).toContain('clear-events-filters-mobile');
        expect(html).toContain('onclick="clearEventsFilters()"');
    });

    it('template mirrors index Events structure (6-column table)', () => {
        const html = readFileSync(templatePath, 'utf8');
        expect(html).toContain('events-filter-row');
        expect(html).toContain('id="events-mission-set-filter"');
        expect(html).toContain('events-mobile-set-select-clear-row');
        expect(html).toContain('colspan="6" class="loading">Loading events');
    });
});

describe('card-display-functions.js displayEvents (mobile row contract)', () => {
    const jsPath = path.join(__dirname, '../../public/js/card-display-functions.js');
    let source: string;

    beforeAll(() => {
        source = readFileSync(jsPath, 'utf8');
    });

    it('uses card-image-container, caption stack, horizontal class hook, data-full-res; no Actions data-label (MV pseudo-heading)', () => {
        expect(source).toContain('data-label="Image"');
        expect(source).not.toContain('data-label="Actions"');
        expect(source).toContain('class="card-image-container"');
        expect(source).toContain('characters-mobile-card-caption__game-effect');
        expect(source).toContain('characters-mobile-card-caption__flavor');
        expect(source).toContain('characters-mobile-card-caption__set-line');
        expect(source).toContain('dbvSetCaptionLineFromCard');
        expect(source).toContain('applyDbvHorizontalCardClass');
        expect(source).toContain('data-full-res=');
    });
});

describe('search-filter-functions.js (Events filters)', () => {
    const jsPath = path.join(__dirname, '../../public/js/search-filter-functions.js');
    let source: string;

    beforeAll(() => {
        source = readFileSync(jsPath, 'utf8');
    });

    it('defines populateEventsMissionSetSelect and applyEventsFilters using mission-set select', () => {
        expect(source).toContain('function populateEventsMissionSetSelect()');
        expect(source).toContain('window.populateEventsMissionSetSelect = populateEventsMissionSetSelect');
        expect(source).toContain('window.applyEventsFilters = applyEventsFilters');
        expect(source).toContain("getElementById('events-mission-set-filter')");
        expect(source).not.toMatch(/#events-tab input\[type="checkbox"\]/);
    });
});

describe('card-data-display.js (loadEvents)', () => {
    const jsPath = path.join(__dirname, '../../public/js/card-data-display.js');
    let source: string;

    beforeAll(() => {
        source = readFileSync(jsPath, 'utf8');
    });

    it('after eventsData, populate select then applyEventsFilters', () => {
        expect(source).toMatch(/populateEventsMissionSetSelect/);
        expect(source).toMatch(/applyEventsFilters/);
    });
});

describe('filter-functions.js (clearEventsFilters)', () => {
    const jsPath = path.join(__dirname, '../../public/js/filter-functions.js');
    let source: string;

    beforeAll(() => {
        source = readFileSync(jsPath, 'utf8');
    });

    it('clears search, game effect, resets mission-set select, reloads events', () => {
        expect(source).toContain('function clearEventsFilters()');
        expect(source).toContain("getElementById('events-mission-set-filter')");
        expect(source).toContain('loadEvents()');
    });
});
