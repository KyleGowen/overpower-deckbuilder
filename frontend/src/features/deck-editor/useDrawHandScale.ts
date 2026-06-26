import { useLayoutEffect, useState, type RefObject } from 'react';

const MOBILE_LAYOUT_MQ = '(max-width: 900px)';

function isMobileLayout(): boolean {
  if (typeof window === 'undefined') return false;
  return document.documentElement.classList.contains('layout-mobile');
}

function readPortraitColWidth(): number {
  if (typeof window === 'undefined') return 210;
  const raw = getComputedStyle(document.documentElement)
    .getPropertyValue('--deck-editor-portrait-col')
    .trim();
  const parsed = parseFloat(raw);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 210;
}

/**
 * Uniform scale so the full drawn hand fits in the panel width (desktop/tablet only).
 * Returns 1 on layout-mobile — the two-column grid scrolls in the panel body instead.
 */
export function useDrawHandScale(
  rowRef: RefObject<HTMLElement | null>,
  cardCount: number,
): number {
  const [scale, setScale] = useState(1);

  useLayoutEffect(() => {
    const el = rowRef.current;
    if (!el || cardCount === 0) {
      setScale(1);
      return;
    }

    const update = () => {
      if (isMobileLayout()) {
        setScale(1);
        return;
      }
      const baseWidth = readPortraitColWidth();
      const inner = el.firstElementChild;
      const gapSource = inner instanceof HTMLElement ? inner : el;
      const gap =
        parseFloat(getComputedStyle(gapSource).columnGap || getComputedStyle(gapSource).gap) ||
        16;
      const available = el.clientWidth;
      const needed =
        cardCount * baseWidth + Math.max(0, cardCount - 1) * gap;
      setScale(needed > 0 && available > 0 ? Math.min(1, available / needed) : 1);
    };

    const ro = new ResizeObserver(update);
    ro.observe(el);

    const mq = window.matchMedia(MOBILE_LAYOUT_MQ);
    mq.addEventListener('change', update);
    update();

    return () => {
      ro.disconnect();
      mq.removeEventListener('change', update);
    };
  }, [cardCount, rowRef]);

  return scale;
}
