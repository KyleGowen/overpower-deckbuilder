/**
 * Single source for DBV power-type icon toggle buttons (six icons + MP).
 * Containers keep their existing classes, role, aria-label, and data-*; only children are filled.
 *
 * @see matchesIconsPowerTypeFilters in dbv-icon-filter-logic.js (Special + Aspects icon matching).
 */
(function () {
    'use strict';

    const IMG_BASE = '/src/resources/images/icons/';

    const TYPE_ROWS = [
        { dataType: 'Energy', img: 'energy.png' },
        { dataType: 'Intelligence', img: 'intelligence.png' },
        { dataType: 'Combat', img: 'combat.png' },
        { dataType: 'Any-Power', img: 'any-power.png' },
        { dataType: 'Brute Force', img: 'brute_force.png' },
    ];

    /** @typedef {'default'|'actsAs'|'followup'|'statType'|'attackType'|'attackFilter'|'type1'|'type2'} AriaMode */

    const ARIA_BUILDERS = {
        default: (title) => `Toggle ${title} filter`,
        actsAs: (title) => `Toggle ${title} filter for Acts As`,
        followup: (title) => `Toggle ${title} filter for followup`,
        statType: (title) => `Toggle ${title} stat type filter`,
        attackType: (title) => `Toggle ${title} attack type filter`,
        attackFilter: (title) => `Toggle ${title} attack filter`,
        type1: (title) => `Toggle ${title} Type 1 filter`,
        type2: (title) => `Toggle ${title} Type 2 filter`,
    };

    /**
     * @param {string} multiValue - `Multi-Power` or `Multi Power` (data-power-type + title)
     * @param {AriaMode} ariaMode
     * @param {boolean} imgLazy
     * @returns {HTMLButtonElement}
     */
    function makeMultiButton(multiValue, ariaMode, imgLazy) {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'power-type-filter-toggle';
        btn.setAttribute('data-power-type', multiValue);
        btn.title = multiValue;
        btn.setAttribute('aria-label', ARIA_BUILDERS[ariaMode](multiValue));
        btn.setAttribute('aria-pressed', 'false');
        const span = document.createElement('span');
        span.className = 'power-type-filter-text';
        span.textContent = 'MP';
        btn.appendChild(span);
        return btn;
    }

    /**
     * @param {{ dataType: string, img: string }} spec
     * @param {AriaMode} ariaMode
     * @param {boolean} imgLazy
     * @returns {HTMLButtonElement}
     */
    function makeImgButton(spec, ariaMode, imgLazy) {
        const title = spec.dataType;
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'power-type-filter-toggle';
        btn.setAttribute('data-power-type', spec.dataType);
        btn.title = title;
        btn.setAttribute('aria-label', ARIA_BUILDERS[ariaMode](title));
        btn.setAttribute('aria-pressed', 'false');
        const img = document.createElement('img');
        img.src = IMG_BASE + spec.img;
        img.alt = title;
        if (imgLazy) {
            img.loading = 'lazy';
        }
        btn.appendChild(img);
        return btn;
    }

    /**
     * @param {Array<{ dataType: string, img: string }>} rowSpecs
     * @param {string} multiValue
     * @param {AriaMode} ariaMode
     * @param {boolean} imgLazy
     * @param {boolean} [includeMulti=true]
     * @returns {DocumentFragment}
     */
    function buildButtonFragment(rowSpecs, multiValue, ariaMode, imgLazy, includeMulti = true) {
        const frag = document.createDocumentFragment();
        rowSpecs.forEach((spec) => frag.appendChild(makeImgButton(spec, ariaMode, imgLazy)));
        if (includeMulti) {
            frag.appendChild(makeMultiButton(multiValue, ariaMode, imgLazy));
        }
        return frag;
    }

    function makeNoIconLabel(config) {
        const label = document.createElement('label');
        label.className = 'special-no-icon-toggle-label';
        label.title = 'Show only cards with no power type icon';
        const input = document.createElement('input');
        input.type = 'checkbox';
        input.id = config.id;
        input.className = 'visually-hidden';
        input.setAttribute('aria-label', config.ariaLabel);
        const face = document.createElement('span');
        face.className = 'special-no-icon-toggle-face';
        face.setAttribute('aria-hidden', 'true');
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('class', 'special-no-icon-svg');
        svg.setAttribute('viewBox', '0 0 24 24');
        svg.setAttribute('focusable', 'false');
        const c = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        c.setAttribute('cx', '12');
        c.setAttribute('cy', '12');
        c.setAttribute('r', '8');
        c.setAttribute('fill', 'none');
        c.setAttribute('stroke', 'currentColor');
        c.setAttribute('stroke-width', '2.25');
        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.setAttribute('x1', '6.75');
        line.setAttribute('y1', '6.75');
        line.setAttribute('x2', '17.25');
        line.setAttribute('y2', '17.25');
        line.setAttribute('stroke', 'currentColor');
        line.setAttribute('stroke-width', '2.25');
        line.setAttribute('stroke-linecap', 'round');
        svg.appendChild(c);
        svg.appendChild(line);
        face.appendChild(svg);
        label.appendChild(input);
        label.appendChild(face);
        return label;
    }

    /**
     * preset -> { types: 'full'|typeof TYPE_ROWS, multi: 'hyphen'|'space', imgLazy, ariaMode, noIcon?: { id, ariaLabel } }
     */
    const PRESETS = {
        'special-with-no-icon': {
            types: 'full',
            multi: 'hyphen',
            imgLazy: false,
            ariaMode: 'default',
            noIcon: {
                id: 'special-no-icon-toggle',
                ariaLabel: 'No icon — show only cards without a power type icon',
            },
        },
        'aspect-with-no-icon': {
            types: 'full',
            multi: 'hyphen',
            imgLazy: false,
            ariaMode: 'default',
            noIcon: {
                id: 'aspect-no-icon-toggle',
                ariaLabel: 'No icon — show only cards without a power type icon',
            },
        },
        'teamwork-mobile-to-use': { types: 'full', multi: 'hyphen', imgLazy: false, ariaMode: 'default' },
        'teamwork-desktop-acts-as': { types: 'full', multi: 'hyphen', imgLazy: true, ariaMode: 'actsAs' },
        'teamwork-desktop-followup': { types: 'full', multi: 'hyphen', imgLazy: true, ariaMode: 'followup' },
        'teamwork-desktop-to-use-1': {
            types: [TYPE_ROWS[0], TYPE_ROWS[1]],
            multi: 'hyphen',
            imgLazy: true,
            ariaMode: 'default',
            includeMulti: false,
        },
        'teamwork-desktop-to-use-2': {
            types: [TYPE_ROWS[2], TYPE_ROWS[3]],
            multi: 'hyphen',
            imgLazy: true,
            ariaMode: 'default',
            includeMulti: false,
        },
        'teamwork-desktop-to-use-3': {
            types: [TYPE_ROWS[4]],
            multi: 'hyphen',
            imgLazy: true,
            ariaMode: 'default',
            includeMulti: true,
        },
        'ally-desktop-stat': { types: 'full', multi: 'space', imgLazy: true, ariaMode: 'statType' },
        'ally-desktop-attack': { types: 'full', multi: 'space', imgLazy: true, ariaMode: 'attackType' },
        'ally-mobile-stat': { types: 'full', multi: 'space', imgLazy: false, ariaMode: 'default' },
        'ally-mobile-attack': { types: 'full', multi: 'space', imgLazy: false, ariaMode: 'attackFilter' },
        'training-desktop-type1': { types: 'full', multi: 'hyphen', imgLazy: true, ariaMode: 'type1' },
        'training-desktop-type2': { types: 'full', multi: 'hyphen', imgLazy: true, ariaMode: 'type2' },
        'training-mobile': { types: 'full', multi: 'hyphen', imgLazy: false, ariaMode: 'default' },
        'basic-desktop': { types: 'full', multi: 'hyphen', imgLazy: true, ariaMode: 'default' },
        'basic-mobile': { types: 'full', multi: 'hyphen', imgLazy: true, ariaMode: 'default' },
        'power-desktop': { types: 'full', multi: 'space', imgLazy: true, ariaMode: 'default' },
        'power-mobile': { types: 'full', multi: 'space', imgLazy: true, ariaMode: 'default' },
    };

    function multiValueFromPreset(p) {
        return p.multi === 'space' ? 'Multi Power' : 'Multi-Power';
    }

    function rowSpecsFromPreset(p) {
        return p.types === 'full' ? TYPE_ROWS.slice() : p.types;
    }

    /**
     * @param {HTMLElement} container
     * @param {string} presetKey
     */
    function renderPresetIntoContainer(container, presetKey) {
        const p = PRESETS[presetKey];
        if (!p) {
            return;
        }
        const rows = rowSpecsFromPreset(p);
        const multiVal = multiValueFromPreset(p);
        const includeMulti = p.includeMulti !== false;
        const frag = buildButtonFragment(rows, multiVal, p.ariaMode, p.imgLazy, includeMulti);
        container.appendChild(frag);
        if (p.noIcon) {
            container.appendChild(makeNoIconLabel(p.noIcon));
        }
    }

    /**
     * Fill every `[data-dbv-power-strip]` container once (unless force).
     * @param {{ force?: boolean }} [options]
     */
    function initDbvPowerTypeFilterStrips(options) {
        const force = Boolean(options && options.force);
        document.querySelectorAll('[data-dbv-power-strip]').forEach((el) => {
            if (!(el instanceof HTMLElement)) {
                return;
            }
            if (!force && el.dataset.dbvStripInitialized === '1') {
                return;
            }
            const key = el.getAttribute('data-dbv-power-strip');
            if (!key) {
                return;
            }
            el.textContent = '';
            delete el.dataset.dbvStripInitialized;
            renderPresetIntoContainer(el, key);
            el.dataset.dbvStripInitialized = '1';
        });
    }

    window.initDbvPowerTypeFilterStrips = initDbvPowerTypeFilterStrips;

    function runInit() {
        initDbvPowerTypeFilterStrips();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', runInit);
    } else {
        runInit();
    }
})();
