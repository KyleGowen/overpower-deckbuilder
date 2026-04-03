// card-data-display.js - Card-type data loading and display functions
// Extracted from public/index.html

function getCardImageUrlForDisplay(card, cardType) {
    if (typeof window.getCardImagePath === 'function') {
        return window.getCardImagePath(
            { ...card, image_path: card.image_path || card.image },
            cardType
        );
    }
    const cdn = (window.APP_CDN_BASE || '').replace(/\/$/, '');
    const folder = { teamwork: 'teamwork-universe', 'ally-universe': 'ally-universe', training: 'training-universe', 'basic-universe': 'basic-universe' }[cardType] || cardType;
    const raw = '/src/resources/cards/images/' + folder + '/' + mapImagePathToActualFile(card.image || card.image_path || '');
    return cdn ? cdn + raw : raw;
}

async function loadMissions() {
    const cached = typeof getCachedCardData === 'function' && getCachedCardData('missions');
    if (cached) {
        window.missionsData = cached;
        if (typeof populateMissionsMissionSetSelect === 'function') populateMissionsMissionSetSelect();
        if (typeof applyMissionFilters === 'function') applyMissionFilters();
        else displayMissions(cached);
        return;
    }
    try {
        const response = await fetch('/api/v1/catalog/missions');
        const data = await response.json();
        const payload =
            typeof catalogListPayload === 'function'
                ? catalogListPayload(response, data)
                : {
                    ok:
                        response.ok !== false &&
                        data &&
                        Array.isArray(data.data) &&
                        data.success !== false &&
                        (!data.errors || data.errors.length === 0),
                    rows: (data && data.data) || []
                };

        if (payload.ok) {
            if (typeof setCachedCardData === 'function') setCachedCardData('missions', payload.rows);
            window.missionsData = payload.rows;
            if (typeof populateMissionsMissionSetSelect === 'function') populateMissionsMissionSetSelect();
            if (typeof applyMissionFilters === 'function') applyMissionFilters();
            else displayMissions(payload.rows);
        }
    } catch (error) {
        console.error('Error loading missions:', error);
    }
}

// displayMissions function moved to external file

// setupMissionSearch function moved to external file

// Event functions
async function loadEvents() {
    const cached = typeof getCachedCardData === 'function' && getCachedCardData('events');
    if (cached) {
        window.eventsData = cached;
        if (typeof populateEventsMissionSetSelect === 'function') populateEventsMissionSetSelect();
        if (typeof applyEventsFilters === 'function') applyEventsFilters();
        else displayEvents(cached);
        return;
    }
    try {
        const response = await fetch('/api/v1/catalog/events');
        const data = await response.json();
        const payload =
            typeof catalogListPayload === 'function'
                ? catalogListPayload(response, data)
                : {
                    ok:
                        response.ok !== false &&
                        data &&
                        Array.isArray(data.data) &&
                        data.success !== false &&
                        (!data.errors || data.errors.length === 0),
                    rows: (data && data.data) || []
                };

        if (payload.ok) {
            if (typeof setCachedCardData === 'function') setCachedCardData('events', payload.rows);
            window.eventsData = payload.rows;
            if (typeof populateEventsMissionSetSelect === 'function') populateEventsMissionSetSelect();
            if (typeof applyEventsFilters === 'function') applyEventsFilters();
            else displayEvents(payload.rows);
        }
    } catch (error) {
        console.error('Error loading events:', error);
    }
}

// displayEvents function moved to external file

// setupEventSearch function moved to external file

// Aspect functions
async function loadAspects() {
    const cached = typeof getCachedCardData === 'function' && getCachedCardData('aspects');
    if (cached) {
        displayAspects(cached);
        return;
    }
    try {
        const response = await fetch('/api/v1/catalog/aspects');
        const data = await response.json();
        const payload =
            typeof catalogListPayload === 'function'
                ? catalogListPayload(response, data)
                : {
                    ok:
                        response.ok !== false &&
                        data &&
                        Array.isArray(data.data) &&
                        data.success !== false &&
                        (!data.errors || data.errors.length === 0),
                    rows: (data && data.data) || []
                };

        if (payload.ok) {
            if (typeof setCachedCardData === 'function') setCachedCardData('aspects', payload.rows);
            displayAspects(payload.rows);
        }
    } catch (error) {
        console.error('Error loading aspects:', error);
    }
}
// displayAspects function moved to external file

// toggleFortificationsColumn function moved to filter-functions.js

// toggleOnePerDeckColumn function moved to external file

// Advanced Universe functions
async function loadAdvancedUniverse() {
    const cached = typeof getCachedCardData === 'function' && getCachedCardData('advanced-universe');
    if (cached) {
        displayAdvancedUniverse(cached);
        return;
    }
    try {
        const response = await fetch('/api/v1/catalog/advanced-universe');
        const data = await response.json();
        const payload =
            typeof catalogListPayload === 'function'
                ? catalogListPayload(response, data)
                : {
                    ok:
                        response.ok !== false &&
                        data &&
                        Array.isArray(data.data) &&
                        data.success !== false &&
                        (!data.errors || data.errors.length === 0),
                    rows: (data && data.data) || []
                };

        if (payload.ok) {
            if (typeof setCachedCardData === 'function') setCachedCardData('advanced-universe', payload.rows);
            displayAdvancedUniverse(payload.rows);
        }
    } catch (error) {
        console.error('Error loading advanced universe:', error);
    }
}

// displayAdvancedUniverse function moved to external file
// displayAdvancedUniverse_OLD function removed (unused)
// toggleOnePerDeckAdvancedColumn function moved to external file

// Teamwork functions
function teamworkUseMobileListArt() {
    if (typeof window.isLayoutMobileForCardDisplay === 'function' && window.isLayoutMobileForCardDisplay()) {
        return true;
    }
    if (typeof window.isNarrowViewportDbvBand === 'function' && window.isNarrowViewportDbvBand()) {
        return true;
    }
    return false;
}

function trainingUseMobileListArt() {
    if (typeof window.isLayoutMobileForCardDisplay === 'function' && window.isLayoutMobileForCardDisplay()) {
        return true;
    }
    if (typeof window.isNarrowViewportDbvBand === 'function' && window.isNarrowViewportDbvBand()) {
        return true;
    }
    return false;
}

function basicUniverseUseMobileListArt() {
    return trainingUseMobileListArt();
}

