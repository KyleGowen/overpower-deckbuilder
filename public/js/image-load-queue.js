/* ========================================
 * Image Load Queue - Throttle concurrent image loads
 * ========================================
 *
 * Prevents 502 errors by limiting concurrent image requests.
 * Uses data-src for deferred loading; sets src when queue processes.
 * Retries once on 502/network failure.
 *
 * Usage: Use data-src instead of src on img elements, then call
 *   window.ImageLoadQueue.observe(containerElement)
 * or
 *   window.ImageLoadQueue.queueImageLoad(imgElement, imageUrl)
 */

(function() {
    'use strict';

    const MAX_CONCURRENT = 24;
    const RETRY_DELAY_MS = 2000;
    const MAX_RETRIES = 1;

    /** Placeholder 1x1 transparent PNG to avoid broken image icon before load */
    const PLACEHOLDER_SRC = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';

    const queue = [];
    let activeCount = 0;

    function processQueue() {
        while (activeCount < MAX_CONCURRENT && queue.length > 0) {
            const item = queue.shift();
            if (item && item.img && !item.img.dataset.queueProcessed) {
                activeCount++;
                item.img.dataset.queueProcessed = 'true';
                loadImage(item);
            }
        }
    }

    function loadImage(item) {
        const img = item.img;
        const src = item.src;
        const retries = item.retries !== undefined ? item.retries : 0;

        function onComplete() {
            activeCount--;
            processQueue();
        }

        function doLoad() {
            img.src = src;
        }

        img.addEventListener('load', function handler() {
            img.removeEventListener('load', handler);
            img.removeAttribute('data-queued-src');
            onComplete();
        }, { once: true });

        img.addEventListener('error', function handler() {
            img.removeEventListener('error', handler);
            if (retries < MAX_RETRIES) {
                img.src = PLACEHOLDER_SRC;
                img.dataset.queueProcessed = '';
                activeCount--;
                setTimeout(function() {
                    queue.unshift({ img: img, src: src, retries: retries + 1 });
                    processQueue();
                }, RETRY_DELAY_MS);
            } else {
                console.warn('[ImageLoadQueue] Image failed to load:', src);
                onComplete();
            }
        }, { once: true });

        doLoad();
    }

    /**
     * Queue an image for loaded loading. Use when img has data-src set.
     * @param {HTMLImageElement} img - Image element
     * @param {string} [src] - Optional override; defaults to img.dataset.src
     */
    function queueImageLoad(img, src) {
        if (!img || !(img instanceof HTMLImageElement)) return;
        const url = src || img.dataset.src || img.getAttribute('data-src');
        if (!url) return;
        if (img.dataset.queueProcessed === 'true') return;

        img.dataset.src = url;
        img.dataset.queuedSrc = url;
        img.src = PLACEHOLDER_SRC;

        queue.push({ img: img, src: url });
        processQueue();
    }

    /**
     * Observe a container for img elements with data-src.
     * Uses IntersectionObserver - only queues when element is near viewport.
     * @param {HTMLElement} container - Container to observe (e.g. tbody, #all-cards-grid)
     */
    function observe(container) {
        if (!container || !window.IntersectionObserver) return;

        const observer = new IntersectionObserver(function(entries) {
            entries.forEach(function(entry) {
                if (!entry.isIntersecting) return;
                const img = entry.target;
                if (img.tagName !== 'IMG') return;
                const url = img.dataset.src || img.getAttribute('data-src');
                if (url && img.dataset.queueProcessed !== 'true') {
                    observer.unobserve(img);
                    queueImageLoad(img, url);
                }
            });
        }, {
            rootMargin: '800px',
            threshold: 0
        });

        const imgs = container.querySelectorAll('img[data-src]');
        imgs.forEach(function(img) {
            observer.observe(img);
        });
    }

    /**
     * Process all img[data-src] descendants of container immediately
     * (no IntersectionObserver - for when content is already visible)
     */
    function processContainer(container) {
        if (!container) return;
        const imgs = container.querySelectorAll('img[data-src]');
        imgs.forEach(function(img) {
            const url = img.dataset.src || img.getAttribute('data-src');
            if (url) queueImageLoad(img, url);
        });
    }

    window.ImageLoadQueue = {
        queueImageLoad: queueImageLoad,
        observe: observe,
        processContainer: processContainer
    };
})();
