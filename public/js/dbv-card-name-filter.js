/**
 * Single source for DBV card/name filter inputs (desktop header + mobile rows).
 * Hosts keep outer classes; only children are filled. Filter logic stays in search-filter-functions.js / filter-functions.js.
 *
 * @see DBV_CARD_NAME_FILTER.md
 */
(function () {
    'use strict';

    /** @param {HTMLElement} el */
    function appendHeaderFilter(el, attrs) {
        const input = document.createElement('input');
        input.type = attrs.type || 'text';
        input.className = attrs.className;
        if (attrs.id) {
            input.id = attrs.id;
        }
        if (attrs.placeholder) {
            input.placeholder = attrs.placeholder;
        }
        if (attrs.dataColumn) {
            input.setAttribute('data-column', attrs.dataColumn);
        }
        if (attrs.ariaLabel) {
            input.setAttribute('aria-label', attrs.ariaLabel);
        }
        if (attrs.autocomplete != null) {
            input.setAttribute('autocomplete', attrs.autocomplete);
        }
        if (attrs.enterkeyhint) {
            input.setAttribute('enterkeyhint', attrs.enterkeyhint);
        }
        el.appendChild(input);
    }

    const PRESETS = {
        'characters-name'(el) {
            appendHeaderFilter(el, {
                className: 'header-filter',
                placeholder: 'Search names...',
            });
        },
        'specials-name'(el) {
            appendHeaderFilter(el, {
                className: 'header-filter',
                placeholder: 'Search card name...',
                dataColumn: 'name',
            });
        },
        'locations-name'(el) {
            appendHeaderFilter(el, {
                className: 'header-filter',
                placeholder: 'Search name…',
                dataColumn: 'name',
                ariaLabel: 'Filter locations by name',
            });
        },
        'aspects-name'(el) {
            appendHeaderFilter(el, {
                className: 'header-filter',
                placeholder: 'Search card name...',
                dataColumn: 'card_name',
            });
        },
        'missions-header-name'(el) {
            appendHeaderFilter(el, {
                type: 'search',
                id: 'missions-header-card-name-filter',
                className: 'header-filter',
                dataColumn: 'card_name',
                placeholder: 'Filter by name',
                ariaLabel: 'Filter missions by card name',
                autocomplete: 'off',
            });
        },
        'missions-mobile-name'(el) {
            const label = document.createElement('label');
            label.className = 'missions-mobile-set-label';
            label.setAttribute('for', 'missions-mobile-card-name-filter');
            label.textContent = 'Card name';
            el.appendChild(label);
            const input = document.createElement('input');
            input.type = 'search';
            input.id = 'missions-mobile-card-name-filter';
            input.className = 'missions-mobile-card-name-filter';
            input.setAttribute('aria-label', 'Filter missions by card name');
            input.placeholder = 'Filter by card name';
            input.setAttribute('autocomplete', 'off');
            input.setAttribute('enterkeyhint', 'search');
            el.appendChild(input);
        },
        'ally-desktop-name'(el) {
            appendHeaderFilter(el, {
                id: 'ally-card-name-filter',
                className: 'header-filter',
                placeholder: 'Search name...',
                dataColumn: 'card_name',
                ariaLabel: 'Filter allies by card name',
            });
        },
        'ally-mobile-name'(el) {
            appendHeaderFilter(el, {
                className: 'header-filter ally-universe-mobile-card-name-filter',
                placeholder: 'Search name...',
                dataColumn: 'card_name',
                ariaLabel: 'Filter allies by card name',
            });
        },
        'training-desktop-name'(el) {
            appendHeaderFilter(el, {
                id: 'training-card-name-filter',
                className: 'header-filter',
                placeholder: 'Filter name…',
                ariaLabel: 'Filter training cards by card name',
            });
        },
        'basic-desktop-name'(el) {
            const input = document.createElement('input');
            input.type = 'text';
            input.id = 'basic-universe-card-name-filter';
            input.className = 'filter-input basic-universe-desktop-card-name-input';
            input.placeholder = 'Name';
            input.setAttribute('autocomplete', 'off');
            input.setAttribute('aria-label', 'Filter by card name');
            el.appendChild(input);
        },
    };

    /**
     * @param {HTMLElement} container
     * @param {string} key
     */
    function renderPresetIntoContainer(container, key) {
        const fn = PRESETS[key];
        if (typeof fn !== 'function') {
            console.warn('[dbv-card-name-filter] Unknown preset:', key);
            return;
        }
        fn(container);
    }

    /**
     * Fill every `[data-dbv-name-filter]` container once (unless force).
     * @param {{ force?: boolean }} [options]
     */
    function initDbvCardNameFilters(options) {
        const force = Boolean(options && options.force);
        document.querySelectorAll('[data-dbv-name-filter]').forEach((el) => {
            if (!(el instanceof HTMLElement)) {
                return;
            }
            if (!force && el.dataset.dbvNameInitialized === '1') {
                return;
            }
            const key = el.getAttribute('data-dbv-name-filter');
            if (!key) {
                return;
            }
            el.textContent = '';
            delete el.dataset.dbvNameInitialized;
            renderPresetIntoContainer(el, key);
            el.dataset.dbvNameInitialized = '1';
        });
    }

    window.initDbvCardNameFilters = initDbvCardNameFilters;

    function runInit() {
        initDbvCardNameFilters();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', runInit);
    } else {
        runInit();
    }
})();
