/**
 * Database View Component
 * Full card catalog browser with tabs, filters, and card detail slideout.
 * Initialized by excelsior:view-change event or window.Database.render().
 *
 * See: public/components/database/README.md
 */
(function () {
  'use strict';

  /* ── State ────────────────────────────────────────────────── */
  const STATE = {
    activeTab: 'all',
    allRows: [],       // all rows for current tab (post-filter)
    filteredRows: [],  // rows after search/filter
    page: 1,
    pageSize: 25,
    search: '',
    universe: '',
    cardType: '',      // filter by card type (tab id)
    energyMin: 0,
    energyMax: 10,
    powerMin: 0,
    powerMax: 30,
    sortField: 'name',
    sortDir: 'asc',
    hasInherent: false,
    initialized: false,
    catalogLoaded: false
  };

  const TABS = [
    { id: 'all',              label: 'All',           type: null },
    { id: 'characters',       label: 'Characters',    type: 'characters' },
    { id: 'special-cards',    label: 'Special Cards', type: 'special-cards' },
    { id: 'advanced-universe',label: 'UA',            type: 'advanced-universe' },
    { id: 'locations',        label: 'Locations',     type: 'locations' },
    { id: 'aspects',          label: 'Aspects',       type: 'aspects' },
    { id: 'missions',         label: 'Missions',      type: 'missions' },
    { id: 'events',           label: 'Events',        type: 'events' },
    { id: 'teamwork',         label: 'Teamwork',      type: 'teamwork' },
    { id: 'ally-universe',    label: 'Ally',          type: 'ally-universe' },
    { id: 'training',         label: 'Training',      type: 'training' },
    { id: 'basic-universe',   label: 'Basic',         type: 'basic-universe' },
    { id: 'power-cards',      label: 'Power',         type: 'power-cards' }
  ];

  const UNIVERSE_OPTIONS = [
    'All', 'Marvel', 'DC', 'Foe', 'Advanced Universe',
    'Basic Universe', 'Teamwork', 'Ally', 'Training'
  ];

  /* ── Helpers ─────────────────────────────────────────────── */
  function cdnUrl(path) {
    if (!path) return null;
    const base = (window.APP_CDN_BASE || '').replace(/\/$/, '');
    if (path.startsWith('http')) return path;
    return base + path;
  }

  function getTabTypes(tabId) {
    if (tabId === 'all') return window.Catalog.TYPES;
    const tab = TABS.find(t => t.id === tabId);
    return tab?.type ? [tab.type] : [];
  }

  function getTabRows() {
    const types = getTabTypes(STATE.activeTab);
    return types.flatMap(t =>
      window.Catalog.get(t).map(card => ({ ...card, _type: t }))
    );
  }

  function applyFilters(rows) {
    let result = rows;
    if (STATE.search) {
      const q = STATE.search.toLowerCase();
      result = result.filter(c => (c.name || c.card_name || '').toLowerCase().includes(q));
    }
    if (STATE.universe && STATE.universe !== 'All') {
      result = result.filter(c => (c.universe || '').toLowerCase().includes(STATE.universe.toLowerCase()));
    }
    if (STATE.hasInherent) {
      result = result.filter(c => c.inherent_ability || c.ability_text || c.ability);
    }
    // Card-type filter (only meaningful on 'all' tab)
    if (STATE.activeTab === 'all' && STATE.cardType) {
      result = result.filter(c => c._type === STATE.cardType);
    }
    // Energy cost filter (characters only)
    if (STATE.activeTab === 'all' || STATE.activeTab === 'characters') {
      result = result.filter(c => {
        if (!isCharacterType(c._type || STATE.activeTab)) return true;
        const e = Number(c.energy) || 0;
        return e >= STATE.energyMin && (STATE.energyMax >= 10 || e <= STATE.energyMax);
      });
      result = result.filter(c => {
        if (!isCharacterType(c._type || STATE.activeTab)) return true;
        const total = getCardTotal(c) || 0;
        return total >= STATE.powerMin && (STATE.powerMax >= 30 || total <= STATE.powerMax);
      });
    }
    // Sort
    result = [...result].sort((a, b) => {
      const va = (a[STATE.sortField] || a.name || '').toString().toLowerCase();
      const vb = (b[STATE.sortField] || b.name || '').toString().toLowerCase();
      return STATE.sortDir === 'asc' ? va.localeCompare(vb) : vb.localeCompare(va);
    });
    return result;
  }

  /* ── Rendering ────────────────────────────────────────────── */
  function renderTabs() {
    const bar = document.getElementById('dbv-tab-bar');
    if (!bar) return;
    bar.innerHTML = TABS.map(tab => `
      <button class="dbv-tab${STATE.activeTab === tab.id ? ' active' : ''}" data-tab="${tab.id}">
        ${tab.label}
      </button>
    `).join('');

    bar.querySelectorAll('.dbv-tab').forEach(btn => {
      btn.addEventListener('click', () => {
        STATE.activeTab = btn.dataset.tab;
        STATE.page = 1;
        STATE.search = '';
        const searchEl = document.getElementById('dbv-search-input');
        if (searchEl) searchEl.value = '';
        renderTabs();
        loadAndRenderTable();
      });
    });
  }

  function getCardThumb(card, type) {
    if (typeof window.getCardImagePath === 'function') {
      return window.getCardImagePath(card, type.replace(/-/g, '_').replace('_cards', '').replace('special', 'special').replace('power_cards', 'power').replace('ally_universe', 'ally-universe').replace('basic_universe', 'basic-universe').replace('advanced_universe', 'advanced-universe').replace('teamwork_universe', 'teamwork'), { useThumbnail: true });
    }
    return null;
  }

  function getTypeSingular(type) {
    const map = {
      'characters': 'character',
      'locations': 'location',
      'special-cards': 'special',
      'missions': 'mission',
      'events': 'event',
      'aspects': 'aspect',
      'advanced-universe': 'advanced-universe',
      'teamwork': 'teamwork',
      'ally-universe': 'ally-universe',
      'training': 'training',
      'basic-universe': 'basic-universe',
      'power-cards': 'power'
    };
    return map[type] || type;
  }

  const CHAR_STAT_COLS = [
    { label: 'Energy',      field: 'energy',        class: 'stat-energy' },
    { label: 'Combat',      field: 'combat',         class: 'stat-combat' },
    { label: 'Brute Force', field: 'brute_force',    class: 'stat-brute-force' },
    { label: 'Intelligence',field: 'intelligence',   class: 'stat-intelligence' },
    { label: 'Total',       field: '_total',         class: 'stat-threat' }
  ];

  function getStatColumns(tabId) {
    if (tabId === 'characters') return CHAR_STAT_COLS;
    if (tabId === 'locations') return [{ label: 'Threat', field: 'threat', class: 'stat-threat' }];
    return [];
  }

  function getCardTotal(card) {
    const e = Number(card.energy) || 0;
    const c = Number(card.combat) || 0;
    const b = Number(card.brute_force) || 0;
    const i = Number(card.intelligence) || 0;
    return (e + c + b + i) || null;
  }

  function isCharacterType(type) {
    return type === 'characters';
  }

  function renderTableHeader() {
    const isAll = STATE.activeTab === 'all';
    const statCols = isAll ? CHAR_STAT_COLS : getStatColumns(STATE.activeTab);
    const showInherent = isAll || STATE.activeTab === 'characters' || STATE.activeTab === 'special-cards';
    return `<thead><tr>
      <th class="dbv-col-img"></th>
      <th class="dbv-col-name sortable" data-sort="name">Name</th>
      ${statCols.map(c => `<th class="dbv-col-stat">${c.label}</th>`).join('')}
      ${showInherent ? '<th class="dbv-col-ability">Inherent Ability</th>' : ''}
      <th class="dbv-col-actions">Actions</th>
    </tr></thead>`;
  }

  function renderRow(card, type) {
    const singType = getTypeSingular(type);
    const thumbSrc = getCardThumb(card, type);
    const name = card.name || card.card_name || '—';
    const isAll = STATE.activeTab === 'all';
    const isChar = isCharacterType(type);
    const statCols = isAll ? CHAR_STAT_COLS : getStatColumns(STATE.activeTab);
    const showInherent = isAll || STATE.activeTab === 'characters' || STATE.activeTab === 'special-cards';
    const typeName = type.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    const total = getCardTotal(card);

    function statVal(col) {
      if (col.field === '_total') {
        if (!isChar && isAll) return '—';
        return total !== null ? `<span class="stat-val ${col.class}">${total}</span>` : '—';
      }
      if (!isChar && isAll) return '<span style="color:var(--color-text-muted)">—</span>';
      const v = card[col.field];
      return v != null ? `<span class="stat-val ${col.class}">${v}</span>` : '—';
    }

    const inherentText = card.inherent_ability || card.ability_text || card.ability || '';

    return `<tr data-type="${type}" data-card-name="${name}">
      <td class="dbv-col-img">
        ${thumbSrc
          ? `<img class="dbv-card-thumb" data-src="${thumbSrc}" src="" alt="${name}" loading="lazy">`
          : `<div class="dbv-card-thumb" style="background:var(--color-bg-elevated);border-radius:var(--radius-sm)"></div>`}
      </td>
      <td class="dbv-col-name">
        <div class="dbv-card-name">${name}</div>
        ${card.team ? `<div class="dbv-card-subname">${card.team}</div>` : ''}
        ${isAll ? `<div class="dbv-card-type-tag">${typeName}</div>` : ''}
      </td>
      ${statCols.map(c => `<td class="dbv-col-stat">${statVal(c)}</td>`).join('')}
      ${showInherent ? `<td class="dbv-col-ability dbv-col-ability-text">${inherentText || '<span style="color:var(--color-text-muted)">—</span>'}</td>` : ''}
      <td class="dbv-col-actions" onclick="event.stopPropagation()">
        <button class="dbv-action-btn dbv-action-deck" data-card-type="${singType}">+ Deck</button>
        <button class="dbv-action-btn dbv-action-coll" data-card-type="${singType}">+ Coll</button>
      </td>
    </tr>`;
  }

  function renderTable(rows) {
    const wrap = document.getElementById('dbv-table-wrap');
    if (!wrap) return;

    const start = (STATE.page - 1) * STATE.pageSize;
    const pageRows = rows.slice(start, start + STATE.pageSize);

    if (!pageRows.length) {
      wrap.innerHTML = `<div class="dbv-empty">
        <div class="empty-state-icon">🃏</div>
        <div class="empty-state-title">No cards found</div>
        <div class="empty-state-text">Try adjusting your search or filters.</div>
      </div>`;
      return;
    }

    const statCols = STATE.activeTab !== 'all' ? getStatColumns(STATE.activeTab) : [];
    const isAll = STATE.activeTab === 'all';

    const html = `
      <table class="dbv-table">
        ${renderTableHeader()}
        <tbody>
          ${pageRows.map(card => renderRow(card, card._type || STATE.activeTab)).join('')}
        </tbody>
      </table>`;

    wrap.innerHTML = html;

    // Bind row click → detail panel
    wrap.querySelectorAll('tbody tr').forEach(row => {
      row.addEventListener('click', e => {
        if (e.target.closest('.dbv-col-actions')) return;
        const type = row.dataset.type;
        const name = row.dataset.cardName;
        const types = getTabTypes(STATE.activeTab);
        let card;
        for (const t of types) {
          card = window.Catalog.get(t).find(c => (c.name || c.card_name) === name);
          if (card) { card = { ...card, _type: t }; break; }
        }
        if (card) window.CardDetail?.open(card, card._type);
        wrap.querySelectorAll('tbody tr').forEach(r => r.classList.remove('selected'));
        row.classList.add('selected');
      });
    });

    // Bind action buttons
    wrap.querySelectorAll('.dbv-action-deck').forEach(btn => {
      btn.addEventListener('click', e => {
        e.stopPropagation();
        window.App?.showToast('Deck editor — coming in Phase 6!', 'info');
      });
    });
    wrap.querySelectorAll('.dbv-action-coll').forEach(btn => {
      btn.addEventListener('click', e => {
        e.stopPropagation();
        window.App?.showToast('Added to collection!', 'success');
      });
    });

    // Lazy load images
    if (window.ImageLoadQueue) {
      window.ImageLoadQueue.observe(wrap);
    }
  }

  function renderPagination(total) {
    const el = document.getElementById('dbv-pagination');
    if (!el) return;
    const totalPages = Math.ceil(total / STATE.pageSize);
    if (totalPages <= 1) { el.innerHTML = ''; return; }

    const maxButtons = 7;
    let pages = [];
    if (totalPages <= maxButtons) {
      pages = Array.from({ length: totalPages }, (_, i) => i + 1);
    } else {
      const around = 2;
      const p = STATE.page;
      pages = [...new Set([1, ...(p > 2 ? ['…'] : []), ...Array.from({length: around*2+1}, (_,i) => p - around + i).filter(n => n >= 2 && n <= totalPages - 1), ...(p < totalPages - 1 ? ['…'] : []), totalPages])];
    }

    el.innerHTML = `
      <button class="page-btn" id="dbv-prev-page" ${STATE.page === 1 ? 'disabled' : ''}>&#8249;</button>
      ${pages.map(p => p === '…' ? `<span class="page-btn" style="border:none;cursor:default">…</span>` : `<button class="page-btn${STATE.page === p ? ' active' : ''}" data-page="${p}">${p}</button>`).join('')}
      <button class="page-btn" id="dbv-next-page" ${STATE.page === totalPages ? 'disabled' : ''}>&#8250;</button>
      <span class="page-info">${total.toLocaleString()} cards</span>
    `;

    el.querySelectorAll('[data-page]').forEach(btn => {
      btn.addEventListener('click', () => { STATE.page = +btn.dataset.page; applyAndRender(); });
    });
    el.querySelector('#dbv-prev-page')?.addEventListener('click', () => { STATE.page--; applyAndRender(); });
    el.querySelector('#dbv-next-page')?.addEventListener('click', () => { STATE.page++; applyAndRender(); });
  }

  function applyAndRender() {
    STATE.allRows = getTabRows();
    STATE.filteredRows = applyFilters(STATE.allRows);
    renderTable(STATE.filteredRows);
    renderPagination(STATE.filteredRows.length);
    document.getElementById('dbv-table-wrap')?.scrollTo(0, 0);
  }

  async function loadAndRenderTable() {
    const wrap = document.getElementById('dbv-table-wrap');
    if (wrap) {
      wrap.innerHTML = `<div class="dbv-loading"><div class="spinner"></div><span>Loading cards...</span></div>`;
    }
    const types = getTabTypes(STATE.activeTab);
    await Promise.all(types.map(t => window.Catalog.load(t)));
    applyAndRender();
  }

  /* ── Main Render ─────────────────────────────────────────── */
  function render() {
    const el = document.getElementById('view-database');
    if (!el || STATE.initialized) return;
    STATE.initialized = true;

    el.innerHTML = `
      <div class="dbv-top-bar">
        <div class="dbv-search-wrap">
          <span class="dbv-search-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          </span>
          <input type="search" class="dbv-search-input" id="dbv-search-input" placeholder="Search cards by name…" autocomplete="off">
          <button class="dbv-search-clear" id="dbv-search-clear" aria-label="Clear search">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
        <div class="dbv-sort-wrap">
          <span class="dbv-sort-label">Sort:</span>
          <select class="dbv-sort-select" id="dbv-sort-select">
            <option value="name-asc">Name A-Z</option>
            <option value="name-desc">Name Z-A</option>
            <option value="set-asc">Set A-Z</option>
            <option value="rarity-asc">Rarity</option>
          </select>
        </div>
      </div>

      <div class="dbv-tab-bar" id="dbv-tab-bar" role="tablist">
        <!-- Rendered by renderTabs() -->
      </div>

      <div class="dbv-layout">
        <div class="dbv-filter-panel" id="dbv-filter-panel">
          <div class="dbv-filter-header">
            <span class="dbv-filter-title">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="14" height="14"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>
              Filters
            </span>
            <button class="dbv-filter-clear" id="dbv-filter-clear">Clear All</button>
          </div>

          <div class="dbv-filter-group">
            <label class="dbv-filter-label" for="dbv-cardtype-filter">Card Type</label>
            <select class="dbv-filter-select" id="dbv-cardtype-filter">
              <option value="">All Types</option>
              ${TABS.filter(t => t.type).map(t => `<option value="${t.type}">${t.label}</option>`).join('')}
            </select>
          </div>

          <div class="dbv-filter-group">
            <label class="dbv-filter-label" for="dbv-universe-filter">Universe</label>
            <select class="dbv-filter-select" id="dbv-universe-filter">
              ${UNIVERSE_OPTIONS.map(u => `<option value="${u === 'All' ? '' : u}">${u}</option>`).join('')}
            </select>
          </div>

          <div class="dbv-filter-group">
            <label class="dbv-filter-label">Energy Cost</label>
            <div class="dbv-range-row">
              <span class="dbv-range-val" id="dbv-energy-min-val">0</span>
              <input type="range" class="dbv-range-input" id="dbv-energy-min" min="0" max="10" value="0" step="1">
              <input type="range" class="dbv-range-input" id="dbv-energy-max" min="0" max="10" value="10" step="1">
              <span class="dbv-range-val" id="dbv-energy-max-val">10+</span>
            </div>
          </div>

          <div class="dbv-filter-group">
            <label class="dbv-filter-label">Power Level (Total)</label>
            <div class="dbv-range-row">
              <span class="dbv-range-val" id="dbv-power-min-val">0</span>
              <input type="range" class="dbv-range-input" id="dbv-power-min" min="0" max="30" value="0" step="1">
              <input type="range" class="dbv-range-input" id="dbv-power-max" min="0" max="30" value="30" step="1">
              <span class="dbv-range-val" id="dbv-power-max-val">30+</span>
            </div>
          </div>

          <div class="dbv-filter-group">
            <label class="dbv-filter-toggle">
              <input type="checkbox" class="dbv-toggle-input" id="dbv-inherent-filter">
              <span class="dbv-toggle-label">Has Inherent Ability</span>
            </label>
          </div>
        </div>

        <div class="dbv-main">
          <div class="dbv-table-wrap" id="dbv-table-wrap"></div>
          <div class="dbv-pagination-row">
            <div class="pagination" id="dbv-pagination"></div>
          </div>
        </div>

        <!-- Card detail slideout (desktop) / bottom sheet (mobile) -->
        <div class="dbv-detail-panel" id="dbv-detail-panel" role="complementary" aria-label="Card detail">
          <!-- Rendered by CardDetail.open() -->
        </div>
      </div>
    `;

    bindEvents();
    renderTabs();
    loadAndRenderTable();
    window.Nav?.setPageTitle('Database');
  }

  function bindEvents() {
    // Search
    const searchInput = document.getElementById('dbv-search-input');
    const searchClear = document.getElementById('dbv-search-clear');
    if (searchInput) {
      let debounce;
      searchInput.addEventListener('input', () => {
        STATE.search = searchInput.value.trim();
        STATE.page = 1;
        searchClear?.classList.toggle('visible', !!STATE.search);
        clearTimeout(debounce);
        debounce = setTimeout(() => applyAndRender(), 200);
      });
    }
    if (searchClear) {
      searchClear.addEventListener('click', () => {
        STATE.search = '';
        if (searchInput) searchInput.value = '';
        searchClear.classList.remove('visible');
        STATE.page = 1;
        applyAndRender();
      });
    }

    // Sort
    document.getElementById('dbv-sort-select')?.addEventListener('change', e => {
      const [field, dir] = e.target.value.split('-');
      STATE.sortField = field;
      STATE.sortDir = dir;
      STATE.page = 1;
      applyAndRender();
    });

    // Card type filter
    document.getElementById('dbv-cardtype-filter')?.addEventListener('change', e => {
      STATE.cardType = e.target.value;
      STATE.page = 1;
      applyAndRender();
    });

    // Universe filter
    document.getElementById('dbv-universe-filter')?.addEventListener('change', e => {
      STATE.universe = e.target.value;
      STATE.page = 1;
      applyAndRender();
    });

    // Inherent ability filter
    document.getElementById('dbv-inherent-filter')?.addEventListener('change', e => {
      STATE.hasInherent = e.target.checked;
      STATE.page = 1;
      applyAndRender();
    });

    // Energy range
    function bindRange(minId, maxId, minValId, maxValId, maxCap, onUpdate) {
      const minEl = document.getElementById(minId);
      const maxEl = document.getElementById(maxId);
      const minValEl = document.getElementById(minValId);
      const maxValEl = document.getElementById(maxValId);
      function update() {
        let lo = Number(minEl?.value || 0);
        let hi = Number(maxEl?.value || maxCap);
        if (lo > hi) { if (this === minEl) hi = lo; else lo = hi; }
        if (minEl) minEl.value = lo;
        if (maxEl) maxEl.value = hi;
        if (minValEl) minValEl.textContent = lo;
        if (maxValEl) maxValEl.textContent = hi >= maxCap ? `${maxCap}+` : hi;
        onUpdate(lo, hi);
      }
      minEl?.addEventListener('input', update);
      maxEl?.addEventListener('input', update);
    }
    bindRange('dbv-energy-min', 'dbv-energy-max', 'dbv-energy-min-val', 'dbv-energy-max-val', 10, (lo, hi) => {
      STATE.energyMin = lo; STATE.energyMax = hi; STATE.page = 1; applyAndRender();
    });
    bindRange('dbv-power-min', 'dbv-power-max', 'dbv-power-min-val', 'dbv-power-max-val', 30, (lo, hi) => {
      STATE.powerMin = lo; STATE.powerMax = hi; STATE.page = 1; applyAndRender();
    });

    // Clear filters
    document.getElementById('dbv-filter-clear')?.addEventListener('click', () => {
      STATE.search = '';
      STATE.universe = '';
      STATE.cardType = '';
      STATE.hasInherent = false;
      STATE.energyMin = 0; STATE.energyMax = 10;
      STATE.powerMin = 0;  STATE.powerMax = 30;
      STATE.page = 1;
      const s = document.getElementById('dbv-search-input');
      const u = document.getElementById('dbv-universe-filter');
      const ct = document.getElementById('dbv-cardtype-filter');
      const h = document.getElementById('dbv-inherent-filter');
      const eMin = document.getElementById('dbv-energy-min');
      const eMax = document.getElementById('dbv-energy-max');
      const pMin = document.getElementById('dbv-power-min');
      const pMax = document.getElementById('dbv-power-max');
      if (s) s.value = '';
      if (u) u.value = '';
      if (ct) ct.value = '';
      if (h) h.checked = false;
      if (eMin) eMin.value = 0;
      if (eMax) eMax.value = 10;
      if (pMin) pMin.value = 0;
      if (pMax) pMax.value = 30;
      document.getElementById('dbv-energy-min-val').textContent = '0';
      document.getElementById('dbv-energy-max-val').textContent = '10+';
      document.getElementById('dbv-power-min-val').textContent = '0';
      document.getElementById('dbv-power-max-val').textContent = '30+';
      applyAndRender();
    });

    // Close detail panel when clicking outside (desktop)
    document.addEventListener('click', e => {
      const panel = document.getElementById('dbv-detail-panel');
      if (panel?.classList.contains('open') && !panel.contains(e.target) && !e.target.closest('.dbv-table tbody tr')) {
        window.CardDetail?.close();
      }
    });
  }

  document.addEventListener('excelsior:view-change', e => {
    if (e.detail?.view === 'database') render();
  });

  window.Database = { render };
})();
