import { useCallback, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

export const DECK_CARD_DETAIL_STATE_KEY = 'deckCardDetail';

/**
 * Pushes one React Router history entry while the deck card detail slide-out is open so
 * mobile back / swipe-back closes the panel without leaving the deck editor route.
 *
 * Does not call navigate(-1) in effect cleanup (avoids React Strict Mode + router races).
 */
export function useDeckCardDetailHistory(
  open: boolean,
  onClose: () => void,
): { close: () => void } {
  const navigate = useNavigate();
  const location = useLocation();
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;
  const locationRef = useRef(location);
  locationRef.current = location;

  const historyActiveRef = useRef(false);
  const closingFromPopRef = useRef(false);

  useEffect(() => {
    if (!open) {
      historyActiveRef.current = false;
      closingFromPopRef.current = false;
      return undefined;
    }

    // Strict Mode remount — history entry already pushed for this open cycle.
    if (historyActiveRef.current) return undefined;

    const handlePopState = () => {
      if (!historyActiveRef.current) return;
      closingFromPopRef.current = true;
      historyActiveRef.current = false;
      onCloseRef.current();
    };

    window.addEventListener('popstate', handlePopState);
    navigate('.', {
      state: {
        ...(locationRef.current.state as object | null),
        [DECK_CARD_DETAIL_STATE_KEY]: true,
      },
      replace: false,
    });
    historyActiveRef.current = true;

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [open, navigate]);

  const close = useCallback(() => {
    const hadHistory = historyActiveRef.current;
    historyActiveRef.current = false;
    onCloseRef.current();
    if (hadHistory && !closingFromPopRef.current) {
      navigate(-1);
    }
    closingFromPopRef.current = false;
  }, [navigate]);

  return { close };
}
