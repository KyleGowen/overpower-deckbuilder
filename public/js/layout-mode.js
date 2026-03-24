/**
 * Client layout mode: viewport matchMedia + optional user override.
 * See /MOBILE_DESIGN.md and docs/current/STYLE_GUIDE.md (Mobile layout mode).
 */
(function layoutModeInit() {
    var PX = 768;

    function preferDesktop() {
        try {
            return window.localStorage.getItem('preferDesktopLayout') === '1';
        } catch {
            return false;
        }
    }

    function applyLayoutMode() {
        var root = document.documentElement;
        if (preferDesktop()) {
            root.classList.add('layout-desktop');
            root.classList.remove('layout-mobile');
            return;
        }
        var mq = window.matchMedia('(max-width: ' + PX + 'px)');
        if (mq.matches) {
            root.classList.add('layout-mobile');
            root.classList.remove('layout-desktop');
        } else {
            root.classList.add('layout-desktop');
            root.classList.remove('layout-mobile');
        }
    }

    window.LAYOUT_MOBILE_MAX_PX = PX;
    window.applyLayoutMode = applyLayoutMode;
    window.isLayoutMobile = function isLayoutMobile() {
        return document.documentElement.classList.contains('layout-mobile');
    };

    /**
     * @param {boolean} on - true = force desktop layout on narrow viewports
     */
    window.setPreferDesktopLayout = function setPreferDesktopLayout(on) {
        try {
            if (on) {
                window.localStorage.setItem('preferDesktopLayout', '1');
            } else {
                window.localStorage.removeItem('preferDesktopLayout');
            }
        } catch {
            /* ignore */
        }
        applyLayoutMode();
        try {
            window.dispatchEvent(new CustomEvent('layout-mode-change'));
        } catch {
            /* ignore */
        }
    };

    applyLayoutMode();

    function notifyLayoutChange() {
        try {
            window.dispatchEvent(new CustomEvent('layout-mode-change'));
        } catch {
            /* ignore */
        }
    }

    try {
        var m = window.matchMedia('(max-width: ' + PX + 'px)');
        m.addEventListener('change', function onMqChange() {
            applyLayoutMode();
            notifyLayoutChange();
        });
    } catch {
        window.addEventListener('resize', function onResize() {
            applyLayoutMode();
            notifyLayoutChange();
        });
    }
})();
