/**
 * Deck Editor View (DEV) — mobile layout-only list (layout-mobile).
 * Renders categorized collapsible sections and Collection-style rows with − / + and an actions sheet.
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

    function renderDeckEditorMobileView() {
        var deckCardsEditor = document.getElementById('deckCardsEditor');
        var chrome = document.getElementById('devMobileDeckChrome');
        if (!deckCardsEditor) return;
        if (typeof global.isLayoutMobile !== 'function' || !global.isLayoutMobile()) return;

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

                    var actions = '';
                    if (!readOnly) {
                        if (canStack) {
                            actions += '<button type="button" class="dev-mobile-deck-qty-btn touch-target-min" aria-label="Remove one copy" onclick="removeOneCardFromEditor(' + index + ')">−</button>';
                            actions += '<button type="button" class="dev-mobile-deck-qty-btn touch-target-min" aria-label="Add one copy" onclick="addOneCardToEditor(' + index + ')">+</button>';
                        } else {
                            actions += '<button type="button" class="dev-mobile-deck-qty-btn touch-target-min" aria-label="Remove card" onclick="removeCardFromEditor(' + index + ')">−</button>';
                        }
                        actions += '<button type="button" class="dev-mobile-deck-overflow-btn touch-target-min" aria-label="More actions" onclick="openDevMobileDeckRowSheet(' + index + ',' + i + ')">⋯</button>';
                    }

                    html += '<div class="dev-mobile-deck-row" data-deck-index="' + index + '" data-instance="' + i + '">';
                    html += '<div class="dev-mobile-deck-row-thumb"><img src="' + escapeAttr(imgSrc) + '" alt=""></div>';
                    html += '<div class="dev-mobile-deck-row-name">' + escapeHtml(name) + '</div>';
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
        if (!sheet) return;
        sheet.classList.remove('is-open');
        sheet.setAttribute('aria-hidden', 'true');
        sheet.hidden = true;
    };

    global.openDevMobileDeckRowSheet = function (deckIndex, instanceIndex) {
        if (isDeckEditorReadOnlyUi()) return;

        var sheet = document.getElementById('devMobileDeckActionsSheet');
        var body = document.getElementById('devMobileDeckActionsBody');
        if (!sheet || !body) return;

        var card = global.deckEditorCards[deckIndex];
        if (!card) return;

        var parts = [];
        var cid = String(card.cardId).replace(/'/g, "\\'");
        var safeIndex = deckIndex;
        var safeInst = instanceIndex;

        if (card.type === 'character' || card.type === 'special' || card.type === 'power' || card.type === 'location') {
            parts.push(
                '<button type="button" class="dev-mobile-deck-action-btn touch-target-min" onclick="showAlternateArtSelectionForExistingCard(\'' +
                cid + '\',' + safeIndex + ',' + safeInst + ')">Change art</button>'
            );
        }

        var instId = resolveInstanceCardId(card, instanceIndex);
        if (global.foilCardMap && global.foilCardMap[instId] !== undefined) {
            parts.push(
                '<button type="button" class="dev-mobile-deck-action-btn touch-target-min" onclick="toggleFoilForCard(\'' +
                cid + '\',' + safeIndex + ',' + safeInst + ')">Foil</button>'
            );
        }

        if (card.type === 'character' && global.currentUser) {
            var kod = global.SimulateKO && global.SimulateKO.isKOd(card.cardId);
            parts.push(
                '<button type="button" class="dev-mobile-deck-action-btn touch-target-min" onclick="toggleKOCharacter(\'' +
                cid + '\',' + safeIndex + ')">' + (kod ? 'Un-KO character' : 'KO character') + '</button>'
            );
        }

        if (card.type === 'character' && typeof getReserveCharacterButton === 'function') {
            var rbtn = getReserveCharacterButton(card.cardId, deckIndex);
            if (rbtn) {
                parts.push('<div class="dev-mobile-deck-action-html">' + rbtn + '</div>');
            }
        }

        if (card.type === 'training' && typeof hasSpartanTrainingGround === 'function' && hasSpartanTrainingGround()) {
            var excl = card.exclude_from_draw === true;
            parts.push(
                '<button type="button" class="dev-mobile-deck-action-btn touch-target-min" onclick="drawTrainingCard(\'' +
                cid + '\',' + safeIndex + ')">' + (excl ? 'Include in draw' : 'Pre-placed') + '</button>'
            );
        } else if (card.type === 'basic-universe' && typeof hasDraculasArmory === 'function' && hasDraculasArmory()) {
            var exclB = card.exclude_from_draw === true;
            parts.push(
                '<button type="button" class="dev-mobile-deck-action-btn touch-target-min" onclick="drawBasicUniverseCard(\'' +
                cid + '\',' + safeIndex + ')">' + (exclB ? 'Include in draw' : 'Pre-placed') + '</button>'
            );
        } else if (card.type === 'special' && typeof hasLancelot === 'function' && hasLancelot()) {
            var cdata = lookupAvailableCard(card.cardId, card.type);
            var cname = cdata ? (cdata.name || cdata.card_name || '') : '';
            var cidStr = String(card.cardId);
            if (cname === 'Sword and Shield' || cidStr.indexOf('sword_and_shield') !== -1 || cidStr.indexOf('sword-and-shield') !== -1) {
                var exclS = card.exclude_from_draw === true;
                parts.push(
                    '<button type="button" class="dev-mobile-deck-action-btn touch-target-min" onclick="drawSwordAndShield(\'' +
                    cid + '\',' + safeIndex + ')">' + (exclS ? 'Include in draw' : 'Pre-placed') + '</button>'
                );
            }
        }

        if (card.type === 'mission' && typeof getDisplayMissionButton === 'function') {
            var mhtml = getDisplayMissionButton(card.cardId, deckIndex);
            if (mhtml) {
                parts.push('<div class="dev-mobile-deck-action-html">' + mhtml + '</div>');
            }
        }

        body.innerHTML = parts.length ? parts.join('') : '<p class="dev-mobile-deck-action-empty">No extra actions for this card.</p>';

        body.addEventListener(
            'click',
            function () {
                setTimeout(function () {
                    global.closeDevMobileDeckActionsSheet();
                }, 0);
            },
            { once: true }
        );

        sheet.hidden = false;
        sheet.classList.add('is-open');
        sheet.setAttribute('aria-hidden', 'false');
    };

    global.renderDeckEditorMobileView = renderDeckEditorMobileView;

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
        } else {
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
})(window);
