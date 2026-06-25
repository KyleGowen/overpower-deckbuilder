import { useCardDetailHistory } from './useCardDetailHistory';
import { DECK_CARD_DETAIL_STATE_KEY } from './cardDetailHistoryController';

export { DECK_CARD_DETAIL_STATE_KEY };

/**
 * Deck editor wrapper — same history behavior as {@link useCardDetailHistory}.
 */
export function useDeckCardDetailHistory(
  open: boolean,
  onClose: () => void,
): { close: () => void } {
  return useCardDetailHistory(open, onClose, DECK_CARD_DETAIL_STATE_KEY);
}
