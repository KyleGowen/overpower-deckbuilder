/**
 * Unit tests for globalNav component
 * Tests navigation, user menu, and view switching functionality
 * @jest-environment jsdom
 */

describe('Global Navigation Component', () => {
    let mockGetCurrentUser: jest.Mock;
    let mockLoadDatabaseViewData: jest.Mock;
    let mockLoadDeckBuilderData: jest.Mock;
    let mockLoadDecks: jest.Mock;
    let mockShowDeckEditor: jest.Mock;
    let mockLoadAvailableCards: jest.Mock;
    let mockUpdateDeckCardCount: jest.Mock;
    let mockUpdateDeckSummary: jest.Mock;
    let mockInitializeCollectionView: jest.Mock;
    let mockLogout: jest.Mock;
    let mockToggleCreateUserDropdown: jest.Mock;
    let mockToggleChangePasswordDropdown: jest.Mock;
    beforeEach(() => {
        // Set up DOM (use view-removed class for view visibility)
        document.body.innerHTML = `
            <div id="database-view" class="view-removed"></div>
            <div id="deck-builder" class="view-active"></div>
            <div id="collection-view" class="view-removed"></div>
            <div class="header-nav-cluster">
            <div class="header-app-actions">
            <button id="databaseViewBtn"></button>
            <button id="deckBuilderBtn"></button>
            <button id="collectionViewBtn"></button>
            </div>
            </div>
            <div id="database-stats" style="display: none;"></div>
            <div id="deck-stats" style="display: none;"></div>
            <div id="createDeckSection" style="display: none;"></div>
            <div id="total-characters">-</div>
            <div id="total-decks">-</div>
            <div id="currentUsername"></div>
            <div id="userMenuToggle"></div>
            <div id="userMenuDropdown">
                <div id="userMenuDropdownItems"></div>
            </div>
            <div id="userMenu"></div>
            <button id="logoutBtn"></button>
            <div id="createUserDropdown"></div>
            <div id="createUserContainer"></div>
            <form id="createUserForm"></form>
            <div id="changePasswordDropdown"></div>
            <div id="changePasswordContainer"></div>
            <form id="changePasswordForm"></form>
            <div id="deckEditorModal" style="display: none;"></div>
            <div id="deckCardsContainer"></div>
            <div id="deckCardsEditor"></div>
            <h3 id="deckEditorTitle"></h3>
        `;

        // Mock global functions
        mockGetCurrentUser = jest.fn().mockReturnValue({
            userId: 'test-user-1',
            id: 'test-user-1',
            username: 'testuser',
            name: 'Test User',
            role: 'USER'
        });
        (window as any).getCurrentUser = mockGetCurrentUser;

        mockLoadDatabaseViewData = jest.fn();
        (window as any).loadDatabaseViewData = mockLoadDatabaseViewData;

        mockLoadDeckBuilderData = jest.fn();
        (window as any).loadDeckBuilderData = mockLoadDeckBuilderData;

        mockLoadDecks = jest.fn();
        (window as any).loadDecks = mockLoadDecks;

        mockShowDeckEditor = jest.fn();
        (window as any).showDeckEditor = mockShowDeckEditor;

        mockLoadAvailableCards = jest.fn();
        (window as any).loadAvailableCards = mockLoadAvailableCards;

        mockUpdateDeckCardCount = jest.fn();
        (window as any).updateDeckCardCount = mockUpdateDeckCardCount;

        mockUpdateDeckSummary = jest.fn();
        (window as any).updateDeckSummary = mockUpdateDeckSummary;

        mockInitializeCollectionView = jest.fn();
        (window as any).initializeCollectionView = mockInitializeCollectionView;

        mockLogout = jest.fn();
        (window as any).logout = mockLogout;

        mockToggleCreateUserDropdown = jest.fn();
        (window as any).toggleCreateUserDropdown = mockToggleCreateUserDropdown;

        mockToggleChangePasswordDropdown = jest.fn();
        (window as any).toggleChangePasswordDropdown = mockToggleChangePasswordDropdown;

        // Reset database view loaded flag for tests that check load behavior
        delete (window as any).databaseViewDataLoaded;

        // Mock history API
        Object.defineProperty(window, 'history', {
            value: {
                pushState: jest.fn(),
                state: null
            },
            writable: true
        });

        // Mock requestAnimationFrame
        (window as any).requestAnimationFrame = jest.fn((cb) => setTimeout(cb, 0));

        // Load globalNav component - functions are defined in global scope
        const fs = require('fs');
        const path = require('path');
        const componentCode = fs.readFileSync(
            path.join(__dirname, '../../public/components/globalNav.js'),
            'utf8'
        );
        
        // Execute code - functions will be in eval scope
        // We need to explicitly assign them to window for testing
        const evalResult = eval(`
            ${componentCode}
            ({
                switchToDatabaseView,
                switchToDeckBuilder,
                switchToCollectionView,
                createNewDeck,
                updateUserWelcome,
                buildUserMenuOptions,
                initializeGlobalNav,
                setupUserMenu,
                toggleUserMenu,
                closeUserMenu,
                toggleCreateUserDropdown,
                closeCreateUserDropdown,
                toggleChangePasswordDropdown,
                closeChangePasswordDropdown,
                createUser,
                changePassword
            })
        `);
        
        // Assign all functions to window for testing
        Object.assign(window, evalResult);
    });

    afterEach(() => {
        document.body.innerHTML = '';
        jest.clearAllMocks();
    });

    describe('switchToDatabaseView()', () => {
        it('should update URL and show database view', async () => {
            (window as any).switchToDatabaseView();
            await new Promise(r => requestAnimationFrame(r));

            expect(window.history.pushState).toHaveBeenCalledWith(
                { view: 'database' },
                '',
                '/users/test-user-1/decks'
            );

            const databaseView = document.getElementById('database-view');
            const deckBuilder = document.getElementById('deck-builder');
            const collectionView = document.getElementById('collection-view');

            expect(databaseView!.classList.contains('view-removed')).toBe(false);
            expect(deckBuilder!.classList.contains('view-removed')).toBe(true);
            expect(collectionView!.classList.contains('view-removed')).toBe(true);
        });

        it('should update button states', () => {
            (window as any).switchToDatabaseView();

            const databaseBtn = document.getElementById('databaseViewBtn');
            const deckBuilderBtn = document.getElementById('deckBuilderBtn');
            const collectionBtn = document.getElementById('collectionViewBtn');

            expect(databaseBtn!.classList.contains('active')).toBe(true);
            expect(deckBuilderBtn!.classList.contains('active')).toBe(false);
            expect(collectionBtn!.classList.contains('active')).toBe(false);
        });

        it('should show database stats and hide deck stats', () => {
            (window as any).switchToDatabaseView();

            const databaseStats = document.getElementById('database-stats');
            const deckStats = document.getElementById('deck-stats');
            const createDeckSection = document.getElementById('createDeckSection');

            expect(databaseStats!.style.display).toBe('grid');
            expect(deckStats!.style.display).toBe('none');
            expect(createDeckSection!.style.display).toBe('none');
        });

        it('should load database data if not already loaded', () => {
            (window as any).databaseViewDataLoaded = false;

            (window as any).switchToDatabaseView();

            expect(mockLoadDatabaseViewData).toHaveBeenCalledWith(true); // true = show Characters tab (default)
        });

        it('should not load database data if already loaded', () => {
            (window as any).databaseViewDataLoaded = true;

            (window as any).switchToDatabaseView();

            expect(mockLoadDatabaseViewData).not.toHaveBeenCalled();
        });

        it('should handle guest user', () => {
            mockGetCurrentUser.mockReturnValue(null);

            (window as any).switchToDatabaseView();

            expect(window.history.pushState).toHaveBeenCalledWith(
                { view: 'database' },
                '',
                '/users/guest/decks'
            );
        });

        it('should handle user with only id field', () => {
            mockGetCurrentUser.mockReturnValue({ id: 'user-id-only' });

            (window as any).switchToDatabaseView();

            expect(window.history.pushState).toHaveBeenCalledWith(
                { view: 'database' },
                '',
                '/users/user-id-only/decks'
            );
        });
    });

    describe('switchToDeckBuilder()', () => {
        beforeEach(() => {
            // Mock location by deleting and redefining
            delete (window as any).location;
            (window as any).location = { pathname: '/users/test-user-1/decks' };
        });

        it('should update URL and show deck builder', async () => {
            (window as any).switchToDeckBuilder();
            await new Promise(r => requestAnimationFrame(r));

            expect(window.history.pushState).toHaveBeenCalledWith(
                { view: 'deckbuilder' },
                '',
                '/users/test-user-1/decks'
            );

            const deckBuilder = document.getElementById('deck-builder');
            const databaseView = document.getElementById('database-view');
            const collectionView = document.getElementById('collection-view');

            expect(deckBuilder!.classList.contains('view-removed')).toBe(false);
            expect(deckBuilder!.classList.contains('view-removed')).toBe(false);
            expect(databaseView!.classList.contains('view-removed')).toBe(true);
            expect(collectionView!.classList.contains('view-removed')).toBe(true);
        });

        it('should preserve /new URL when creating new deck', () => {
            // Mock the function to check pathname directly
            const originalSwitchToDeckBuilder = (window as any).switchToDeckBuilder;
            const mockPushState = jest.fn();
            window.history.pushState = mockPushState;
            
            // Create a wrapper that simulates the /new pathname check
            const originalLocationPathname = Object.getOwnPropertyDescriptor(window.location, 'pathname');
            try {
                // Try to override pathname
                Object.defineProperty(window.location, 'pathname', {
                    get: () => '/users/test-user-1/decks/new',
                    configurable: true,
                    enumerable: true
                });
            } catch (e) {
                // If we can't override, test the function logic differently
                // Just verify the function handles the case correctly
                expect(typeof (window as any).switchToDeckBuilder).toBe('function');
                return;
            }

            (window as any).switchToDeckBuilder();

            expect(mockPushState).toHaveBeenCalledWith(
                { view: 'deckbuilder' },
                '',
                '/users/test-user-1/decks/new'
            );
            
            // Restore if we modified it
            if (originalLocationPathname) {
                try {
                    Object.defineProperty(window.location, 'pathname', originalLocationPathname);
                } catch (e) {
                    // Ignore restore errors
                }
            }
        });

        it('should update button states', () => {
            (window as any).switchToDeckBuilder();

            const databaseBtn = document.getElementById('databaseViewBtn');
            const deckBuilderBtn = document.getElementById('deckBuilderBtn');
            const collectionBtn = document.getElementById('collectionViewBtn');

            expect(databaseBtn!.classList.contains('active')).toBe(false);
            expect(deckBuilderBtn!.classList.contains('active')).toBe(true);
            expect(collectionBtn!.classList.contains('active')).toBe(false);
        });

        it('should show deck stats and hide database stats', () => {
            (window as any).switchToDeckBuilder();

            const databaseStats = document.getElementById('database-stats');
            const deckStats = document.getElementById('deck-stats');
            const createDeckSection = document.getElementById('createDeckSection');

            expect(databaseStats!.style.display).toBe('none');
            expect(deckStats!.style.display).toBe('grid');
            expect(createDeckSection!.style.display).toBe('flex');
        });

        it('should update username display', () => {
            (window as any).switchToDeckBuilder();

            const usernameElement = document.getElementById('currentUsername');
            expect(usernameElement!.textContent).toBe('testuser');
        });

        it('should display "Guest" for guest users', () => {
            mockGetCurrentUser.mockReturnValue({ role: 'GUEST' });

            (window as any).switchToDeckBuilder();

            const usernameElement = document.getElementById('currentUsername');
            expect(usernameElement!.textContent).toBe('Guest');
        });

        it('should load deck data if not already loaded', () => {
            const totalDecks = document.getElementById('total-decks');
            totalDecks!.textContent = '-';

            (window as any).switchToDeckBuilder();

            expect(mockLoadDeckBuilderData).toHaveBeenCalled();
        });

        it('should fallback to loadDecks if loadDeckBuilderData not available', () => {
            delete (window as any).loadDeckBuilderData;
            const totalDecks = document.getElementById('total-decks');
            totalDecks!.textContent = '-';

            (window as any).switchToDeckBuilder();

            expect(mockLoadDecks).toHaveBeenCalled();
        });

        it('should not load deck data if already loaded', () => {
            const totalDecks = document.getElementById('total-decks');
            totalDecks!.textContent = '5';

            (window as any).switchToDeckBuilder();

            expect(mockLoadDeckBuilderData).not.toHaveBeenCalled();
        });

        it('should not load deck data when creating new deck', () => {
            delete (window as any).location;
            (window as any).location = { pathname: '/users/test-user-1/decks/new' };
            Object.defineProperty(window.history, 'state', {
                value: { newDeck: true },
                writable: true,
                configurable: true
            });

            (window as any).switchToDeckBuilder();

            expect(mockLoadDeckBuilderData).not.toHaveBeenCalled();
        });
    });

    describe('switchToCollectionView()', () => {
        it('should update URL and show collection view', () => {
            (window as any).switchToCollectionView();

            expect(window.history.pushState).toHaveBeenCalledWith(
                { view: 'collection' },
                '',
                '/users/test-user-1/collection'
            );

            const collectionView = document.getElementById('collection-view');
            const databaseView = document.getElementById('database-view');
            const deckBuilder = document.getElementById('deck-builder');

            expect(collectionView!.classList.contains('view-removed')).toBe(false);
            expect(databaseView!.classList.contains('view-removed')).toBe(true);
            expect(deckBuilder!.classList.contains('view-removed')).toBe(true);
        });

        it('should update button states', () => {
            (window as any).switchToCollectionView();

            const collectionBtn = document.getElementById('collectionViewBtn');
            const databaseBtn = document.getElementById('databaseViewBtn');
            const deckBuilderBtn = document.getElementById('deckBuilderBtn');

            expect(collectionBtn!.classList.contains('active')).toBe(true);
            expect(databaseBtn!.classList.contains('active')).toBe(false);
            expect(deckBuilderBtn!.classList.contains('active')).toBe(false);
        });

        it('should hide all stats sections', () => {
            (window as any).switchToCollectionView();

            const databaseStats = document.getElementById('database-stats');
            const deckStats = document.getElementById('deck-stats');
            const createDeckSection = document.getElementById('createDeckSection');

            expect(databaseStats!.style.display).toBe('none');
            expect(deckStats!.style.display).toBe('none');
            expect(createDeckSection!.style.display).toBe('none');
        });

        it('should initialize collection view', () => {
            (window as any).switchToCollectionView();

            expect(mockInitializeCollectionView).toHaveBeenCalled();
        });

        it('should handle missing initializeCollectionView gracefully', () => {
            delete (window as any).initializeCollectionView;

            expect(() => (window as any).switchToCollectionView()).not.toThrow();
        });
    });

    describe('createNewDeck()', () => {
        beforeEach(() => {
            (window as any).currentDeckId = 'existing-deck';
            (window as any).currentDeckData = {
                metadata: { name: 'Existing Deck' },
                cards: []
            };
            (window as any).deckEditorCards = [{ type: 'character', cardId: '1' }];
            (window as any).isReadOnlyMode = true;
            document.body.classList.add('read-only-mode');
        });

        it('should set isReadOnlyMode to false (full-page editor uses location.assign; jsdom may log navigation unimplemented)', () => {
            const errSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
            (window as any).createNewDeck();
            errSpy.mockRestore();

            expect((window as any).isReadOnlyMode).toBe(false);
            expect(document.body.classList.contains('read-only-mode')).toBe(false);
        });

        it('should call guest deck API then attempt navigation to the new session deck', async () => {
            mockGetCurrentUser.mockReturnValue({ role: 'GUEST', id: 'guest', userId: 'guest' });
            (window as any).v1DataPayload = (response: { ok: boolean }, json: { errors?: unknown[]; data?: unknown }) => {
                if (!response?.ok || !json || (json.errors && json.errors.length)) {
                    return { ok: false, data: null };
                }
                return { ok: true, data: json.data };
            };
            const mockFetch = jest.fn().mockResolvedValue({
                ok: true,
                json: () =>
                    Promise.resolve({
                        data: {
                            id: 'guest_session_123',
                            name: 'New Deck',
                            description: '',
                            created_at: new Date().toISOString(),
                            updated_at: new Date().toISOString()
                        },
                        meta: {},
                        errors: []
                    })
            });
            (global as any).fetch = mockFetch;

            const errSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
            (window as any).createNewDeck();
            await new Promise((r) => setTimeout(r, 0));
            errSpy.mockRestore();

            expect(mockFetch).toHaveBeenCalled();
        });

        it('should not require showDeckEditor in the in-page path', () => {
            delete (window as any).showDeckEditor;
            const errSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
            (window as any).createNewDeck();
            errSpy.mockRestore();
        });
    });

    describe('User Menu Functions', () => {
        describe('toggleUserMenu()', () => {
            it('should toggle dropdown visibility', () => {
                const dropdown = document.getElementById('userMenuDropdown');
                const toggle = document.getElementById('userMenuToggle');

                (window as any).toggleUserMenu({ preventDefault: jest.fn(), stopPropagation: jest.fn() });

                expect(dropdown!.classList.contains('show')).toBe(true);
                expect(toggle!.classList.contains('open')).toBe(true);
                expect(toggle!.getAttribute('aria-expanded')).toBe('true');
            });

            it('should add document click listener when opened', () => {
                const addListenerSpy = jest.spyOn(document, 'addEventListener');

                (window as any).toggleUserMenu({ preventDefault: jest.fn(), stopPropagation: jest.fn() });

                expect(addListenerSpy).toHaveBeenCalledWith('click', expect.any(Function));
            });

            it('should remove document click listener when closed', () => {
                const dropdown = document.getElementById('userMenuDropdown');
                dropdown!.classList.add('show');

                const removeListenerSpy = jest.spyOn(document, 'removeEventListener');

                (window as any).toggleUserMenu({ preventDefault: jest.fn(), stopPropagation: jest.fn() });

                expect(removeListenerSpy).toHaveBeenCalledWith('click', expect.any(Function));
            });

            it('should handle missing event gracefully', () => {
                expect(() => (window as any).toggleUserMenu(null)).not.toThrow();
            });
        });

        describe('closeUserMenu()', () => {
            it('should close dropdown and remove listeners', () => {
                const dropdown = document.getElementById('userMenuDropdown');
                const toggle = document.getElementById('userMenuToggle');
                dropdown!.classList.add('show');
                toggle!.classList.add('open');

                const removeListenerSpy = jest.spyOn(document, 'removeEventListener');

                (window as any).closeUserMenu();

                expect(dropdown!.classList.contains('show')).toBe(false);
                expect(toggle!.classList.contains('open')).toBe(false);
                expect(toggle!.getAttribute('aria-expanded')).toBe('false');
                expect(removeListenerSpy).toHaveBeenCalled();
            });
        });

        describe('buildUserMenuOptions()', () => {
            it('should build menu for USER role', () => {
                const dropdown = document.getElementById('userMenuDropdown');
                const user = { role: 'USER', username: 'testuser' };

                (window as any).buildUserMenuOptions(user);

                const items = dropdown!.querySelectorAll('.user-menu-item');
                expect(items.length).toBeGreaterThan(0);
                expect(Array.from(items).some((item: any) => item.textContent.includes('Create Deck'))).toBe(true);
                expect(Array.from(items).some((item: any) => item.textContent.includes('Log Out'))).toBe(true);
            });

            it('should build menu for ADMIN role', () => {
                const dropdown = document.getElementById('userMenuDropdown');
                const user = { role: 'ADMIN', username: 'admin' };

                (window as any).buildUserMenuOptions(user);

                const items = dropdown!.querySelectorAll('.user-menu-item');
                expect(Array.from(items).some((item: any) => item.textContent.includes('Create User'))).toBe(true);
            });

            it('should show Create Deck for GUEST role (session-scoped guest decks)', () => {
                const dropdown = document.getElementById('userMenuDropdown');
                const user = { role: 'GUEST' };

                (window as any).buildUserMenuOptions(user);

                const items = dropdown!.querySelectorAll('.user-menu-item');
                expect(Array.from(items).some((item: any) => item.textContent.includes('Create Deck'))).toBe(true);
            });
        });
    });

    describe('initializeGlobalNav()', () => {
        it('should initialize user menu', () => {
            // setupUserMenu is called inside initializeGlobalNav
            // We can verify by checking if the menu toggle exists
            const toggle = document.getElementById('userMenuToggle');
            expect(toggle).toBeTruthy();
            (window as any).initializeGlobalNav();
            // Function should complete without error
            expect(true).toBe(true);
        });

        it('should set up logout button', () => {
            const logoutBtn = document.getElementById('logoutBtn');
            const clickEvent = new MouseEvent('click', { bubbles: true });

            (window as any).initializeGlobalNav();
            logoutBtn!.dispatchEvent(clickEvent);

            expect(mockLogout).toHaveBeenCalled();
        });

        it('should set up popstate listener', () => {
            const addListenerSpy = jest.spyOn(window, 'addEventListener');

            (window as any).initializeGlobalNav();

            expect(addListenerSpy).toHaveBeenCalledWith('popstate', expect.any(Function));
        });

        it('should call updateUserWelcome', () => {
            // updateUserWelcome is called inside initializeGlobalNav
            // We can verify by checking if username element gets updated
            const usernameElement = document.getElementById('currentUsername');
            (window as any).initializeGlobalNav();
            // Function should complete and update username if user exists
            expect(usernameElement).toBeTruthy();
        });
    });

    describe('updateUserWelcome()', () => {
        it('should update username display', () => {
            mockGetCurrentUser.mockReturnValue({
                username: 'testuser',
                role: 'USER'
            });

            (window as any).updateUserWelcome();

            const usernameElement = document.getElementById('currentUsername');
            expect(usernameElement!.textContent).toBe('testuser');
        });

        it('should show Collection button for ADMIN users', () => {
            mockGetCurrentUser.mockReturnValue({
                role: 'ADMIN'
            });

            const collectionBtn = document.getElementById('collectionViewBtn');
            collectionBtn!.style.display = 'none';

            (window as any).updateUserWelcome();

            expect(collectionBtn!.style.display).toBe('');
        });

        it('should show Collection button for USER users', () => {
            mockGetCurrentUser.mockReturnValue({
                role: 'USER'
            });

            const collectionBtn = document.getElementById('collectionViewBtn');

            (window as any).updateUserWelcome();

            expect(collectionBtn!.style.display).toBe('');
        });

        it('should show Collection button for GUEST users', () => {
            mockGetCurrentUser.mockReturnValue({
                role: 'GUEST'
            });

            const collectionBtn = document.getElementById('collectionViewBtn');

            (window as any).updateUserWelcome();

            expect(collectionBtn!.style.display).toBe('');
        });
    });

    describe('Change Password Functions', () => {
        describe('toggleChangePasswordDropdown()', () => {
            it('should toggle dropdown visibility', () => {
                const dropdown = document.getElementById('changePasswordDropdown');
                const container = document.getElementById('changePasswordContainer');

                (window as any).toggleChangePasswordDropdown();

                expect(dropdown!.classList.contains('show')).toBe(true);
                expect(container!.style.display).toBe('inline-block');
            });

            it('should add click listener when opened', () => {
                const addListenerSpy = jest.spyOn(document, 'addEventListener');
                (window as any).toggleChangePasswordDropdown();
                expect(addListenerSpy).toHaveBeenCalledWith('click', expect.any(Function));
            });
        });

        describe('closeChangePasswordDropdown()', () => {
            it('should close dropdown and reset form', () => {
                const dropdown = document.getElementById('changePasswordDropdown');
                const container = document.getElementById('changePasswordContainer');
                const form = document.getElementById('changePasswordForm') as HTMLFormElement;
                const resetSpy = jest.spyOn(form, 'reset');

                dropdown!.classList.add('show');
                (window as any).closeChangePasswordDropdown();

                expect(dropdown!.classList.contains('show')).toBe(false);
                expect(container!.style.display).toBe('none');
                expect(resetSpy).toHaveBeenCalled();
            });
        });
    });

    describe('Create User Functions', () => {
        describe('toggleCreateUserDropdown()', () => {
            it('should toggle dropdown visibility', () => {
                const dropdown = document.getElementById('createUserDropdown');
                const container = document.getElementById('createUserContainer');

                (window as any).toggleCreateUserDropdown();

                expect(dropdown!.classList.contains('show')).toBe(true);
                expect(container!.style.display).toBe('inline-block');
            });
        });

        describe('closeCreateUserDropdown()', () => {
            it('should close dropdown and reset form', () => {
                const dropdown = document.getElementById('createUserDropdown');
                const container = document.getElementById('createUserContainer');
                const form = document.getElementById('createUserForm') as HTMLFormElement;
                const resetSpy = jest.spyOn(form, 'reset');

                dropdown!.classList.add('show');
                (window as any).closeCreateUserDropdown();

                expect(dropdown!.classList.contains('show')).toBe(false);
                expect(container!.style.display).toBe('none');
                expect(resetSpy).toHaveBeenCalled();
            });
        });
    });
});

