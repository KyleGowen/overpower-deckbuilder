/**
 * Shared viewport clamping for floating UI (modals, menus).
 * Load early if other scripts need clampRectToViewport synchronously.
 */
(function viewportPositioning(global) {
    var DEFAULT_PAD = 8;

    /**
     * @param {number} left
     * @param {number} top
     * @param {number} width
     * @param {number} height
     * @param {number} [pad]
     * @returns {{ left: number, top: number }}
     */
    function clampRectToViewport(left, top, width, height, pad) {
        var p = pad === undefined || pad === null ? DEFAULT_PAD : pad;
        var vw = global.innerWidth;
        var vh = global.innerHeight;
        var l = left;
        var t = top;
        if (l + width > vw - p) {
            l = Math.max(p, vw - width - p);
        }
        if (l < p) {
            l = p;
        }
        if (t + height > vh - p) {
            t = Math.max(p, vh - height - p);
        }
        if (t < p) {
            t = p;
        }
        return { left: l, top: t };
    }

    global.clampRectToViewport = clampRectToViewport;
})(typeof window !== 'undefined' ? window : globalThis);
