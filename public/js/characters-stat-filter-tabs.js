/**
 * Characters DBV: mobile-only tab switching for merged stat filter cell (#characters-table).
 * Desktop shows all five stat filter columns; layout-mobile shows one panel at a time.
 * Filtering still reads all .filter-input values (card-filter-toggles.js).
 */
(function charactersStatFilterTabsInit() {
    var DEFAULT_STAT = 'energy';
    var EQUALS_PLACEHOLDER_DESKTOP = '=';
    var EQUALS_PLACEHOLDER_MOBILE = 'Equals';

    function getTable() {
        return document.getElementById('characters-table');
    }

    function isLayoutMobile() {
        return document.documentElement.classList.contains('layout-mobile');
    }

    function selectStatTab(stat) {
        var table = getTable();
        if (!table) return;

        var tabs = table.querySelectorAll('.characters-stat-tab[data-stat-tab]');
        var panels = table.querySelectorAll('.characters-stat-panel[data-stat-panel]');

        tabs.forEach(function (btn) {
            var on = btn.getAttribute('data-stat-tab') === stat;
            btn.setAttribute('aria-selected', on ? 'true' : 'false');
            btn.tabIndex = on ? 0 : -1;
        });

        panels.forEach(function (panel) {
            var on = panel.getAttribute('data-stat-panel') === stat;
            if (on) {
                panel.classList.add('is-active');
            } else {
                panel.classList.remove('is-active');
            }
        });
    }

    function ensureMobileTabState() {
        if (!isLayoutMobile()) return;
        var table = getTable();
        if (!table) return;
        var active = table.querySelector('.characters-stat-panel.is-active');
        if (!active) {
            selectStatTab(DEFAULT_STAT);
            return;
        }
        var stat = active.getAttribute('data-stat-panel');
        if (stat) {
            selectStatTab(stat);
        }
    }

    function syncEqualsInputPlaceholders() {
        var table = getTable();
        if (!table) return;
        var ph = isLayoutMobile() ? EQUALS_PLACEHOLDER_MOBILE : EQUALS_PLACEHOLDER_DESKTOP;
        table.querySelectorAll('.filter-input.equals').forEach(function (input) {
            input.placeholder = ph;
        });
    }

    function onLayoutModeChange() {
        ensureMobileTabState();
        syncEqualsInputPlaceholders();
    }

    function bindTable(table) {
        if (!table || table.dataset.charactersStatTabsBound === '1') return;
        table.dataset.charactersStatTabsBound = '1';

        table.addEventListener('click', function (ev) {
            if (!isLayoutMobile()) return;
            var btn = ev.target.closest('.characters-stat-tab[data-stat-tab]');
            if (!btn || !table.contains(btn)) return;
            var stat = btn.getAttribute('data-stat-tab');
            if (stat) selectStatTab(stat);
        });
    }

    function init() {
        var table = getTable();
        bindTable(table);
        ensureMobileTabState();
        syncEqualsInputPlaceholders();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    window.addEventListener('layout-mode-change', onLayoutModeChange);
})();