/** Mobile caption under Basic Universe card art: name, type icon + value + bonus, set line. */
function buildBasicUniverseMobileCaptionHtml(card) {
    const esc =
        typeof window.escapeHtmlText === 'function'
            ? window.escapeHtmlText
            : (s) =>
                  String(s)
                      .replace(/&/g, '&amp;')
                      .replace(/</g, '&lt;')
                      .replace(/>/g, '&gt;')
                      .replace(/"/g, '&quot;');
    const name = esc(String(card.card_name || ''));
    const typeIcon = typeof renderAllyStatTypeIcon === 'function' ? renderAllyStatTypeIcon(card.type) : '';
    const vu = esc(String(card.value_to_use ?? '').trim());
    const bon = esc(String(card.bonus ?? '').trim());
    const setLineRaw =
        typeof window.dbvSetCaptionLineFromCard === 'function' ? window.dbvSetCaptionLineFromCard(card) : '';
    const setLine = setLineRaw ? esc(String(setLineRaw).trim()) : '';
    return `
        <div class="characters-mobile-card-caption characters-mobile-card-caption--basic-universe">
            <div class="characters-mobile-card-caption__basic-universe-name">${name}</div>
            <div class="characters-mobile-card-caption__basic-universe-stat-line">${typeIcon}<span class="characters-mobile-card-caption__basic-universe-value-bonus"><span>${vu}</span> <span>${bon}</span></span></div>
            <div class="characters-mobile-card-caption__basic-universe-set-line">${setLine}</div>
        </div>
    `;
}

/** Mobile caption under Training card art: name, type lines (icon–value/bonus–icon), set line. */
function buildTrainingMobileCaptionHtml(card) {
    const esc =
        typeof window.escapeHtmlText === 'function'
            ? window.escapeHtmlText
            : (s) =>
                  String(s)
                      .replace(/&/g, '&amp;')
                      .replace(/</g, '&lt;')
                      .replace(/>/g, '&gt;')
                      .replace(/"/g, '&quot;');
    const rawName = String(card.card_name || '');
    const displayName = rawName.replace(/^Training \(/, '').replace(/\)$/, '');
    const vu = String(card.value_to_use ?? '').trim();
    const bon = String(card.bonus ?? '').trim();
    let mid = '';
    if (vu && bon) {
        mid = `${esc(vu)} - ${esc(bon)}`;
    } else if (vu) {
        mid = esc(vu);
    } else if (bon) {
        mid = esc(bon);
    }
    const setLineRaw =
        typeof window.dbvSetCaptionLineFromCard === 'function' ? window.dbvSetCaptionLineFromCard(card) : '';
    const setLine = setLineRaw ? esc(String(setLineRaw).trim()) : '';
    const icon = typeof renderAllyStatTypeIcon === 'function' ? renderAllyStatTypeIcon : () => '';
    const icon1 = icon(card.type_1);
    const icon2 = icon(card.type_2);
    return `
        <div class="characters-mobile-card-caption characters-mobile-card-caption--training">
            <div class="characters-mobile-card-caption__training-name">${esc(displayName)}</div>
            <div class="characters-mobile-card-caption__training-type-line">${icon1}<span class="characters-mobile-card-caption__training-value-bonus">${mid}</span>${icon1}</div>
            <div class="characters-mobile-card-caption__training-type-line">${icon2}<span class="characters-mobile-card-caption__training-value-bonus">${mid}</span>${icon2}</div>
            <div class="characters-mobile-card-caption__training-set-line">${setLine}</div>
        </div>
    `;
}

/** Trailing power-type token after a leading "N " prefix (To Use / Acts As). */
function teamworkPowerTypeFromValue(value) {
    return String(value || '').trim().replace(/^\d+\s+/, '').trim();
}

/** Leading integer from To Use string, or null. */
function teamworkNumericFromToUse(toUse) {
    const m = String(toUse || '').trim().match(/^(\d+)/);
    return m ? parseInt(m[1], 10) : null;
}

/** Followup field tokens; matches renderFollowupAttackTypes split/dedupe. */
function parseTeamworkFollowupTokens(value) {
    if (!value || typeof value !== 'string') {
        return [];
    }
    const separator = value.includes(' + ') ? ' + ' : ' / ';
    const parts = value.split(separator).map((p) => p.trim());
    const unique = parts[0] === parts[1] ? [parts[0]] : parts;
    return unique.filter(Boolean);
}

/**
 * Power type used for Acts As column filter (matches renderTeamworkActsAsCell icon).
 */
function teamworkActsAsPowerTypeForFilter(card) {
    const actsAs = String(card?.acts_as || '').trim();
    if (!actsAs) {
        return null;
    }
    const m = actsAs.match(/^(\d+)\s+(.+)$/);
    if (!m) {
        const fallback = actsAs.replace(/^\d+\s+/, '').trim();
        return fallback || null;
    }
    const rest = m[2].trim();
    if (rest.toLowerCase() === 'attack') {
        const t = String(card?.to_use || '')
            .trim()
            .replace(/^\d+\s+/, '')
            .trim();
        return t || 'Combat';
    }
    return rest;
}

function teamworkBonusNumericFromField(raw) {
    const m = String(raw ?? '').trim().match(/(\d+)/);
    return m ? parseInt(m[1], 10) : null;
}

function syncTeamworkDesktopNumericToMobile() {
    const tab = document.getElementById('teamwork-tab');
    if (!tab) {
        return;
    }
    const eq = document.getElementById('teamwork-to-use-equals');
    const mn = document.getElementById('teamwork-to-use-min');
    const mx = document.getElementById('teamwork-to-use-max');
    tab.querySelectorAll('.teamwork-mobile-to-use-equals').forEach((el) => {
        el.value = eq ? eq.value : '';
    });
    tab.querySelectorAll('.teamwork-mobile-to-use-min').forEach((el) => {
        el.value = mn ? mn.value : '';
    });
    tab.querySelectorAll('.teamwork-mobile-to-use-max').forEach((el) => {
        el.value = mx ? mx.value : '';
    });
}

function syncTeamworkMobileNumericToDesktop() {
    const tab = document.getElementById('teamwork-tab');
    if (!tab) {
        return;
    }
    const mEq = tab.querySelector('.teamwork-mobile-to-use-equals');
    const mMin = tab.querySelector('.teamwork-mobile-to-use-min');
    const mMax = tab.querySelector('.teamwork-mobile-to-use-max');
    const eq = document.getElementById('teamwork-to-use-equals');
    const mn = document.getElementById('teamwork-to-use-min');
    const mx = document.getElementById('teamwork-to-use-max');
    if (eq && mEq) {
        eq.value = mEq.value;
    }
    if (mn && mMin) {
        mn.value = mMin.value;
    }
    if (mx && mMax) {
        mx.value = mMax.value;
    }
}

function formatTeamworkBonusNormalized(raw) {
    const t = String(raw ?? '').trim().replace(/^\+/, '');
    return `+${t === '' ? '0' : t}`;
}

/**
 * Mobile caption HTML (To Use / Acts As, bonuses + follow-ups, set + number). Uses card-display.js helpers.
 * Exposed for unit tests.
 */
function buildTeamworkMobileCaptionHtml(card) {
    const esc =
        typeof window.escapeHtmlText === 'function'
            ? window.escapeHtmlText
            : (s) =>
                  String(s)
                      .replace(/&/g, '&amp;')
                      .replace(/</g, '&lt;')
                      .replace(/>/g, '&gt;')
                      .replace(/"/g, '&quot;');

    const toType = teamworkPowerTypeFromValue(card.to_use);
    const line1Left = typeof renderTeamworkValueCell === 'function'
        ? renderTeamworkValueCell(card.to_use, toType)
        : '';
    const line1Right =
        typeof renderTeamworkActsAsCell === 'function'
            ? renderTeamworkActsAsCell(card.acts_as, card.to_use)
            : typeof renderTeamworkValueCell === 'function'
              ? renderTeamworkValueCell(card.acts_as, teamworkPowerTypeFromValue(card.acts_as))
              : '';
    const follow = typeof renderFollowupAttackTypes === 'function'
        ? renderFollowupAttackTypes(card.followup_attack_types)
        : '';
    const b1 = formatTeamworkBonusNormalized(card.first_attack_bonus);
    const b2 = formatTeamworkBonusNormalized(card.second_attack_bonus);
    const line2 = `<span class="characters-mobile-card-caption__teamwork-followup">${follow}</span><span class="characters-mobile-card-caption__teamwork-bonuses"> ${b1}/${b2}</span>`;
    const setLine =
        typeof window.dbvSetCaptionLineFromCard === 'function' ? window.dbvSetCaptionLineFromCard(card) : '';
    const line3 = setLine.trim()
        ? `<div class="characters-mobile-card-caption__teamwork-set-line">${esc(setLine)}</div>`
        : '';
    return `
                <div class="characters-mobile-card-caption characters-mobile-card-caption--teamwork">
                    <div class="characters-mobile-card-caption__teamwork-line1">${line1Left}<span class="characters-mobile-card-caption__teamwork-sep"> - </span>${line1Right}</div>
                    <div class="characters-mobile-card-caption__teamwork-line2">${line2}</div>
                    ${line3}
                </div>`;
}

/**
 * Mobile caption under Ally DBV art: name, stat line (to use + type icon — Acts as attack + icon), card text, set line.
 * Exposed for unit tests.
 */
function buildAllyMobileCaptionHtml(card) {
    const esc =
        typeof window.escapeHtmlText === 'function'
            ? window.escapeHtmlText
            : (s) =>
                  String(s)
                      .replace(/&/g, '&amp;')
                      .replace(/</g, '&lt;')
                      .replace(/>/g, '&gt;')
                      .replace(/"/g, '&quot;');

    const left =
        typeof renderTeamworkValueCell === 'function'
            ? renderTeamworkValueCell(String(card.stat_to_use ?? ''), card.stat_type_to_use)
            : '';
    const right =
        typeof renderTeamworkValueCell === 'function'
            ? renderTeamworkValueCell(String(card.attack_value ?? ''), card.attack_type)
            : '';
    const setLine =
        typeof window.dbvSetCaptionLineFromCard === 'function' ? window.dbvSetCaptionLineFromCard(card) : '';
    const lineSet = setLine.trim()
        ? `<div class="characters-mobile-card-caption__ally-set-line">${esc(setLine)}</div>`
        : '';
    const textRaw = card.card_text || '';
    const textBlock = String(textRaw).trim()
        ? `<div class="characters-mobile-card-caption__ally-text">${esc(textRaw)}</div>`
        : '';
    return `
                <div class="characters-mobile-card-caption characters-mobile-card-caption--ally">
                    <div class="characters-mobile-card-caption__ally-name">${esc(card.card_name || '')}</div>
                    <div class="characters-mobile-card-caption__ally-stat-line">${left}<span class="characters-mobile-card-caption__ally-stat-sep"> - Acts as </span>${right}</div>
                    ${textBlock}
                    ${lineSet}
                </div>`;
}

async function loadTeamwork() {
    const cached = typeof getCachedCardData === 'function' && getCachedCardData('teamwork');
    if (cached) {
        window.teamworkData = cached;
        displayTeamwork(cached);
        return;
    }
    try {
        const fetchList =
            typeof fetchCatalogList === 'function'
                ? fetchCatalogList
                : async (url) => {
                      try {
                          const r = await fetch(url);
                          const j = await r.json();
                          const responseOk = r.ok !== false;
                          const ok =
                              responseOk &&
                              j &&
                              Array.isArray(j.data) &&
                              j.success !== false &&
                              (!j.errors || j.errors.length === 0);
                          return { ok, rows: ok ? j.data : [] };
                      } catch {
                          return { ok: false, rows: [] };
                      }
                  };
        const { ok, rows } = await fetchList('/api/v1/catalog/teamwork');
        if (ok) {
            if (typeof setCachedCardData === 'function') setCachedCardData('teamwork', rows);
            window.teamworkData = rows;
            displayTeamwork(rows);
        }
    } catch (error) {
        console.error('Error loading teamwork:', error);
    }
}

function displayTeamwork(teamwork) {
    const tbody = document.getElementById('teamwork-tbody');
    if (!tbody) {
        return;
    }

    const theadRow = document.querySelector('#teamwork-table thead tr:first-child');
    const colCount = theadRow && theadRow.querySelectorAll('th').length ? theadRow.querySelectorAll('th').length : 7;

    if (!teamwork || teamwork.length === 0) {
        tbody.innerHTML = `<tr><td colspan="${colCount}">No teamwork cards found</td></tr>`;
        return;
    }

    const useMobileListArt = teamworkUseMobileListArt();
    const esc =
        typeof window.escapeHtmlText === 'function'
            ? window.escapeHtmlText
            : (s) =>
                  String(s)
                      .replace(/&/g, '&amp;')
                      .replace(/</g, '&lt;')
                      .replace(/>/g, '&gt;')
                      .replace(/"/g, '&quot;');

    const preferredOrder = ['Energy', 'Combat', 'Brute Force', 'Intelligence', 'Any-Power'];
    const sortedTeamwork = [...teamwork].sort((a, b) => {
        const aType = a.to_use || '';
        const bType = b.to_use || '';

        const aPowerType = String(aType).replace(/^\d+\s+/, '');
        const bPowerType = String(bType).replace(/^\d+\s+/, '');

        const aIndex = preferredOrder.indexOf(aPowerType);
        const bIndex = preferredOrder.indexOf(bPowerType);

        if (aIndex !== -1 && bIndex !== -1) {
            return aIndex - bIndex;
        }
        if (aIndex !== -1) return -1;
        if (bIndex !== -1) return 1;
        return aPowerType.localeCompare(bPowerType);
    });

    tbody.innerHTML = sortedTeamwork.map((card) => {
        const imagePath = getCardImageUrlForDisplay(card, 'teamwork');
        const imagePathEscaped = imagePath.replace(/'/g, "\\'");
        const imagePathAttr = imagePath.replace(/"/g, '&quot;');
        const nameEsc = String(card.card_type || '').replace(/'/g, "\\'");
        const idEsc = String(card.id || '').replace(/'/g, "\\'");

        const toPower = teamworkPowerTypeFromValue(card.to_use);

        const imgStyle = useMobileListArt
            ? 'border-radius: 5px; border: 1px solid rgba(255, 255, 255, 0.2); cursor: pointer;'
            : 'width: 120px !important; height: auto !important; max-height: 180px !important; object-fit: contain; border-radius: 5px; border: 1px solid rgba(255, 255, 255, 0.2); cursor: pointer;';

        const captionHtml = useMobileListArt ? buildTeamworkMobileCaptionHtml(card) : '';

        const imgCellInner = useMobileListArt
            ? `
                <div class="card-image-container">
                    <img src="${imagePathAttr}"
                         alt="${esc(card.card_type || '')}"
                         data-dbv-lightbox-context="teamwork"
                         loading="lazy"
                         decoding="async"
                         style="${imgStyle}"
                         onerror="this.onerror=null; this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIwIiBoZWlnaHQ9IjE4MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjEyMCIgaGVpZ2h0PSIxODAiIGZpbGw9IiMzMzMiLz4KPHRleHQgeD0iNjAiIHk9IjkwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTIiIGZpbGw9IiNmZmYiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5ObyBJbWFnZTwvdGV4dD4KPC9zdmc+'; this.style.cursor='default'; this.onclick=null;"
                         onmouseenter="showCardHoverModal('${imagePathEscaped}', '${nameEsc}', '${idEsc}', 'teamwork')"
                         onmouseleave="hideCardHoverModal()"
                         onclick="openModal(this)">
                </div>
                ${captionHtml}`
            : `
                <img src="${imagePathAttr}"
                     alt="${esc(card.card_type || '')}"
                     loading="lazy"
                     decoding="async"
                     style="${imgStyle}"
                     onerror="this.onerror=null; this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIwIiBoZWlnaHQ9IjE4MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjEyMCIgaGVpZ2h0PSIxODAiIGZpbGw9IiMzMzMiLz4KPHRleHQgeD0iNjAiIHk9IjkwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTIiIGZpbGw9IiNmZmYiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5ObyBJbWFnZTwvdGV4dD4KPC9zdmc+'; this.style.cursor='default'; this.onclick=null;"
                     onmouseenter="showCardHoverModal('${imagePathEscaped}', '${nameEsc}', '${idEsc}', 'teamwork')"
                     onmouseleave="hideCardHoverModal()"
                     onclick="openModal(this)">`;

        return `
        <tr>
            <td${useMobileListArt ? ' data-label="Image"' : ''}>
                ${imgCellInner}
            </td>
            <td>
                <button class="add-to-deck-btn" onclick="showDeckSelection('teamwork', '${card.id}', '${nameEsc}', this)">
                    +Deck
                </button>
                ${(typeof getCurrentUser === 'function' && getCurrentUser()) ? `
                <button class="add-to-collection-btn" onclick="addCardToCollectionFromDatabase('${card.id}', 'teamwork', '${imagePathEscaped}')" style="margin-top: 4px; display: block;">
                    +Collection
                </button>
                <button class="remove-from-collection-btn" data-card-id="${card.id}" data-card-type="teamwork" data-image-path="${imagePathAttr}" onclick="removeOneFromCollection('${card.id}', 'teamwork', '${imagePathEscaped}')" style="margin-top: 4px; display: block;" disabled title="Card not in collection">-Collection</button>
                ` : ''}
            </td>
            <td>${renderTeamworkValueCell(card.to_use, toPower)}</td>
            <td>${typeof renderTeamworkActsAsCell === 'function' ? renderTeamworkActsAsCell(card.acts_as, card.to_use) : renderTeamworkValueCell(card.acts_as, teamworkPowerTypeFromValue(card.acts_as))}</td>
            <td>${renderFollowupAttackTypes(card.followup_attack_types)}</td>
            <td>${card.first_attack_bonus}</td>
            <td>${card.second_attack_bonus}</td>
        </tr>
    `;
    }).join('');
    if (typeof refreshDatabaseViewCollectionButtons === 'function') refreshDatabaseViewCollectionButtons();
}

// Ally Universe
async function loadAllyUniverse() {
    const cached = typeof getCachedCardData === 'function' && getCachedCardData('ally-universe');
    if (cached) {
        window.allyUniverseData = cached;
        if (typeof applyAllyUniverseFilters === 'function') {
            applyAllyUniverseFilters();
        } else {
            displayAllyUniverse(cached);
        }
        return;
    }
    try {
        const fetchList =
            typeof fetchCatalogList === 'function'
                ? fetchCatalogList
                : async (url) => {
                      try {
                          const r = await fetch(url);
                          const j = await r.json();
                          const responseOk = r.ok !== false;
                          const ok =
                              responseOk &&
                              j &&
                              Array.isArray(j.data) &&
                              j.success !== false &&
                              (!j.errors || j.errors.length === 0);
                          return { ok, rows: ok ? j.data : [] };
                      } catch {
                          return { ok: false, rows: [] };
                      }
                  };
        const { ok, rows } = await fetchList('/api/v1/catalog/ally-universe');
        if (ok) {
            if (typeof setCachedCardData === 'function') setCachedCardData('ally-universe', rows);
            window.allyUniverseData = rows;
            if (typeof applyAllyUniverseFilters === 'function') {
                applyAllyUniverseFilters();
            } else {
                displayAllyUniverse(rows);
            }
        }
    } catch (error) {
        console.error('Error loading ally universe:', error);
    }
}

function displayAllyUniverse(allies) {
    const tbody = document.getElementById('ally-universe-tbody');
    if (!tbody) {
        return;
    }

    const theadRow = document.querySelector('#ally-universe-table thead tr:first-child');
    const colCount = theadRow && theadRow.querySelectorAll('th').length ? theadRow.querySelectorAll('th').length : 7;

    if (!allies || allies.length === 0) {
        tbody.innerHTML = `<tr><td colspan="${colCount}">No allies found</td></tr>`;
        return;
    }

    const useMobileListArt = teamworkUseMobileListArt();
    const esc =
        typeof window.escapeHtmlText === 'function'
            ? window.escapeHtmlText
            : (s) =>
                  String(s)
                      .replace(/&/g, '&amp;')
                      .replace(/</g, '&lt;')
                      .replace(/>/g, '&gt;')
                      .replace(/"/g, '&quot;');

    const preferredOrder = ['Energy', 'Combat', 'Brute Force', 'Intelligence', 'Any-Power'];
    const sortedAllies = [...allies].sort((a, b) => {
        const aType = a.stat_type_to_use || '';
        const bType = b.stat_type_to_use || '';

        const aIndex = preferredOrder.indexOf(aType);
        const bIndex = preferredOrder.indexOf(bType);

        if (aIndex !== -1 && bIndex !== -1) {
            return aIndex - bIndex;
        }
        if (aIndex !== -1) return -1;
        if (bIndex !== -1) return 1;
        return aType.localeCompare(bType);
    });

    tbody.innerHTML = sortedAllies.map((card) => {
        const imagePath = getCardImageUrlForDisplay(card, 'ally-universe');
        const imagePathEscaped = imagePath.replace(/'/g, "\\'");
        const imagePathAttr = imagePath.replace(/"/g, '&quot;');
        const nameEsc = String(card.card_name || '').replace(/'/g, "\\'");
        const idEsc = String(card.id || '').replace(/'/g, "\\'");

        const imgStyle = useMobileListArt
            ? 'border-radius: 5px; border: 1px solid rgba(255, 255, 255, 0.2); cursor: pointer;'
            : 'width: 120px !important; height: auto !important; max-height: 180px !important; object-fit: contain; border-radius: 5px; border: 1px solid rgba(255, 255, 255, 0.2); cursor: pointer;';

        const captionHtml = useMobileListArt ? buildAllyMobileCaptionHtml(card) : '';

        const imgCellInner = useMobileListArt
            ? `
                <div class="card-image-container">
                    <img src="${imagePathAttr}"
                         alt="${esc(card.card_name || '')}"
                         data-dbv-lightbox-context="ally-universe"
                         loading="lazy"
                         decoding="async"
                         style="${imgStyle}"
                         onerror="this.onerror=null; this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIwIiBoZWlnaHQ9IjE4MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjEyMCIgaGVpZ2h0PSIxODAiIGZpbGw9IiMzMzMiLz4KPHRleHQgeD0iNjAiIHk9IjkwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTIiIGZpbGw9IiNmZmYiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5ObyBJbWFnZTwvdGV4dD4KPC9zdmc+'; this.style.cursor='default'; this.onclick=null;"
                         onmouseenter="showCardHoverModal('${imagePathEscaped}', '${nameEsc}', '${idEsc}', 'ally-universe')"
                         onmouseleave="hideCardHoverModal()"
                         onclick="openModal(this)">
                </div>
                ${captionHtml}`
            : `
                <img src="${imagePathAttr}"
                     alt="${card.card_name}"
                     loading="lazy"
                     decoding="async"
                     style="${imgStyle}"
                     onerror="this.onerror=null; this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIwIiBoZWlnaHQ9IjE4MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjEyMCIgaGVpZ2h0PSIxODAiIGZpbGw9IiMzMzMiLz4KPHRleHQgeD0iNjAiIHk9IjkwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTIiIGZpbGw9IiNmZmYiIHRleHQtYW5jaG9yPSJtZWRpYW4iIGR5PSIuM2VtIj5ObyBJbWFnZTwvdGV4dD4KPC9zdmc+'; this.style.cursor='default'; this.onclick=null;"
                     onmouseenter="showCardHoverModal('${imagePathEscaped}', '${nameEsc}', '${idEsc}', 'ally-universe')"
                     onmouseleave="hideCardHoverModal()"
                     onclick="openModal(this)">`;

        return `
        <tr>
            <td${useMobileListArt ? ' data-label="Image"' : ''}>
                ${imgCellInner}
            </td>
            <td>
                <button class="add-to-deck-btn" onclick="showDeckSelection('ally-universe', '${card.id}', '${nameEsc}', this)">
                    +Deck
                </button>
                ${(typeof getCurrentUser === 'function' && getCurrentUser()) ? `
                <button class="add-to-collection-btn" onclick="addCardToCollectionFromDatabase('${card.id}', 'ally-universe', '${imagePathEscaped}')" style="margin-top: 4px; display: block;">
                    +Collection
                </button>
                <button class="remove-from-collection-btn" data-card-id="${card.id}" data-card-type="ally-universe" data-image-path="${imagePathAttr}" onclick="removeOneFromCollection('${card.id}', 'ally-universe', '${imagePathEscaped}')" style="margin-top: 4px; display: block;" disabled title="Card not in collection">-Collection</button>
                ` : ''}
            </td>
            <td><strong>${card.card_name}</strong></td>
            <td>${card.stat_to_use}</td>
            <td>${renderAllyStatTypeIcon(card.stat_type_to_use)}</td>
            <td>${renderTeamworkValueCell(String(card.attack_value), card.attack_type)}</td>
            <td>${card.card_text}</td>
        </tr>
    `;
    }).join('');
    if (typeof refreshDatabaseViewCollectionButtons === 'function') refreshDatabaseViewCollectionButtons();
}

// setupAllyUniverseSearch function moved to external file

// Training functions
async function loadTraining() {
    const cached = typeof getCachedCardData === 'function' && getCachedCardData('training');
    if (cached) {
        window.trainingData = cached;
        if (typeof applyTrainingFilters === 'function') {
            applyTrainingFilters();
        } else {
            displayTraining(cached);
        }
        return;
    }
    try {
        const response = await fetch('/api/training');
        const data = await response.json();
        if (data.success) {
            if (typeof setCachedCardData === 'function') setCachedCardData('training', data.data);
            window.trainingData = data.data;
            if (typeof applyTrainingFilters === 'function') {
                applyTrainingFilters();
            } else {
                displayTraining(data.data);
            }
        }
    } catch (e) { console.error('Error loading training:', e); }
}

function displayTraining(cards) {
    const tbody = document.getElementById('training-tbody');
    const theadRow = document.querySelector('#training-table thead tr:first-child');
    const colCount = theadRow && theadRow.querySelectorAll('th').length ? theadRow.querySelectorAll('th').length : 7;

    if (!tbody) {
        return;
    }

    if (!cards || cards.length === 0) {
        tbody.innerHTML = `<tr><td colspan="${colCount}">No training found</td></tr>`;
        return;
    }

    const useMobileListArt = trainingUseMobileListArt();
    const esc =
        typeof window.escapeHtmlText === 'function'
            ? window.escapeHtmlText
            : (s) =>
                  String(s)
                      .replace(/&/g, '&amp;')
                      .replace(/</g, '&lt;')
                      .replace(/>/g, '&gt;')
                      .replace(/"/g, '&quot;');

    tbody.innerHTML = cards.map((card) => {
        const imagePath = getCardImageUrlForDisplay(card, 'training');
        const imagePathEscaped = imagePath.replace(/'/g, "\\'");
        const imagePathAttr = imagePath.replace(/"/g, '&quot;');
        const nameEsc = String(card.card_name || '').replace(/'/g, "\\'");
        const idEsc = String(card.id || '').replace(/'/g, "\\'");

        const imgStyle = useMobileListArt
            ? 'border-radius: 5px; border: 1px solid rgba(255, 255, 255, 0.2); cursor: pointer;'
            : 'width: 120px !important; height: auto !important; max-height: 180px !important; object-fit: contain; border-radius: 5px; border: 1px solid rgba(255, 255, 255, 0.2); cursor: pointer;';

        const captionHtml = useMobileListArt ? buildTrainingMobileCaptionHtml(card) : '';

        const imgCellInner = useMobileListArt
            ? `
                <div class="card-image-container">
                    <img src="${imagePathAttr}"
                         alt="${esc(card.card_name || '')}"
                         data-dbv-lightbox-context="training"
                         loading="lazy"
                         decoding="async"
                         style="${imgStyle}"
                         onerror="this.onerror=null; this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIwIiBoZWlnaHQ9IjE4MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjEyMCIgaGVpZ2h0PSIxODAiIGZpbGw9IiMzMzMiLz4KPHRleHQgeD0iNjAiIHk9IjkwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTIiIGZpbGw9IiNmZmYiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5ObyBJbWFnZTwvdGV4dD4KPC9zdmc+'; this.style.cursor='default'; this.onclick=null;"
                         onmouseenter="showCardHoverModal('${imagePathEscaped}', '${nameEsc}', '${idEsc}', 'training')"
                         onmouseleave="hideCardHoverModal()"
                         onclick="openModal(this)">
                </div>
                ${captionHtml}`
            : `
                <img src="${imagePathAttr}"
                     alt="${card.card_name}"
                     loading="lazy"
                     decoding="async"
                     style="${imgStyle}"
                     onerror="this.onerror=null; this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIwIiBoZWlnaHQ9IjE4MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjEyMCIgaGVpZ2h0PSIxODAiIGZpbGw9IiMzMzMiLz4KPHRleHQgeD0iNjAiIHk9IjkwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTIiIGZpbGw9IiNmZmYiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5ObyBJbWFnZTwvdGV4dD4KPC9zdmc+'; this.style.cursor='default'; this.onclick=null;"
                     onmouseenter="showCardHoverModal('${imagePathEscaped}', '${nameEsc}')"
                     onmouseleave="hideCardHoverModal()"
                     onclick="openModal(this)">`;

        return `
        <tr>
            <td${useMobileListArt ? ' data-label="Image"' : ''}>
                ${imgCellInner}
            </td>
            <td>
                <button class="add-to-deck-btn" onclick="showDeckSelection('training', '${card.id}', '${nameEsc}', this)">
                    +Deck
                </button>
                ${(typeof getCurrentUser === 'function' && getCurrentUser()) ? `
                <button class="add-to-collection-btn" onclick="addCardToCollectionFromDatabase('${card.id}', 'training', '${imagePathEscaped}')" style="margin-top: 4px; display: block;">
                    +Collection
                </button>
                <button class="remove-from-collection-btn" data-card-id="${card.id}" data-card-type="training" data-image-path="${imagePathAttr}" onclick="removeOneFromCollection('${card.id}', 'training', '${imagePathEscaped}')" style="margin-top: 4px; display: block;" disabled title="Card not in collection">-Collection</button>
                ` : ''}
            </td>
            <td><strong>${card.card_name.replace(/^Training \(/, '').replace(/\)$/, '')}</strong></td>
            <td>${renderAllyStatTypeIcon(card.type_1)}</td>
            <td>${renderAllyStatTypeIcon(card.type_2)}</td>
            <td>${card.value_to_use}</td>
            <td>${card.bonus}</td>
            <td>${
                typeof window.dbvSetCaptionLineFromCard === 'function'
                    ? esc(String(window.dbvSetCaptionLineFromCard(card) || '').trim())
                    : esc(String((card.set != null ? card.set : card.universe) || 'ERB').trim())
            }</td>
        </tr>
    `;
    }).join('');
    if (typeof refreshDatabaseViewCollectionButtons === 'function') refreshDatabaseViewCollectionButtons();
}

// setupTrainingSearch function moved to external file

// Basic Universe functions
async function loadBasicUniverse() {
    const cached = typeof getCachedCardData === 'function' && getCachedCardData('basic-universe');
    if (cached) {
        window.basicUniverseData = cached;
        displayBasicUniverse(cached);
        return;
    }
    try {
        const resp = await fetch('/api/basic-universe');
        const data = await resp.json();
        if (data.success) {
            if (typeof setCachedCardData === 'function') setCachedCardData('basic-universe', data.data);
            window.basicUniverseData = data.data;
            displayBasicUniverse(data.data);
        }
    } catch (e) { console.error('Error loading basic universe:', e); }
}

function syncBasicUniverseDesktopNumericToMobile() {
    const tab = document.getElementById('basic-universe-tab');
    if (!tab) return;
    const vEq = tab.querySelector('input[data-column="value"].equals');
    const vMin = document.getElementById('basic-value-min');
    const vMax = document.getElementById('basic-value-max');
    const bEq = tab.querySelector('input[data-column="bonus"].equals');
    const bMin = document.getElementById('basic-bonus-min');
    const bMax = document.getElementById('basic-bonus-max');
    tab.querySelectorAll('.basic-universe-mobile-to-use-equals').forEach((el) => {
        el.value = vEq ? vEq.value : '';
    });
    tab.querySelectorAll('.basic-universe-mobile-to-use-min').forEach((el) => {
        el.value = vMin ? vMin.value : '';
    });
    tab.querySelectorAll('.basic-universe-mobile-to-use-max').forEach((el) => {
        el.value = vMax ? vMax.value : '';
    });
    tab.querySelectorAll('.basic-universe-mobile-bonus-equals').forEach((el) => {
        el.value = bEq ? bEq.value : '';
    });
    tab.querySelectorAll('.basic-universe-mobile-bonus-min').forEach((el) => {
        el.value = bMin ? bMin.value : '';
    });
    tab.querySelectorAll('.basic-universe-mobile-bonus-max').forEach((el) => {
        el.value = bMax ? bMax.value : '';
    });
}

function syncBasicUniverseMobileNumericToDesktop() {
    const tab = document.getElementById('basic-universe-tab');
    if (!tab) return;
    const mEq = tab.querySelector('.basic-universe-mobile-to-use-equals');
    const mMin = tab.querySelector('.basic-universe-mobile-to-use-min');
    const mMax = tab.querySelector('.basic-universe-mobile-to-use-max');
    const vEq = tab.querySelector('input[data-column="value"].equals');
    const vMin = document.getElementById('basic-value-min');
    const vMax = document.getElementById('basic-value-max');
    if (vEq && mEq) vEq.value = mEq.value;
    if (vMin && mMin) vMin.value = mMin.value;
    if (vMax && mMax) vMax.value = mMax.value;
    const mbEq = tab.querySelector('.basic-universe-mobile-bonus-equals');
    const mbMin = tab.querySelector('.basic-universe-mobile-bonus-min');
    const mbMax = tab.querySelector('.basic-universe-mobile-bonus-max');
    const bEq = tab.querySelector('input[data-column="bonus"].equals');
    const bMin = document.getElementById('basic-bonus-min');
    const bMax = document.getElementById('basic-bonus-max');
    if (bEq && mbEq) bEq.value = mbEq.value;
    if (bMin && mbMin) bMin.value = mbMin.value;
    if (bMax && mbMax) bMax.value = mbMax.value;
}

function setupBasicUniverseSearch() {
    const tab = document.getElementById('basic-universe-tab');
    if (tab && tab.dataset.basicUniverseFiltersBound !== '1') {
        tab.dataset.basicUniverseFiltersBound = '1';
        tab.querySelectorAll('.power-type-filter-toggle').forEach((btn) => {
            btn.addEventListener('click', () => {
                const t = btn.getAttribute('data-power-type');
                const willBeActive = !btn.classList.contains('is-active');
                tab.querySelectorAll('.power-type-filter-toggle').forEach((b) => {
                    if (b.getAttribute('data-power-type') === t) {
                        b.classList.toggle('is-active', willBeActive);
                        b.setAttribute('aria-pressed', String(willBeActive));
                    }
                });
                applyBasicUniverseFilters();
            });
        });

        let debounceNum = null;
        const debouncedApply = () => {
            clearTimeout(debounceNum);
            debounceNum = setTimeout(() => applyBasicUniverseFilters(), 150);
        };

        const onMobileNum = () => {
            syncBasicUniverseMobileNumericToDesktop();
            debouncedApply();
        };
        tab
            .querySelectorAll(
                '.basic-universe-mobile-to-use-equals, .basic-universe-mobile-to-use-min, .basic-universe-mobile-to-use-max, .basic-universe-mobile-bonus-equals, .basic-universe-mobile-bonus-min, .basic-universe-mobile-bonus-max'
            )
            .forEach((el) => {
                el.addEventListener('input', onMobileNum);
            });

        const valueEquals = tab.querySelector('input[data-column="value"].equals');
        const bonusEquals = tab.querySelector('input[data-column="bonus"].equals');
        ['basic-value-min', 'basic-value-max', 'basic-bonus-min', 'basic-bonus-max'].forEach((id) => {
            const el = document.getElementById(id);
            if (el) {
                el.addEventListener('input', () => {
                    syncBasicUniverseDesktopNumericToMobile();
                    debouncedApply();
                });
            }
        });
        if (valueEquals) {
            valueEquals.addEventListener('input', () => {
                syncBasicUniverseDesktopNumericToMobile();
                debouncedApply();
            });
        }
        if (bonusEquals) {
            bonusEquals.addEventListener('input', () => {
                syncBasicUniverseDesktopNumericToMobile();
                debouncedApply();
            });
        }

        const cardNameFilter = document.getElementById('basic-universe-card-name-filter');
        if (cardNameFilter) {
            cardNameFilter.addEventListener('input', debouncedApply);
        }

        const clearUse = document.getElementById('basic-universe-to-use-value-clear');
        const clearBon = document.getElementById('basic-universe-bonus-value-clear');
        if (clearUse) {
            clearUse.addEventListener('click', () => {
                tab
                    .querySelectorAll(
                        '.basic-universe-mobile-to-use-equals, .basic-universe-mobile-to-use-min, .basic-universe-mobile-to-use-max'
                    )
                    .forEach((el) => {
                        el.value = '';
                    });
                if (valueEquals) valueEquals.value = '';
                const vm = document.getElementById('basic-value-min');
                const vx = document.getElementById('basic-value-max');
                if (vm) vm.value = '';
                if (vx) vx.value = '';
                applyBasicUniverseFilters();
            });
        }
        if (clearBon) {
            clearBon.addEventListener('click', () => {
                tab
                    .querySelectorAll(
                        '.basic-universe-mobile-bonus-equals, .basic-universe-mobile-bonus-min, .basic-universe-mobile-bonus-max'
                    )
                    .forEach((el) => {
                        el.value = '';
                    });
                if (bonusEquals) bonusEquals.value = '';
                const bm = document.getElementById('basic-bonus-min');
                const bx = document.getElementById('basic-bonus-max');
                if (bm) bm.value = '';
                if (bx) bx.value = '';
                applyBasicUniverseFilters();
            });
        }

        window.addEventListener('layout-mode-change', () => {
            syncBasicUniverseDesktopNumericToMobile();
            const bt = document.getElementById('basic-universe-tab');
            if (
                bt &&
                bt.style.display !== 'none' &&
                window.basicUniverseData &&
                window.basicUniverseData.length > 0
            ) {
                applyBasicUniverseFilters();
            }
        });
    }

    const searchInput = document.getElementById('search-input');
    if (searchInput && searchInput.dataset.basicUniverseSearchBound !== '1') {
        searchInput.dataset.basicUniverseSearchBound = '1';
        searchInput.addEventListener('input', async () => {
            if (!window.basicUniverseData || window.basicUniverseData.length === 0) {
                if (typeof loadBasicUniverse === 'function') {
                    await loadBasicUniverse();
                }
            }
            applyBasicUniverseFilters();
        });
    }

    syncBasicUniverseDesktopNumericToMobile();
}

function displayBasicUniverse(cards) {
    const tbody = document.getElementById('basic-universe-tbody');
    const theadRow = document.querySelector('#basic-universe-table thead tr:first-child');
    const colCount =
        theadRow && theadRow.querySelectorAll('th').length ? theadRow.querySelectorAll('th').length : 6;

    if (!tbody) {
        return;
    }

    if (!cards || cards.length === 0) {
        tbody.innerHTML = `<tr><td colspan="${colCount}">No basic universe cards found</td></tr>`;
        return;
    }

    const preferredOrder = ['Energy', 'Combat', 'Brute Force', 'Intelligence', 'Any-Power'];
    const sortedCards = cards.slice().sort((a, b) => {
        const aTypeIndex = preferredOrder.indexOf(a.type);
        const bTypeIndex = preferredOrder.indexOf(b.type);

        if (aTypeIndex !== bTypeIndex) {
            if (aTypeIndex === -1) return 1;
            if (bTypeIndex === -1) return -1;
            return aTypeIndex - bTypeIndex;
        }

        const aValue = parseInt(String(a.value_to_use), 10) || 0;
        const bValue = parseInt(String(b.value_to_use), 10) || 0;
        if (aValue !== bValue) {
            return aValue - bValue;
        }

        const aBonus = parseInt(String(a.bonus || '').replace('+', ''), 10) || 0;
        const bBonus = parseInt(String(b.bonus || '').replace('+', ''), 10) || 0;
        return aBonus - bBonus;
    });

    const useMobileListArt = basicUniverseUseMobileListArt();
    const esc =
        typeof window.escapeHtmlText === 'function'
            ? window.escapeHtmlText
            : (s) =>
                  String(s)
                      .replace(/&/g, '&amp;')
                      .replace(/</g, '&lt;')
                      .replace(/>/g, '&gt;')
                      .replace(/"/g, '&quot;');

    tbody.innerHTML = sortedCards.map((card) => {
        const imagePath = getCardImageUrlForDisplay(card, 'basic-universe');
        const imagePathEscaped = imagePath.replace(/'/g, "\\'");
        const imagePathAttr = imagePath.replace(/"/g, '&quot;');
        const nameEsc = String(card.card_name || '').replace(/'/g, "\\'");
        const idEsc = String(card.id || '').replace(/'/g, "\\'");

        const imgStyle = useMobileListArt
            ? 'border-radius: 5px; border: 1px solid rgba(255, 255, 255, 0.2); cursor: pointer;'
            : 'width: 120px !important; height: auto !important; max-height: 180px !important; object-fit: contain; border-radius: 5px; border: 1px solid rgba(255, 255, 255, 0.2); cursor: pointer;';

        const captionHtml = useMobileListArt ? buildBasicUniverseMobileCaptionHtml(card) : '';

        const imgCellInner = useMobileListArt
            ? `
                <div class="card-image-container">
                    <img src="${imagePathAttr}"
                         alt="${esc(card.card_name || '')}"
                         data-dbv-lightbox-context="basic-universe"
                         loading="lazy"
                         decoding="async"
                         style="${imgStyle}"
                         onerror="this.onerror=null; this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIwIiBoZWlnaHQ9IjE4MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjEyMCIgaGVpZ2h0PSIxODAiIGZpbGw9IiMzMzMiLz4KPHRleHQgeD0iNjAiIHk9IjkwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTIiIGZpbGw9IiNmZmYiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5ObyBJbWFnZTwvdGV4dD4KPC9zdmc+'; this.style.cursor='default'; this.onclick=null;"
                         onmouseenter="showCardHoverModal('${imagePathEscaped}', '${nameEsc}', '${idEsc}', 'basic-universe')"
                         onmouseleave="hideCardHoverModal()"
                         onclick="openModal(this)">
                </div>
                ${captionHtml}`
            : `
                <img src="${imagePathAttr}"
                     alt="${card.card_name}"
                     loading="lazy"
                     decoding="async"
                     style="${imgStyle}"
                     onerror="this.onerror=null; this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIwIiBoZWlnaHQ9IjE4MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjEyMCIgaGVpZ2h0PSIxODAiIGZpbGw9IiMzMzMiLz4KPHRleHQgeD0iNjAiIHk9IjkwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTIiIGZpbGw9IiNmZmYiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5ObyBJbWFnZTwvdGV4dD4KPC9zdmc+'; this.style.cursor='default'; this.onclick=null;"
                     onmouseenter="showCardHoverModal('${imagePathEscaped}', '${nameEsc}', '${idEsc}', 'basic-universe')"
                     onmouseleave="hideCardHoverModal()"
                     onclick="openModal(this)">`;

        return `
        <tr>
            <td${useMobileListArt ? ' data-label="Image"' : ''}>
                ${imgCellInner}
            </td>
            <td>
                <button class="add-to-deck-btn" onclick="showDeckSelection('basic-universe', '${card.id}', '${nameEsc}', this)">
                    +Deck
                </button>
                ${typeof getCurrentUser === 'function' && getCurrentUser() ? `
                <button class="add-to-collection-btn" onclick="addCardToCollectionFromDatabase('${card.id}', 'basic-universe', '${imagePathEscaped}')" style="margin-top: 4px; display: block;">
                    +Collection
                </button>
                <button class="remove-from-collection-btn" data-card-id="${card.id}" data-card-type="basic-universe" data-image-path="${imagePathAttr}" onclick="removeOneFromCollection('${card.id}', 'basic-universe', '${imagePathEscaped}')" style="margin-top: 4px; display: block;" disabled title="Card not in collection">-Collection</button>
                ` : ''}
            </td>
            <td><strong>${card.card_name}</strong></td>
            <td>${renderAllyStatTypeIcon(card.type)}</td>
            <td>${card.value_to_use}</td>
            <td>${card.bonus}</td>
        </tr>
    `;
    }).join('');
    if (typeof refreshDatabaseViewCollectionButtons === 'function') refreshDatabaseViewCollectionButtons();
}

// setupBasicUniverseSearch function moved to external file

// clearBasicUniverseFilters function moved to filter-functions.js

// applyBasicUniverseFilters moved to card-filter-toggles.js


// Power Cards functions
async function loadPowerCards() {
    const cached = typeof getCachedCardData === 'function' && getCachedCardData('power-cards');
    if (cached) {
        displayPowerCards(cached);
        return;
    }
    try {
        const resp = await fetch('/api/power-cards');
        const data = await resp.json();
        if (data.success) {
            if (typeof setCachedCardData === 'function') setCachedCardData('power-cards', data.data);
            displayPowerCards(data.data);
        }
    } catch (e) { console.error('Error loading power cards:', e); }
}

// Export all functions to window for backward compatibility
window.loadMissions = loadMissions;
window.loadEvents = loadEvents;
window.loadAspects = loadAspects;
window.loadAdvancedUniverse = loadAdvancedUniverse;
window.loadTeamwork = loadTeamwork;
window.displayTeamwork = displayTeamwork;
window.teamworkUseMobileListArt = teamworkUseMobileListArt;
window.teamworkPowerTypeFromValue = teamworkPowerTypeFromValue;
window.teamworkNumericFromToUse = teamworkNumericFromToUse;
window.parseTeamworkFollowupTokens = parseTeamworkFollowupTokens;
window.teamworkActsAsPowerTypeForFilter = teamworkActsAsPowerTypeForFilter;
window.teamworkBonusNumericFromField = teamworkBonusNumericFromField;
window.syncTeamworkDesktopNumericToMobile = syncTeamworkDesktopNumericToMobile;
window.syncTeamworkMobileNumericToDesktop = syncTeamworkMobileNumericToDesktop;
window.formatTeamworkBonusNormalized = formatTeamworkBonusNormalized;
window.buildTeamworkMobileCaptionHtml = buildTeamworkMobileCaptionHtml;
window.buildAllyMobileCaptionHtml = buildAllyMobileCaptionHtml;
window.trainingUseMobileListArt = trainingUseMobileListArt;
window.buildTrainingMobileCaptionHtml = buildTrainingMobileCaptionHtml;
window.basicUniverseUseMobileListArt = basicUniverseUseMobileListArt;
window.buildBasicUniverseMobileCaptionHtml = buildBasicUniverseMobileCaptionHtml;
window.loadAllyUniverse = loadAllyUniverse;
window.displayAllyUniverse = displayAllyUniverse;
window.loadTraining = loadTraining;
window.displayTraining = displayTraining;
window.loadBasicUniverse = loadBasicUniverse;
window.setupBasicUniverseSearch = setupBasicUniverseSearch;
window.displayBasicUniverse = displayBasicUniverse;
window.loadPowerCards = loadPowerCards;
