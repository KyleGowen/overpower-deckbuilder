/**
 * foil-animation.js
 *
 * Drives the foil shimmer sweep on every .foil-shimmer element.
 *
 * APPROACH
 * --------
 * CSS alone cannot reliably re-trigger a transition on an element every time
 * the cursor enters it (the :hover approach breaks when the hover modal
 * overlaps the card, or when moving directly between foil cards).
 *
 * Instead we use a lightweight JS class-toggle:
 *   mouseenter → add .foil-active  → CSS transition slides shimmer in
 *   mouseleave → remove .foil-active → CSS transition:none snaps it back
 *
 * Because the snap-back is instant (no transition on remove), the very next
 * mouseenter always starts from a clean off-screen position, guaranteeing a
 * fresh sweep on every hover including foil-to-foil moves.
 *
 * CONFIGURABLE CONSTANTS
 * ─────────────────────
 *   FOIL_STOP_SECONDS   — target duration of the sweep (seconds)
 *   FOIL_VARIANCE_SEC   — max random ± offset from the target
 *   FOIL_MIN_SEC        — floor to prevent near-zero values
 */

(function () {
    /** Target duration of the sweep in seconds. Change to taste. */
    const FOIL_STOP_SECONDS = 0.9;

    /** Maximum random offset (±) applied to FOIL_STOP_SECONDS per element. */
    const FOIL_VARIANCE_SEC = 0.25;

    /** Minimum allowed duration — prevents near-zero values. */
    const FOIL_MIN_SEC = 0.3;

    function randomDuration() {
        const jitter = (Math.random() * 2 - 1) * FOIL_VARIANCE_SEC;
        return Math.max(FOIL_MIN_SEC, FOIL_STOP_SECONDS + jitter).toFixed(2);
    }

    function initFoilElement(el) {
        if (el._foilInitialised) return;
        el._foilInitialised = true;

        el.style.setProperty('--foil-duration', randomDuration() + 's');

        el.addEventListener('mouseenter', function () {
            el.classList.add('foil-active');
        });

        el.addEventListener('mouseleave', function () {
            el.classList.remove('foil-active');
        });
    }

    function processNode(node) {
        if (node.nodeType !== 1) return;
        if (node.classList && node.classList.contains('foil-shimmer')) {
            initFoilElement(node);
        }
        if (typeof node.querySelectorAll === 'function') {
            node.querySelectorAll('.foil-shimmer').forEach(initFoilElement);
        }
    }

    const observer = new MutationObserver(function (mutations) {
        for (const m of mutations) {
            if (m.type === 'childList') {
                m.addedNodes.forEach(processNode);
            } else if (m.type === 'attributes' && m.attributeName === 'class') {
                const el = m.target;
                const hadFoil = (m.oldValue || '').split(/\s+/).includes('foil-shimmer');
                const hasFoil = el.classList && el.classList.contains('foil-shimmer');
                if (!hadFoil && hasFoil) {
                    initFoilElement(el);
                }
            }
        }
    });

    function start() {
        document.querySelectorAll('.foil-shimmer').forEach(initFoilElement);

        observer.observe(document.body, {
            childList: true,
            subtree: true,
            attributes: true,
            attributeFilter: ['class'],
            attributeOldValue: true,
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', start);
    } else {
        start();
    }
})();
