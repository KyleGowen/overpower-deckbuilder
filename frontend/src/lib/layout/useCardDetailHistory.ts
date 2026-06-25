import { useCallback, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  CARD_DETAIL_STATE_KEY,
  createCardDetailHistoryController,
} from './cardDetailHistoryController';

export { CARD_DETAIL_STATE_KEY } from './cardDetailHistoryController';

/**
 * Pushes one React Router history entry while a card detail slide-out is open so
 * mobile back / swipe-back closes the panel without leaving the current browse route.
 *
 * Does not call navigate(-1) in effect cleanup (avoids React Strict Mode + router races).
 */
export function useCardDetailHistory(
  open: boolean,
  onClose: () => void,
  stateKey: string = CARD_DETAIL_STATE_KEY,
): { close: () => void } {
  const navigate = useNavigate();
  const location = useLocation();
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;
  const locationRef = useRef(location);
  locationRef.current = location;

  const controllerRef = useRef<ReturnType<typeof createCardDetailHistoryController> | null>(null);
  if (!controllerRef.current) {
    controllerRef.current = createCardDetailHistoryController(
      navigate,
      () => onCloseRef.current(),
      stateKey,
    );
  }

  const controller = controllerRef.current;

  useEffect(() => {
    if (!open) {
      controller.reset();
      return undefined;
    }

    controller.attach(locationRef.current.state as object | null);
    return () => {
      controller.detach();
    };
  }, [open, stateKey, controller]);

  const close = useCallback(() => {
    controller.close();
  }, [controller]);

  return { close };
}
