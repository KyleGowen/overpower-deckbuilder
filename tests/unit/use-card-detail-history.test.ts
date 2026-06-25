/**
 * @jest-environment jsdom
 */
import {
  CARD_DETAIL_STATE_KEY,
  DECK_CARD_DETAIL_STATE_KEY,
  createCardDetailHistoryController,
} from '../../frontend/src/lib/layout/cardDetailHistoryController';

describe('createCardDetailHistoryController', () => {
  const onClose = jest.fn();
  let navigate: jest.Mock;

  beforeEach(() => {
    navigate = jest.fn();
    onClose.mockReset();
  });

  it('pushes a history entry when attach runs', () => {
    const controller = createCardDetailHistoryController(navigate, onClose, CARD_DETAIL_STATE_KEY);
    controller.attach({ existing: true });

    expect(navigate).toHaveBeenCalledWith('.', {
      replace: false,
      state: { existing: true, [CARD_DETAIL_STATE_KEY]: true },
    });
    controller.detach();
  });

  it('does not push again when attach is called twice', () => {
    const controller = createCardDetailHistoryController(navigate, onClose, CARD_DETAIL_STATE_KEY);
    controller.attach(null);
    navigate.mockClear();
    controller.attach(null);
    expect(navigate).not.toHaveBeenCalled();
    controller.detach();
  });

  it('closes on popstate without navigating back again', () => {
    const controller = createCardDetailHistoryController(navigate, onClose, CARD_DETAIL_STATE_KEY);
    controller.attach(null);
    navigate.mockClear();

    window.dispatchEvent(new PopStateEvent('popstate'));

    expect(onClose).toHaveBeenCalledTimes(1);
    expect(navigate).not.toHaveBeenCalled();
    controller.detach();
  });

  it('manual close calls onClose then navigate(-1)', () => {
    const controller = createCardDetailHistoryController(navigate, onClose, CARD_DETAIL_STATE_KEY);
    controller.attach(null);
    navigate.mockClear();
    onClose.mockClear();

    controller.close();

    expect(onClose).toHaveBeenCalledTimes(1);
    expect(navigate).toHaveBeenCalledWith(-1);
    controller.detach();
  });

  it('reset clears active state without closing', () => {
    const controller = createCardDetailHistoryController(navigate, onClose, CARD_DETAIL_STATE_KEY);
    controller.attach(null);
    controller.reset();
    navigate.mockClear();
    onClose.mockClear();

    window.dispatchEvent(new PopStateEvent('popstate'));

    expect(onClose).not.toHaveBeenCalled();
    expect(navigate).not.toHaveBeenCalled();
    controller.detach();
  });

  it('detach removes popstate listener', () => {
    const controller = createCardDetailHistoryController(navigate, onClose, CARD_DETAIL_STATE_KEY);
    controller.attach(null);
    controller.detach();
    onClose.mockClear();

    window.dispatchEvent(new PopStateEvent('popstate'));

    expect(onClose).not.toHaveBeenCalled();
  });

  it('re-attaches popstate listener after detach without double push', () => {
    const controller = createCardDetailHistoryController(navigate, onClose, CARD_DETAIL_STATE_KEY);
    controller.attach(null);
    controller.detach();
    navigate.mockClear();
    onClose.mockClear();

    controller.attach(null);
    expect(navigate).not.toHaveBeenCalled();

    window.dispatchEvent(new PopStateEvent('popstate'));
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});

describe('card detail history state keys', () => {
  it('exports collection/dbv and deck state key constants', () => {
    expect(CARD_DETAIL_STATE_KEY).toBe('cardDetailOpen');
    expect(DECK_CARD_DETAIL_STATE_KEY).toBe('deckCardDetail');
  });
});
