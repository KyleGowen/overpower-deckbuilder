/**
 * Draw Hand Feature Module
 *
 * Encapsulates all Draw Hand functionality for deck editing.
 * Allows users to draw a random hand of 8 cards (9 if events are present)
 * from their deck, excluding characters, locations, and missions.
 *
 * Mobile (layout-mobile): vertical stacked fan, optional header collapse, thumb-drag peek stepping.
 *
 * @module DrawHand
 */

(function () {
    'use strict';

    var drawnCards = [];
    var draggedIndex = null;
    var savedHeaderCollapsed = null;
    var stackResizeObserver = null;

    var BASE_CARD_W = 132;
    var BASE_CARD_H = 185;
    var MIN_PEEK = 28;
    /** Vertical movement (px) per card step when dragging the mobile fan. */
    var SWIPE_STEP_THRESHOLD_PX = 48;

    var fanPointerId = null;
    var fanStepAnchorY = 0;
    var fanPeekIndex = 0;
    var fanContentEl = null;
    var suppressDrawHandClickUntil = 0;

    function isMobileDrawHandLayout() {
        return document.documentElement.classList.contains('layout-mobile');
    }

    function getDeckEditorModal() {
        return document.getElementById('deckEditorModal');
    }

    function setDrawHandActive(active) {
        var modal = getDeckEditorModal();
        if (!modal) {
            return;
        }
        if (active) {
            modal.classList.add('draw-hand-active');
        } else {
            modal.classList.remove('draw-hand-active');
        }
    }

    function openDrawHandChrome() {
        if (!isMobileDrawHandLayout()) {
            return;
        }
        var modal = getDeckEditorModal();
        var header = modal && modal.querySelector('.modal-header');
        if (header) {
            savedHeaderCollapsed = header.classList.contains('dev-mobile-deck-header-collapsed');
        } else {
            savedHeaderCollapsed = false;
        }
        if (typeof window.applyDevMobileDeckHeaderCollapsed === 'function') {
            window.applyDevMobileDeckHeaderCollapsed(true);
        }
    }

    function closeDrawHandChrome() {
        if (!isMobileDrawHandLayout()) {
            savedHeaderCollapsed = null;
            return;
        }
        if (savedHeaderCollapsed === null) {
            return;
        }
        if (typeof window.applyDevMobileDeckHeaderCollapsed === 'function') {
            window.applyDevMobileDeckHeaderCollapsed(savedHeaderCollapsed);
        }
        savedHeaderCollapsed = null;
    }

    function updateStackLayout() {
        var content = document.getElementById('drawHandContent');
        var modal = getDeckEditorModal();
        if (!content || !modal || !modal.classList.contains('draw-hand-active')) {
            return;
        }
        if (!isMobileDrawHandLayout()) {
            return;
        }
        var section = document.getElementById('drawHandSection');
        if (!section || section.style.display === 'none') {
            return;
        }

        var cards = content.querySelectorAll('.drawn-card');
        var n = cards.length;
        if (n === 0) {
            return;
        }

        var available = content.clientHeight;
        if (available <= 0) {
            return;
        }

        var cw = content.clientWidth;
        var scale = cw > 0 ? cw / BASE_CARD_W : 1;
        var overlap = 0;
        var iter;
        for (iter = 0; iter < 12; iter++) {
            var H = BASE_CARD_H * scale;
            var maxOverlap = Math.max(0, H - MIN_PEEK * scale);
            overlap = n > 1 ? (n * H - available) / (n - 1) : 0;
            if (overlap < 0) {
                overlap = 0;
            }
            if (overlap > maxOverlap) {
                overlap = maxOverlap;
            }
            var stackH = n * H - (n - 1) * overlap;
            if (stackH <= available || stackH <= 0) {
                break;
            }
            scale *= available / stackH;
        }

        content.style.setProperty('--draw-hand-stack-overlap', overlap + 'px');
        content.style.setProperty('--draw-hand-card-scale', String(scale));

        var i;
        for (i = 0; i < n; i++) {
            cards[i].style.zIndex = String(10 + i);
        }
    }

    function scheduleStackLayout() {
        if (!isMobileDrawHandLayout()) {
            return;
        }
        requestAnimationFrame(function () {
            requestAnimationFrame(updateStackLayout);
        });
    }

    function ensureStackResizeObserver() {
        if (stackResizeObserver || typeof ResizeObserver === 'undefined') {
            return;
        }
        var content = document.getElementById('drawHandContent');
        if (!content) {
            return;
        }
        stackResizeObserver = new ResizeObserver(function () {
            updateStackLayout();
        });
        stackResizeObserver.observe(content);
    }

    /**
     * Finger moves up (clientY decreases) → lower index; down → higher index.
     * @returns {{ peekIndex: number, nextAnchorY: number }}
     */
    function computePeekSwipeStep(anchorY, clientY, peekIndex, n, threshold) {
        var dy = clientY - anchorY;
        var idx = peekIndex;
        var t = threshold;
        while (dy <= -t && idx > 0) {
            idx--;
            dy += t;
        }
        while (dy >= t && idx < n - 1) {
            idx++;
            dy -= t;
        }
        return { peekIndex: idx, nextAnchorY: clientY - dy };
    }

    function resetDrawHandFanPointerHard() {
        if (fanContentEl !== null && fanPointerId !== null) {
            try {
                fanContentEl.releasePointerCapture(fanPointerId);
            } catch (_err) {}
        }
        var content = fanContentEl || document.getElementById('drawHandContent');
        fanPointerId = null;
        fanContentEl = null;
        fanPeekIndex = 0;
        fanStepAnchorY = 0;
        if (content) {
            content.classList.remove('draw-hand-fan-dragging');
            content.querySelectorAll('.draw-hand-peek-active').forEach(function (c) {
                c.classList.remove('draw-hand-peek-active');
            });
        }
    }

    function applyDrawHandPeekToIndex(content, index) {
        var cards = content.querySelectorAll('.drawn-card');
        var n = cards.length;
        if (n === 0 || index < 0 || index >= n) {
            return;
        }
        content.querySelectorAll('.draw-hand-peek-active').forEach(function (c) {
            c.classList.remove('draw-hand-peek-active');
        });
        cards[index].classList.add('draw-hand-peek-active');
    }

    function handleDrawHandPointerDown(e) {
        if (!isMobileDrawHandLayout()) {
            return;
        }
        var modal = getDeckEditorModal();
        if (!modal || !modal.classList.contains('draw-hand-active')) {
            return;
        }
        if (e.button !== 0 && e.button !== undefined) {
            return;
        }
        var content = document.getElementById('drawHandContent');
        if (!content || !content.contains(e.target)) {
            return;
        }
        var card = e.target.closest('.drawn-card');
        if (!card || !content.contains(card)) {
            return;
        }
        if (fanPointerId !== null) {
            return;
        }
        if (e.pointerType === 'touch') {
            e.preventDefault();
        }
        fanPointerId = e.pointerId;
        fanContentEl = content;
        fanPeekIndex = parseInt(card.dataset.index, 10);
        if (isNaN(fanPeekIndex)) {
            fanPeekIndex = 0;
        }
        fanStepAnchorY = e.clientY;
        content.classList.add('draw-hand-fan-dragging');
        try {
            content.setPointerCapture(e.pointerId);
        } catch (_err2) {}
        applyDrawHandPeekToIndex(content, fanPeekIndex);
    }

    function handleDrawHandPointerMove(e) {
        if (fanPointerId === null || e.pointerId !== fanPointerId || fanContentEl === null) {
            return;
        }
        var content = fanContentEl;
        var n = content.querySelectorAll('.drawn-card').length;
        if (n === 0) {
            return;
        }
        var step = computePeekSwipeStep(fanStepAnchorY, e.clientY, fanPeekIndex, n, SWIPE_STEP_THRESHOLD_PX);
        fanPeekIndex = step.peekIndex;
        fanStepAnchorY = step.nextAnchorY;
        applyDrawHandPeekToIndex(content, fanPeekIndex);
    }

    function handleDrawHandPointerEnd(e) {
        if (fanPointerId === null || e.pointerId !== fanPointerId) {
            return;
        }
        suppressDrawHandClickUntil = Date.now() + 350;
        resetDrawHandFanPointerHard();
    }

    function ensureDrawHandContentListeners(content) {
        if (!content || content.getAttribute('data-draw-hand-listeners') === '1') {
            return;
        }
        content.setAttribute('data-draw-hand-listeners', '1');
        content.addEventListener('dragover', handleContainerDragOver);
        content.addEventListener('drop', handleContainerDrop);
        content.addEventListener('click', handleDrawHandContentClick);
        content.addEventListener('pointerdown', handleDrawHandPointerDown, { passive: false });
        content.addEventListener('pointermove', handleDrawHandPointerMove);
        content.addEventListener('pointerup', handleDrawHandPointerEnd);
        content.addEventListener('pointercancel', handleDrawHandPointerEnd);
    }

    function handleDrawHandContentClick(e) {
        if (!isMobileDrawHandLayout()) {
            return;
        }
        if (Date.now() < suppressDrawHandClickUntil) {
            e.preventDefault();
            e.stopPropagation();
            return;
        }
        var modal = getDeckEditorModal();
        if (!modal || !modal.classList.contains('draw-hand-active')) {
            return;
        }
        var content = document.getElementById('drawHandContent');
        if (!content || !content.contains(e.target)) {
            return;
        }
        var card = e.target.closest('.drawn-card');
        if (card && content.contains(card)) {
            if (card.classList.contains('draw-hand-peek-active')) {
                card.classList.remove('draw-hand-peek-active');
            } else {
                content.querySelectorAll('.draw-hand-peek-active').forEach(function (c) {
                    c.classList.remove('draw-hand-peek-active');
                });
                card.classList.add('draw-hand-peek-active');
            }
            return;
        }
        content.querySelectorAll('.draw-hand-peek-active').forEach(function (c) {
            c.classList.remove('draw-hand-peek-active');
        });
    }

    function init() {
        drawnCards = [];
        draggedIndex = null;
        window.drawnCards = drawnCards;
    }

    function drawHand() {
        var deckCards = window.deckEditorCards || [];

        var drawPile = [];
        deckCards.forEach(function (card) {
            if (card.type !== 'character' && card.type !== 'location' && card.type !== 'mission') {
                if (card.exclude_from_draw === true) {
                    return;
                }
                var q;
                for (q = 0; q < card.quantity; q++) {
                    drawPile.push(card);
                }
            }
        });

        var newDrawnCards = [];
        var usedIndices = new Set();
        var targetHandSize = 8;

        var maxCardsToDraw = Math.min(targetHandSize, drawPile.length);

        var attempts = 0;
        var maxAttempts = drawPile.length * 10;

        while (newDrawnCards.length < maxCardsToDraw && attempts < maxAttempts) {
            attempts++;
            var randomIndex = Math.floor(Math.random() * drawPile.length);
            if (!usedIndices.has(randomIndex)) {
                usedIndices.add(randomIndex);
                newDrawnCards.push(drawPile[randomIndex]);
            }
        }

        var hasEventCards = newDrawnCards.some(function (card) {
            return card.type === 'event';
        });
        if (hasEventCards && drawPile.length > 8 && newDrawnCards.length < 9 && newDrawnCards.length < drawPile.length) {
            var eventAttempts = 0;
            var maxEventAttempts = drawPile.length * 2;
            while (newDrawnCards.length < 9 && eventAttempts < maxEventAttempts) {
                eventAttempts++;
                var ri = Math.floor(Math.random() * drawPile.length);
                if (!usedIndices.has(ri)) {
                    usedIndices.add(ri);
                    newDrawnCards.push(drawPile[ri]);
                    break;
                }
            }
        }

        drawnCards = newDrawnCards;
        window.drawnCards = drawnCards;

        displayDrawnCards(drawnCards);
    }

    function applyCardBackground(cardElement, imagePath) {
        cardElement.style.backgroundImage = 'url(\'' + imagePath + '\')';
    }

    /** Mouse on a different card clears tap-peek so only :hover drives focus (fine pointers only). */
    function attachDrawFanHoverPeekHandoff(cardElement) {
        cardElement.addEventListener('mouseenter', function () {
            if (typeof window.matchMedia !== 'function') {
                return;
            }
            if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
                return;
            }
            var content = document.getElementById('drawHandContent');
            if (!content) {
                return;
            }
            content.querySelectorAll('.draw-hand-peek-active').forEach(function (c) {
                if (c !== cardElement) {
                    c.classList.remove('draw-hand-peek-active');
                }
            });
        });
    }

    function displayDrawnCards(cards) {
        var drawHandContent = document.getElementById('drawHandContent');
        if (!drawHandContent) {
            console.warn('Draw hand content element not found');
            return;
        }

        drawnCards = cards || [];
        window.drawnCards = drawnCards;

        resetDrawHandFanPointerHard();
        drawHandContent.innerHTML = '';

        ensureDrawHandContentListeners(drawHandContent);
        ensureStackResizeObserver();

        cards.forEach(function (card, index) {
            var cardElement = document.createElement('div');
            cardElement.className = 'drawn-card';
            cardElement.draggable = !isMobileDrawHandLayout();
            cardElement.dataset.index = String(index);

            if (card.type === 'event') {
                cardElement.classList.add('event-card');
            }

            if (window.SimulateKO && window.SimulateKO.shouldDimCard) {
                var shouldDim = window.SimulateKO.shouldDimCard(
                    card,
                    window.availableCardsMap || new Map(),
                    window.deckEditorCards || []
                );
                if (shouldDim) {
                    cardElement.classList.add('ko-dimmed');
                }
            }

            var availableCard = window.availableCardsMap && window.availableCardsMap.get(card.cardId);
            var imagePath;
            var titleText = 'Unknown Card';
            if (availableCard) {
                imagePath = getCardImagePath(availableCard, card.type);
                titleText = availableCard.name || availableCard.card_name || card.name || 'Unknown Card';
            } else {
                imagePath = (window.APP_CDN_BASE || '') + '/src/resources/cards/images/placeholder.webp';
            }
            cardElement.title = titleText;

            if (card.type === 'event') {
                var face = document.createElement('div');
                face.className = 'drawn-card-face';
                face.style.backgroundImage = 'url(\'' + imagePath + '\')';
                cardElement.appendChild(face);
            } else {
                applyCardBackground(cardElement, imagePath);
            }

            cardElement.addEventListener('dragstart', handleDragStart);
            cardElement.addEventListener('dragend', handleDragEnd);
            cardElement.addEventListener('dragover', handleDragOver);
            cardElement.addEventListener('drop', handleDrop);
            attachDrawFanHoverPeekHandoff(cardElement);

            drawHandContent.appendChild(cardElement);
        });

        scheduleStackLayout();
    }

    function cardFromEventTarget(target) {
        if (!target || !target.closest) {
            return null;
        }
        return target.closest('.drawn-card');
    }

    function handleDragStart(e) {
        var el = cardFromEventTarget(e.target);
        if (!el) {
            return;
        }
        draggedIndex = parseInt(el.dataset.index, 10);
        el.classList.add('dragging');
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/html', el.outerHTML);

        document.querySelectorAll('.drawn-card').forEach(function (card, index) {
            if (index !== draggedIndex) {
                card.classList.add('drag-target');
            }
        });
    }

    function handleDragEnd(e) {
        var el = cardFromEventTarget(e.target);
        if (el) {
            el.classList.remove('dragging');
        }
        draggedIndex = null;

        document.querySelectorAll('.drawn-card').forEach(function (card) {
            card.classList.remove('drag-target');
        });
    }

    function handleDragOver(e) {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    }

    function handleDrop(e) {
        e.preventDefault();
        var targetCard = cardFromEventTarget(e.target);
        if (!targetCard) {
            return;
        }
        var targetIndex = parseInt(targetCard.dataset.index, 10);

        if (draggedIndex !== null && !isNaN(targetIndex) && draggedIndex !== targetIndex) {
            var temp = drawnCards[draggedIndex];
            drawnCards[draggedIndex] = drawnCards[targetIndex];
            drawnCards[targetIndex] = temp;
            window.drawnCards = drawnCards;
            displayDrawnCards(drawnCards);
        }
    }

    function handleContainerDragOver(e) {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        e.currentTarget.classList.add('drag-over');
    }

    function handleContainerDrop(e) {
        e.preventDefault();
        e.currentTarget.classList.remove('drag-over');
    }

    function toggle() {
        var drawHandSection = document.getElementById('drawHandSection');
        var drawHandBtn = document.getElementById('drawHandBtn');

        if (!drawHandSection || !drawHandBtn) {
            console.warn('Draw hand elements not found');
            return;
        }

        var hidden = drawHandSection.style.display === 'none' || !drawHandSection.style.display;

        if (hidden) {
            openDrawHandChrome();
            setDrawHandActive(true);
            drawHandSection.style.display = isMobileDrawHandLayout() ? 'flex' : 'block';
            ensureStackResizeObserver();
            drawHand();
        } else {
            drawHand();
        }
    }

    function close() {
        var drawHandSection = document.getElementById('drawHandSection');
        if (!drawHandSection) {
            console.warn('Draw hand elements not found');
            return;
        }

        setDrawHandActive(false);
        resetDrawHandFanPointerHard();
        closeDrawHandChrome();
        drawHandSection.style.display = 'none';
    }

    function updateButtonState(deckCards) {
        var drawHandBtn = document.getElementById('drawHandBtn');

        if (!drawHandBtn) {
            return;
        }

        var playableCardsCount = (deckCards || [])
            .filter(function (card) {
                return card.type !== 'character' && card.type !== 'location' && card.type !== 'mission';
            })
            .reduce(function (sum, card) {
                return sum + (card.quantity || 0);
            }, 0);

        if (playableCardsCount >= 8) {
            drawHandBtn.disabled = false;
            drawHandBtn.style.opacity = '1';
            drawHandBtn.style.cursor = 'pointer';
            drawHandBtn.title = '';
        } else {
            drawHandBtn.disabled = true;
            drawHandBtn.style.opacity = '0.5';
            drawHandBtn.style.cursor = 'not-allowed';
            drawHandBtn.title = 'Deck must contain at least 8 playable cards.';
        }
    }

    function getDrawnCards() {
        return drawnCards;
    }

    function refresh() {
        var cardsToDisplay = drawnCards && drawnCards.length > 0 ? drawnCards : window.drawnCards || [];
        if (cardsToDisplay && cardsToDisplay.length > 0) {
            displayDrawnCards(cardsToDisplay);
        }
    }

    window.DrawHand = {
        init: init,
        drawHand: drawHand,
        displayDrawnCards: displayDrawnCards,
        toggle: toggle,
        close: close,
        updateButtonState: updateButtonState,
        getDrawnCards: getDrawnCards,
        refresh: refresh,
        /** @internal Unit tests only — swipe step math for mobile fan. */
        __testPeekSwipeStep: computePeekSwipeStep
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    window.displayDrawnCards = function (cards) {
        displayDrawnCards(cards);
        drawnCards = cards;
        window.drawnCards = cards;
    };
})();
