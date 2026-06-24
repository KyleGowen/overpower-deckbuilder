import { useEffect, useRef, type RefObject } from 'react';

const SWIPE_THRESHOLD_PX = 50;
const AXIS_LOCK_PX = 12;

/** Regions where horizontal swipe must not steal taps (tabs, footer controls, header). */
export const DECK_EDITOR_SWIPE_BLOCK_SELECTOR =
  '.deck-editor__type-tabs, .deck-editor__card-footer, .deck-editor__card-reserve-wrap, .deck-editor__topbar, .deck-editor__actions, input, textarea, select';

/** Card Database — block header, type tabs, filter rail, and pagination controls. */
export const DBV_SWIPE_BLOCK_SELECTOR =
  '.db__types, .db__header, .dbv-filter-rail, .pagination, input, textarea, select';

export interface UseHorizontalSwipeOptions {
  targetRef: RefObject<HTMLElement | null>;
  enabled?: boolean;
  blockSelector?: string;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
}

/**
 * Native touch listeners (non-passive move/end) so horizontal swipes work on card
 * tiles and suppress accidental clicks after a swipe. Touches that start on
 * blockSelector targets (footer controls, tabs, etc.) are ignored.
 */
export function useHorizontalSwipe({
  targetRef,
  enabled = true,
  blockSelector = DECK_EDITOR_SWIPE_BLOCK_SELECTOR,
  onSwipeLeft,
  onSwipeRight,
}: UseHorizontalSwipeOptions): void {
  const onSwipeLeftRef = useRef(onSwipeLeft);
  const onSwipeRightRef = useRef(onSwipeRight);
  onSwipeLeftRef.current = onSwipeLeft;
  onSwipeRightRef.current = onSwipeRight;

  useEffect(() => {
    const el = targetRef.current;
    if (!el || !enabled) return undefined;

    let start: { x: number; y: number } | null = null;
    let blocked = false;
    let axis: 'none' | 'horizontal' | 'vertical' = 'none';

    const reset = () => {
      start = null;
      blocked = false;
      axis = 'none';
    };

    const onTouchStart = (e: TouchEvent) => {
      const touch = e.touches[0];
      if (!touch) return;
      const target = e.target;
      if (!(target instanceof Element)) return;
      blocked = Boolean(target.closest(blockSelector));
      if (blocked) {
        start = null;
        return;
      }
      start = { x: touch.clientX, y: touch.clientY };
      axis = 'none';
    };

    const onTouchMove = (e: TouchEvent) => {
      if (blocked || !start) return;
      const touch = e.touches[0];
      if (!touch) return;
      const dx = touch.clientX - start.x;
      const dy = touch.clientY - start.y;
      if (axis === 'none') {
        if (Math.abs(dx) < AXIS_LOCK_PX && Math.abs(dy) < AXIS_LOCK_PX) return;
        axis = Math.abs(dx) > Math.abs(dy) ? 'horizontal' : 'vertical';
      }
      if (axis === 'horizontal') {
        e.preventDefault();
      }
    };

    const onTouchEnd = (e: TouchEvent) => {
      if (blocked || !start) {
        reset();
        return;
      }
      const touch = e.changedTouches[0];
      if (!touch) {
        reset();
        return;
      }
      const dx = touch.clientX - start.x;
      const dy = touch.clientY - start.y;
      const isHorizontal =
        axis === 'horizontal' ||
        (axis === 'none' && Math.abs(dx) > Math.abs(dy) && Math.abs(dx) >= SWIPE_THRESHOLD_PX);
      if (isHorizontal && Math.abs(dx) >= SWIPE_THRESHOLD_PX) {
        e.preventDefault();
        if (dx < 0) onSwipeLeftRef.current?.();
        else onSwipeRightRef.current?.();
      }
      reset();
    };

    el.addEventListener('touchstart', onTouchStart, { passive: true });
    el.addEventListener('touchmove', onTouchMove, { passive: false });
    el.addEventListener('touchend', onTouchEnd, { passive: false });
    el.addEventListener('touchcancel', onTouchEnd, { passive: false });

    return () => {
      el.removeEventListener('touchstart', onTouchStart);
      el.removeEventListener('touchmove', onTouchMove);
      el.removeEventListener('touchend', onTouchEnd);
      el.removeEventListener('touchcancel', onTouchEnd);
    };
  }, [targetRef, enabled, blockSelector]);
}
