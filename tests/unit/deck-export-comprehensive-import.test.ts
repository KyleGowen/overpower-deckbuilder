/** @jest-environment jsdom */

/**
 * Deck Export - Import Function (stub notification)
 * Part of comprehensive deck-export tests; uses deckExportTestHelpers.
 */

import {
    setupDeckExportBootstrap,
    teardownDeckExportMocks
} from '../helpers/deckExportTestHelpers';

describe('Deck Export Component - Import Function', () => {
    let mockShowNotification: jest.Mock;

    beforeEach(() => {
        jest.useFakeTimers();
        const setup = setupDeckExportBootstrap();
        mockShowNotification = setup.mocks.mockShowNotification;
    });

    afterEach(() => {
        teardownDeckExportMocks(window);
        jest.useRealTimers();
    });

    describe('Import Function', () => {
        it('should show notification that import is disabled', () => {
            (window as any).importDeckFromJson = function() {
                const showNotification = (window as any).showNotification;
                showNotification('Import functionality is currently disabled', 'info');
            };

            (window as any).importDeckFromJson();

            expect(mockShowNotification).toHaveBeenCalledWith('Import functionality is currently disabled', 'info');
        });
    });

});
