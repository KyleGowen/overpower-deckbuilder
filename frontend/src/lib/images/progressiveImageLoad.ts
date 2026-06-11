/**
 * Preload full-res art and reveal on an in-DOM layer after decode (no flash).
 * See docs/current/PROGRESSIVE_IMAGE_LOADING.md.
 */
export interface ProgressiveLoadHandle {
  cancel: () => void;
}

export interface ProgressiveImageTarget {
  src: string;
  decode: () => Promise<void>;
}

export function preloadAndRevealFullRes(
  fullUrl: string,
  targetImg: ProgressiveImageTarget,
  onRevealed: () => void,
): ProgressiveLoadHandle {
  let cancelled = false;
  const preload = new Image();

  const reveal = () => {
    onRevealed();
  };

  preload.onload = () => {
    if (cancelled) return;
    targetImg.src = fullUrl;
    targetImg
      .decode()
      .then(() => {
        if (!cancelled) reveal();
      })
      .catch(() => {
        if (!cancelled) reveal();
      });
  };

  preload.onerror = () => {
    // Leave the thumbnail visible; full layer stays hidden.
  };

  preload.src = fullUrl;

  return {
    cancel: () => {
      cancelled = true;
    },
  };
}
