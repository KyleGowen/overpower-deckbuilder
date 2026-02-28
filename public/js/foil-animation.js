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
 *   mouseenter → randomise vars + add .foil-active  → CSS transition plays
 *   mouseleave → remove .foil-active → transition:none snaps it back instantly
 *
 * Because snap-back is instant, every mouseenter always starts from a clean
 * off-screen position — including moves directly from one foil card to another.
 *
 * RANDOMISED VARS (re-rolled on every hover for per-instance variety)
 * ────────────────────────────────────────────────────────────────────
 *   --foil-duration      sweep length            FOIL_STOP_SECONDS ± FOIL_VARIANCE_SEC
 *   --foil-translate-end where the band stops    FOIL_END_MIN % … FOIL_END_MAX %
 *   --foil-opacity       shimmer brightness      FOIL_OPACITY_MIN … FOIL_OPACITY_MAX
 *   --foil-angle         gradient angle          FOIL_ANGLE_MIN … FOIL_ANGLE_MAX (deg)
 *
 * All visual knobs live in foil-effect.css; this file only sets the numbers.
 *
 * CONFIGURABLE CONSTANTS
 * ─────────────────────
 *   FOIL_STOP_SECONDS   — target duration of the sweep (seconds)
 *   FOIL_VARIANCE_SEC   — max random ± offset from the target
 *   FOIL_MIN_SEC        — floor to prevent near-zero values
 */

(function () {
    /** Target duration of the sweep in seconds. */
    const FOIL_STOP_SECONDS = 0.7;
    /** Maximum random ± offset applied to duration. */
    const FOIL_VARIANCE_SEC = 0.2;
    /** Minimum allowed duration. */
    const FOIL_MIN_SEC = 0.25;

    /**
     * Where the shimmer peak stops on the card (translateX end value,
     * as a % of the pseudo-element's own width).
     *
     * The element is 140 % of card width (inset: -50% -20%).
     * Card edges sit at ~14.3 % and ~85.7 % of element space.
     * The gradient is transparent from 0–20 % and 80–100 %.
     *
     * For the card edges to always land in the fully-transparent zone
     * (no hard clips through the opaque band), the safe limit is:
     *   t_max = transparent_zone_end − card_edge_at_rest = 20 − 14.3 = 5.7 %
     *
     * We clamp to ±5 % for a comfortable safety margin. The position
     * variation (±7 % of card width) is kept visually interesting by
     * the wider angle range below.
     */
    const FOIL_END_MIN = -5;
    const FOIL_END_MAX =  5;

    /** Overall shimmer brightness range. */
    const FOIL_OPACITY_MIN = 0.55;
    const FOIL_OPACITY_MAX = 1.0;

    /**
     * Gradient angle range (degrees).
     * Widened to 90–150° (was 100–135°) to provide more visual variety
     * now that the translateX range is tighter: near-vertical vs steep
     * diagonal shimmers look very different even at similar positions.
     */
    const FOIL_ANGLE_MIN = 90;
    const FOIL_ANGLE_MAX = 150;

    function rand(min, max) {
        return Math.random() * (max - min) + min;
    }

    /**
     * Re-roll all four CSS vars on el so every sweep looks distinct.
     * Exposed as window.randomiseFoilVars so showCardHoverModal can call it
     * before triggering foil-active on the hover modal element.
     */
    function randomiseVars(el) {
        const duration = Math.max(FOIL_MIN_SEC, FOIL_STOP_SECONDS + rand(-FOIL_VARIANCE_SEC, FOIL_VARIANCE_SEC));
        el.style.setProperty('--foil-duration',      duration.toFixed(2) + 's');
        el.style.setProperty('--foil-translate-end', rand(FOIL_END_MIN, FOIL_END_MAX).toFixed(1) + '%');
        el.style.setProperty('--foil-opacity',       rand(FOIL_OPACITY_MIN, FOIL_OPACITY_MAX).toFixed(2));
        el.style.setProperty('--foil-angle',         rand(FOIL_ANGLE_MIN, FOIL_ANGLE_MAX).toFixed(1) + 'deg');
    }
    window.randomiseFoilVars = randomiseVars;

    function initFoilElement(el) {
        if (el._foilInitialised) return;
        el._foilInitialised = true;

        randomiseVars(el);

        el.addEventListener('mouseenter', function () {
            randomiseVars(el);
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
