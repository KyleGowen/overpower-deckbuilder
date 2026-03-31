/**
 * Deck Editor View (DEV) — mobile layout-only list (layout-mobile).
 * Renders categorized collapsible sections and Collection-style rows with − / + and a hamburger-style actions dropdown.
 */
(function (global) {
    var TYPE_ORDER = [
        'character', 'location', 'mission', 'event', 'special',
        'aspect', 'advanced-universe', 'teamwork', 'ally-universe',
        'training', 'basic-universe', 'power'
    ];

    var TYPE_LABELS = {
        character: 'Characters',
        location: 'Locations',
        mission: 'Missions',
        event: 'Events',
        special: 'Special Cards',
        aspect: 'Aspects',
        'advanced-universe': 'Universe: Advanced',
        teamwork: 'Universe: Teamwork',
        'ally-universe': 'Universe: Ally',
        training: 'Universe: Training',
        'basic-universe': 'Universe: Basic',
        power: 'Power Cards'
    };

    /**
     * Expansion state lives in a global `let deckEditorExpansionState` from index.html — it is NOT on `window`.
     * Never use window.deckEditorExpansionState; use this helper.
     */
    function getDeckExpansionState() {
        /* global deckEditorExpansionState */
        if (typeof deckEditorExpansionState !== 'undefined' && deckEditorExpansionState !== null) {
            return deckEditorExpansionState;
        }
        if (!global.deckEditorExpansionState) {
            global.deckEditorExpansionState = {};
        }
        return global.deckEditorExpansionState;
    }

    function normalizeDeckType(type) {
        if (type === 'ally_universe') return 'ally-universe';
        if (type === 'basic_universe') return 'basic-universe';
        if (type === 'advanced_universe') return 'advanced-universe';
        return type;
    }

    function escapeAttr(s) {
        if (s == null || s === '') return '';
        return String(s)
            .replace(/&/g, '&amp;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;')
            .replace(/</g, '&lt;');
    }

    function escapeHtml(text) {
        if (text == null || text === '') return '';
        var d = document.createElement('div');
        d.textContent = text;
        return d.innerHTML;
    }

    /* Match deck hamburger menu icons (stroke SVGs), scaled in CSS via .dev-mobile-deck-row-menu-panel */
    var ICON_MENU_CHANGE_ART =
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="14" rx="2"/><circle cx="9" cy="10" r="1.5"/><path d="M3 17l4-4 3 3 5-6 5 7"/></svg>';
    var ICON_MENU_FOIL =
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2l2.4 7.4h7.6l-6 4.6 2.3 7-6.3-4.6-6.3 4.6 2.3-7-6-4.6h7.6z"/></svg>';
    var ICON_MENU_KO =
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></svg>';
    var ICON_MENU_HAND =
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="5" width="9" height="12" rx="1.5"/><rect x="9" y="7" width="9" height="12" rx="1.5"/></svg>';
    function devMobileRowMenuItemButton(label, onclickAttr, iconSvg, iconExtraClass) {
        var iconClass = 'deck-editor-menu-item-icon' + (iconExtraClass || '');
        return (
            '<button type="button" class="deck-editor-menu-panel-btn touch-target-min" onclick="' + onclickAttr + '">' +
            '<span class="deck-editor-menu-item-label">' + escapeHtml(label) + '</span>' +
            '<span class="' + iconClass + '" aria-hidden="true">' + iconSvg + '</span></button>'
        );
    }

    function devMobileDisplayName(card, availableCard) {
        if (!availableCard) return 'Card';
        var nt = normalizeDeckType(card.type);
        if (nt === 'power') {
            return (availableCard.value || '') + ' - ' + (availableCard.power_type || '');
        }
        if (nt === 'teamwork') {
            return (availableCard.to_use || '') + ' → ' + (availableCard.followup_attack_types || '') +
                ' (' + (availableCard.first_attack_bonus || '') + '/' + (availableCard.second_attack_bonus || '') + ')';
        }
        if (nt === 'ally-universe') {
            return (availableCard.card_name || '') + ' - ' + (availableCard.stat_to_use || '') + ' ' +
                (availableCard.stat_type_to_use || '') + ' → ' + (availableCard.attack_value || '') + ' ' + (availableCard.attack_type || '');
        }
        if (nt === 'basic-universe') {
            return (availableCard.card_name || '') + ' - ' + (availableCard.type || '') +
                ' (' + (availableCard.value_to_use || '') + ' → ' + (availableCard.bonus || '') + ')';
        }
        if (nt === 'training') {
            var cn = (availableCard.card_name || '').replace(/^Training \(/, '').replace(/\)$/, '');
            return cn + ' - ' + (availableCard.type_1 || '') + ' + ' + (availableCard.type_2 || '') +
                ' (' + (availableCard.value_to_use || '') + ' → ' + (availableCard.bonus || '') + ')';
        }
        return availableCard.name || availableCard.card_name || 'Card';
    }

    function isDeckEditorReadOnlyUi() {
        if (global.isPreviewReadOnlyMode) return true;
        if (global.currentDeckData && global.currentDeckData.metadata && global.currentDeckData.metadata.isOwner === false) {
            return true;
        }
        return false;
    }

    function resolveInstanceCardId(card, instanceIndex) {
        if (card.selectedAlternateCardIds && card.selectedAlternateCardIds[instanceIndex]) {
            return card.selectedAlternateCardIds[instanceIndex];
        }
        if (card.selectedAlternateCardId) return card.selectedAlternateCardId;
        return card.cardId;
    }

    function lookupAvailableCard(cardId, rawType) {
        var map = global.availableCardsMap;
        if (!map || !map.get) return null;
        var c = map.get(cardId);
        if (c) return c;
        if (rawType) {
            c = map.get(rawType + '_' + cardId);
            if (c) return c;
            if (rawType.indexOf('_') !== -1) {
                c = map.get(rawType.replace(/_/g, '-') + '_' + cardId);
                if (c) return c;
            }
        }
        return null;
    }

    /**
     * HTML chunks for the mobile row actions sheet; same conditions as whether we show the ⋯ control.
     */
    function collectDevMobileDeckRowSheetParts(card, deckIndex, instanceIndex) {
        var parts = [];
        if (!card) return parts;

        var cid = String(card.cardId).replace(/'/g, "\\'");
        var safeIndex = deckIndex;
        var safeInst = instanceIndex;

        var instId = resolveInstanceCardId(card, instanceIndex);
        var acForAlt = lookupAvailableCard(instId, card.type) || lookupAvailableCard(card.cardId, card.type);

        if ((card.type === 'character' || card.type === 'special' || card.type === 'power' || card.type === 'location') &&
            typeof global.deckEditorCardHasAlternateArts === 'function' &&
            acForAlt &&
            global.deckEditorCardHasAlternateArts(acForAlt, card.type)) {
            parts.push(devMobileRowMenuItemButton(
                'Change art',
                'showAlternateArtSelectionForExistingCard(\'' + cid + '\',' + safeIndex + ',' + safeInst + ')',
                ICON_MENU_CHANGE_ART
            ));
        }

        if (global.foilCardMap && global.foilCardMap[instId] !== undefined) {
            var foilActive = !!(lookupAvailableCard(instId, card.type) || {}).is_foil;
            parts.push(devMobileRowMenuItemButton(
                'Foil',
                'toggleFoilForCard(\'' + cid + '\',' + safeIndex + ',' + safeInst + ')',
                ICON_MENU_FOIL,
                foilActive ? ' deck-editor-menu-item-icon--foil-active' : ''
            ));
        }

        if (card.type === 'character' && global.currentUser) {
            var kod = global.SimulateKO && global.SimulateKO.isKOd(card.cardId);
            parts.push(devMobileRowMenuItemButton(
                kod ? 'Un-KO character' : 'KO character',
                'toggleKOCharacter(\'' + cid + '\',' + safeIndex + ')',
                ICON_MENU_KO
            ));
        }

        if (card.type === 'character' && typeof getReserveCharacterButton === 'function') {
            var rbtn = getReserveCharacterButton(card.cardId, deckIndex);
            if (rbtn) {
                parts.push('<div class="dev-mobile-deck-row-menu-custom">' + rbtn + '</div>');
            }
        }

        if (card.type === 'training' && typeof hasSpartanTrainingGround === 'function' && hasSpartanTrainingGround()) {
            var excl = card.exclude_from_draw === true;
            parts.push(devMobileRowMenuItemButton(
                excl ? 'Include in draw' : 'Pre-placed',
                'drawTrainingCard(\'' + cid + '\',' + safeIndex + ')',
                ICON_MENU_HAND
            ));
        } else if (card.type === 'basic-universe' && typeof hasDraculasArmory === 'function' && hasDraculasArmory()) {
            var exclB = card.exclude_from_draw === true;
            parts.push(devMobileRowMenuItemButton(
                exclB ? 'Include in draw' : 'Pre-placed',
                'drawBasicUniverseCard(\'' + cid + '\',' + safeIndex + ')',
                ICON_MENU_HAND
            ));
        } else if (card.type === 'special' && typeof hasLancelot === 'function' && hasLancelot()) {
            var cdata = lookupAvailableCard(card.cardId, card.type);
            var cname = cdata ? (cdata.name || cdata.card_name || '') : '';
            var cidStr = String(card.cardId);
            if (cname === 'Sword and Shield' || cidStr.indexOf('sword_and_shield') !== -1 || cidStr.indexOf('sword-and-shield') !== -1) {
                var exclS = card.exclude_from_draw === true;
                parts.push(devMobileRowMenuItemButton(
                    exclS ? 'Include in draw' : 'Pre-placed',
                    'drawSwordAndShield(\'' + cid + '\',' + safeIndex + ')',
                    ICON_MENU_HAND
                ));
            }
        }

        if (card.type === 'mission' && typeof getDisplayMissionButton === 'function') {
            var mhtml = getDisplayMissionButton(card.cardId, deckIndex);
            if (mhtml) {
                parts.push('<div class="dev-mobile-deck-row-menu-custom">' + mhtml + '</div>');
            }
        }

        return parts;
    }

    function positionDevMobileRowMenuPanel(anchorEl) {
        var panel = document.getElementById('devMobileDeckActionsPanel');
        if (!panel || !anchorEl || typeof anchorEl.getBoundingClientRect !== 'function') return;
        panel.style.visibility = 'hidden';
        panel.style.left = '0px';
        panel.style.top = '0px';
        panel.hidden = false;
        var pw = panel.offsetWidth;
        var ph = panel.offsetHeight;
        var r = anchorEl.getBoundingClientRect();
        var vw = window.innerWidth;
        var vh = window.innerHeight;
        var gap = 8;
        var margin = 12;
        var left = r.right - pw;
        if (left < margin) {
            left = margin;
        }
        if (left + pw > vw - margin) {
            left = Math.max(margin, vw - pw - margin);
        }
        var top = r.bottom + gap;
        if (top + ph > vh - margin) {
            top = r.top - gap - ph;
        }
        if (top < margin) {
            top = margin;
        }
        if (top + ph > vh - margin) {
            top = Math.max(margin, vh - ph - margin);
        }
        panel.style.left = left + 'px';
        panel.style.top = top + 'px';
        panel.style.visibility = 'visible';
    }

    function devMobileRowMenuOutsideDown(e) {
        var sheet = document.getElementById('devMobileDeckActionsSheet');
        if (!sheet || !sheet.classList.contains('is-open')) return;
        var panel = document.getElementById('devMobileDeckActionsPanel');
        var anchor = global._devMobileDeckRowMenuAnchor;
        var t = e.target;
        if (panel && panel.contains(t)) return;
        if (anchor && (t === anchor || (typeof anchor.contains === 'function' && anchor.contains(t)))) return;
        global.closeDevMobileDeckActionsSheet();
    }

    function renderDeckEditorMobileView() {
        var deckCardsEditor = document.getElementById('deckCardsEditor');
        var chrome = document.getElementById('devMobileDeckChrome');
        if (!deckCardsEditor) return;
        if (typeof global.isLayoutMobile !== 'function' || !global.isLayoutMobile()) return;

        if (typeof global.closeDevMobileDeckActionsSheet === 'function') {
            global.closeDevMobileDeckActionsSheet();
        }

        /* DTV uses setProperty(..., 'important') on #deckCardsEditor — clear so MV CSS can apply */
        deckCardsEditor.removeAttribute('style');

        if (chrome) chrome.style.display = '';

        var cards = global.deckEditorCards || [];
        if (cards.length === 0) {
            deckCardsEditor.innerHTML =
                '<div class="empty-deck-message dev-mobile-empty-deck">' +
                '<p>No cards in this deck yet.</p>' +
                '<p>Use search above to add cards.</p></div>';
            if (typeof global.updateDeckEditorCardCount === 'function') global.updateDeckEditorCardCount();
            if (typeof global.updateDeckSummary === 'function') global.updateDeckSummary(cards);
            return;
        }

        var cardsByType = {};
        cards.forEach(function (card, index) {
            var t = normalizeDeckType(card.type);
            if (!cardsByType[t]) cardsByType[t] = [];
            var copy = {};
            for (var k in card) {
                if (Object.prototype.hasOwnProperty.call(card, k)) copy[k] = card[k];
            }
            copy.originalIndex = index;
            cardsByType[t].push(copy);
        });

        var html = '<div class="dev-mobile-deck-list-root">';
        var readOnly = isDeckEditorReadOnlyUi();

        TYPE_ORDER.forEach(function (type) {
            var typeCards = cardsByType[type];
            if (!typeCards || typeCards.length === 0) return;

            var typeName = TYPE_LABELS[type] || (typeof formatCardType === 'function' ? formatCardType(type) : type);
            var cardCount = typeCards.reduce(function (total, c) {
                return total + (c.quantity || 1);
            }, 0);
            var cur = getDeckExpansionState()[type];
            var expanded = cur !== false;

            html += '<section class="dev-mobile-deck-type-section" data-dev-mobile-type="' + escapeAttr(type) + '">';
            html += '<button type="button" class="dev-mobile-deck-type-header touch-target-min" aria-expanded="' + expanded + '" onclick="toggleDevMobileDeckType(\'' + type.replace(/'/g, "\\'") + '\')">';
            html += '<span class="dev-mobile-deck-type-name">' + escapeHtml(typeName) + '</span>';
            html += '<span class="dev-mobile-deck-type-count">' + cardCount + '</span>';
            html += '<span class="dev-mobile-deck-type-toggle" aria-hidden="true">' + (expanded ? '▼' : '▶') + '</span>';
            html += '</button>';
            html += '<div class="dev-mobile-deck-type-body" style="display:' + (expanded ? 'block' : 'none') + '">';

            typeCards.forEach(function (card) {
                var index = card.originalIndex;
                var qty = card.quantity || 1;
                var cardIdForImage = card.selectedAlternateCardId || card.cardId;
                var availableCard = lookupAvailableCard(cardIdForImage, card.type);
                if (!availableCard) {
                    availableCard = lookupAvailableCard(card.cardId, card.type);
                }
                if (!availableCard) return;

                for (var i = 0; i < qty; i++) {
                    var instanceId = resolveInstanceCardId(card, i);
                    var instanceAvailable = lookupAvailableCard(instanceId, card.type) || availableCard;
                    var fullRes = typeof getCardImagePath === 'function'
                        ? getCardImagePath(instanceAvailable, card.type)
                        : '';
                    var imgSrc = typeof getDeckEditorCardViewInitialImagePath === 'function'
                        ? getDeckEditorCardViewInitialImagePath(fullRes, card.type)
                        : fullRes;
                    var name = devMobileDisplayName(card, instanceAvailable);
                    var canStack = card.type !== 'character' && card.type !== 'location' && card.type !== 'mission';
                    var rowSheetParts = collectDevMobileDeckRowSheetParts(card, index, i);

                    var actions = '';
                    if (!readOnly) {
                        if (canStack) {
                            actions += '<button type="button" class="dev-mobile-deck-qty-btn touch-target-min" aria-label="Remove one copy" onclick="removeOneCardFromEditor(' + index + ')">−</button>';
                            actions += '<button type="button" class="dev-mobile-deck-qty-btn touch-target-min" aria-label="Add one copy" onclick="addOneCardToEditor(' + index + ')">+</button>';
                        } else {
                            actions += '<button type="button" class="dev-mobile-deck-qty-btn touch-target-min" aria-label="Remove card" onclick="removeCardFromEditor(' + index + ')">−</button>';
                        }
                        if (rowSheetParts.length > 0) {
                            actions += '<button type="button" class="dev-mobile-deck-overflow-btn touch-target-min" aria-label="More actions" onclick="openDevMobileDeckRowSheet(' + index + ',' + i + ',this)">⋯</button>';
                        }
                    }

                    var rowFoilClass = instanceAvailable.is_foil ? ' collection-card-foil' : '';
                    var nameHtml = escapeHtml(name) +
                        (instanceAvailable.is_foil
                            ? '<span class="collection-foil-badge">' + escapeHtml('✦ FOIL') + '</span>'
                            : '');
                    html += '<div class="dev-mobile-deck-row' + rowFoilClass + '" data-deck-index="' + index + '" data-instance="' + i + '">';
                    html += '<div class="dev-mobile-deck-row-thumb"><img src="' + escapeAttr(imgSrc) + '" alt=""></div>';
                    html += '<div class="dev-mobile-deck-row-name">' + nameHtml + '</div>';
                    html += '<div class="dev-mobile-deck-row-actions">' + actions + '</div>';
                    html += '</div>';
                }
            });

            html += '</div></section>';
        });

        html += '</div>';
        deckCardsEditor.innerHTML = html;

        if (typeof global.updateDeckEditorCardCount === 'function') global.updateDeckEditorCardCount();
        if (typeof global.updateDeckSummary === 'function') global.updateDeckSummary(global.deckEditorCards);
        if (global.currentUser && typeof global.applyKODimming === 'function') global.applyKODimming();
    }

    global.toggleDevMobileDeckType = function (type) {
        var st = getDeckExpansionState();
        var cur = st[type];
        st[type] = cur === false;
        if (typeof saveDeckExpansionState === 'function') saveDeckExpansionState();
        renderDeckEditorMobileView();
    };

    global.closeDevMobileDeckActionsSheet = function () {
        var sheet = document.getElementById('devMobileDeckActionsSheet');
        var panel = document.getElementById('devMobileDeckActionsPanel');
        if (panel) {
            panel.hidden = true;
            panel.style.top = '';
            panel.style.left = '';
            panel.style.visibility = '';
        }
        if (sheet) {
            sheet.classList.remove('is-open');
            sheet.setAttribute('aria-hidden', 'true');
            sheet.hidden = true;
        }
        global._devMobileDeckRowMenuAnchor = null;
        if (global._devMobileRowMenuDocDown) {
            document.removeEventListener('mousedown', global._devMobileRowMenuDocDown);
            global._devMobileRowMenuDocDown = null;
        }
    };

    global.openDevMobileDeckRowSheet = function (deckIndex, instanceIndex, anchorEl) {
        if (isDeckEditorReadOnlyUi()) return;

        var sheet = document.getElementById('devMobileDeckActionsSheet');
        var body = document.getElementById('devMobileDeckActionsBody');
        var panel = document.getElementById('devMobileDeckActionsPanel');
        if (!sheet || !body || !panel) return;

        var card = global.deckEditorCards[deckIndex];
        if (!card) return;

        var trigger = anchorEl;
        if (!trigger || typeof trigger.getBoundingClientRect !== 'function') {
            trigger = document.querySelector(
                '.dev-mobile-deck-row[data-deck-index="' + deckIndex + '"][data-instance="' + instanceIndex + '"] .dev-mobile-deck-overflow-btn'
            );
        }
        if (!trigger) return;

        var parts = collectDevMobileDeckRowSheetParts(card, deckIndex, instanceIndex);

        body.innerHTML = parts.length
            ? parts.join('')
            : '<p class="dev-mobile-deck-row-menu-empty">No extra actions for this card.</p>';

        sheet.hidden = false;
        panel.hidden = false;
        sheet.classList.add('is-open');
        sheet.setAttribute('aria-hidden', 'false');
        global._devMobileDeckRowMenuAnchor = trigger;

        if (!global._devMobileRowMenuDocDown) {
            global._devMobileRowMenuDocDown = devMobileRowMenuOutsideDown;
            document.addEventListener('mousedown', global._devMobileRowMenuDocDown);
        }

        requestAnimationFrame(function () {
            requestAnimationFrame(function () {
                positionDevMobileRowMenuPanel(trigger);
            });
        });
    };

    global.renderDeckEditorMobileView = renderDeckEditorMobileView;

    var DEV_MOBILE_HEADER_COLLAPSE_LS = 'devMobileDeckHeaderCollapsed';

    function getDeckEditorModalHeader() {
        var m = document.getElementById('deckEditorModal');
        return m ? m.querySelector('.modal-header') : null;
    }

    function readDevMobileDeckHeaderCollapsedPreference() {
        try {
            return localStorage.getItem(DEV_MOBILE_HEADER_COLLAPSE_LS) === '1';
        } catch (e) {
            return false;
        }
    }

    /**
     * MV only: collapse hides title + MAX/TOTAL stats; search, hamburger, and toggle stay in one row.
     */
    global.applyDevMobileDeckHeaderCollapsed = function (collapsed) {
        var header = getDeckEditorModalHeader();
        var btn = document.getElementById('devMobileDeckHeaderCollapseToggle');
        var region = document.getElementById('devMobileDeckHeaderExpandableRegion');
        var stats = document.getElementById('devMobileDeckHeaderStats');
        if (!header || !btn) return;

        var mobile = typeof global.isLayoutMobile === 'function' && global.isLayoutMobile();
        if (!mobile) {
            header.classList.remove('dev-mobile-deck-header-collapsed');
            if (region) region.removeAttribute('aria-hidden');
            if (stats) stats.removeAttribute('aria-hidden');
            btn.setAttribute('aria-expanded', 'true');
            btn.setAttribute('aria-label', 'Collapse deck header');
            btn.title = 'Collapse deck header';
            return;
        }

        if (collapsed) {
            header.classList.add('dev-mobile-deck-header-collapsed');
            btn.setAttribute('aria-expanded', 'false');
            btn.setAttribute('aria-label', 'Expand deck header');
            btn.title = 'Expand deck header';
        } else {
            header.classList.remove('dev-mobile-deck-header-collapsed');
            btn.setAttribute('aria-expanded', 'true');
            btn.setAttribute('aria-label', 'Collapse deck header');
            btn.title = 'Collapse deck header';
        }
        if (region) region.setAttribute('aria-hidden', collapsed ? 'true' : 'false');
        if (stats) stats.setAttribute('aria-hidden', collapsed ? 'true' : 'false');
    };

    global.syncDevMobileDeckHeaderCollapsedState = function () {
        global.applyDevMobileDeckHeaderCollapsed(readDevMobileDeckHeaderCollapsedPreference());
    };

    function initDevMobileDeckHeaderCollapse() {
        var btn = document.getElementById('devMobileDeckHeaderCollapseToggle');
        if (!btn || btn.dataset.devMobileHeaderCollapseInit === '1') return;
        btn.dataset.devMobileHeaderCollapseInit = '1';
        btn.addEventListener('click', function () {
            var header = getDeckEditorModalHeader();
            if (!header) return;
            var next = !header.classList.contains('dev-mobile-deck-header-collapsed');
            global.applyDevMobileDeckHeaderCollapsed(next);
            try {
                localStorage.setItem(DEV_MOBILE_HEADER_COLLAPSE_LS, next ? '1' : '0');
            } catch (e) { /* ignore */ }
        });
        global.syncDevMobileDeckHeaderCollapsedState();
    }

    global.refreshDeckEditorLayoutMode = function () {
        var modal = document.getElementById('deckEditorModal');
        if (!modal) return;
        var visible = modal.classList.contains('modal-visible') || modal.style.display === 'flex';
        if (!visible) return;

        if (typeof initializeDeckEditorSearch === 'function') {
            try {
                initializeDeckEditorSearch();
            } catch (e) { /* ignore */ }
        }

        if (typeof global.isLayoutMobile === 'function' && global.isLayoutMobile()) {
            renderDeckEditorMobileView();
            if (typeof global.syncDevMobileDeckHeaderCollapsedState === 'function') {
                global.syncDevMobileDeckHeaderCollapsedState();
            }
        } else {
            if (typeof global.applyDevMobileDeckHeaderCollapsed === 'function') {
                global.applyDevMobileDeckHeaderCollapsed(false);
            }
            global.closeDevMobileDeckActionsSheet();
            var ed = document.getElementById('deckCardsEditor');
            if (ed && ed.classList.contains('card-view') && typeof renderDeckCardsCardView === 'function') {
                renderDeckCardsCardView();
            } else if (ed && ed.classList.contains('list-view') && typeof renderDeckCardsListView === 'function') {
                renderDeckCardsListView();
            } else if (typeof displayDeckCardsForEditing === 'function') {
                displayDeckCardsForEditing();
            }
        }
    };

    document.addEventListener('layout-mode-change', function () {
        if (typeof global.refreshDeckEditorLayoutMode === 'function') {
            global.refreshDeckEditorLayoutMode();
        }
    });

    document.addEventListener('keydown', function (e) {
        if (e.key !== 'Escape') return;
        var sheet = document.getElementById('devMobileDeckActionsSheet');
        if (!sheet || !sheet.classList.contains('is-open')) return;
        global.closeDevMobileDeckActionsSheet();
    });

    (function initDevMobileRowMenuPanelCloseOnAction() {
        var panel = document.getElementById('devMobileDeckActionsPanel');
        if (!panel || panel.dataset.devMobileMenuInit === '1') return;
        panel.dataset.devMobileMenuInit = '1';
        panel.addEventListener('click', function (e) {
            var sheet = document.getElementById('devMobileDeckActionsSheet');
            if (!sheet || !sheet.classList.contains('is-open')) return;
            if (e.target.closest('button')) {
                requestAnimationFrame(function () {
                    global.closeDevMobileDeckActionsSheet();
                });
            }
        });
    })();

    initDevMobileDeckHeaderCollapse();
})(window);
