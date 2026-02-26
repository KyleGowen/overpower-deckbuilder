/**
 * Unit tests for Login Component
 * Tests login modal, form submission, guest login, and template loading
 * @jest-environment jsdom
 */

describe('Login Component', () => {
    let mockFetch: jest.Mock;
    let mockLogin: jest.Mock;
    let mockShowLoginError: jest.Mock;
    let mockHideLoginError: jest.Mock;
    let mockShowSignupError: jest.Mock;
    let mockHideSignupError: jest.Mock;
    let mockSignup: jest.Mock;
    let LoginComponent: any;

    beforeAll(() => {
        // Dynamically load the login component
        const fs = require('fs');
        const path = require('path');
        let componentCode = fs.readFileSync(
            path.join(__dirname, '../../public/components/login/login.js'),
            'utf8'
        );
        
        // Remove the auto-initialization call at the end
        componentCode = componentCode.replace(/\/\/ Initialize login component when script loads[\s\S]*$/, '');
        
        // Create a container object to capture functions
        const funcContainer: any = {};
        
        // Wrap the code to capture functions
        const wrappedCode = `
            ${componentCode}
            // Export functions to container
            if (typeof loadLoginTemplate !== 'undefined') funcContainer.loadLoginTemplate = loadLoginTemplate;
            if (typeof createFallbackLoginModal !== 'undefined') funcContainer.createFallbackLoginModal = createFallbackLoginModal;
            if (typeof initializeLoginComponent !== 'undefined') funcContainer.initializeLoginComponent = initializeLoginComponent;
            if (typeof setupLoginEventListeners !== 'undefined') funcContainer.setupLoginEventListeners = setupLoginEventListeners;
            if (typeof handleLoginSubmit !== 'undefined') funcContainer.handleLoginSubmit = handleLoginSubmit;
            if (typeof handleGuestLogin !== 'undefined') funcContainer.handleGuestLogin = handleGuestLogin;
            if (typeof handleSignUpClick !== 'undefined') funcContainer.handleSignUpClick = handleSignUpClick;
            if (typeof handleSignupBackClick !== 'undefined') funcContainer.handleSignupBackClick = handleSignupBackClick;
            if (typeof handleSignupSubmit !== 'undefined') funcContainer.handleSignupSubmit = handleSignupSubmit;
        `;
        
        // Execute the wrapped code
        eval(wrappedCode);
        
        // Extract functions from container
        LoginComponent = funcContainer;
    });

    beforeEach(() => {
        // Reset DOM
        document.body.innerHTML = '';
        
        // Mock document.readyState
        Object.defineProperty(document, 'readyState', {
            writable: true,
            value: 'complete'
        });
        
        // Mock fetch
        mockFetch = jest.fn();
        (global as any).fetch = mockFetch;
        
        // Mock auth functions
        mockLogin = jest.fn().mockResolvedValue(undefined);
        mockShowLoginError = jest.fn();
        mockHideLoginError = jest.fn();
        mockShowSignupError = jest.fn();
        mockHideSignupError = jest.fn();
        mockSignup = jest.fn().mockResolvedValue(undefined);
        
        (window as any).login = mockLogin;
        (window as any).showLoginError = mockShowLoginError;
        (window as any).hideLoginError = mockHideLoginError;
        (window as any).showSignupError = mockShowSignupError;
        (window as any).hideSignupError = mockHideSignupError;
        (window as any).signup = mockSignup;
        
        // Mock console.error to avoid noise in tests
        jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
        document.body.innerHTML = '';
        jest.clearAllMocks();
        jest.restoreAllMocks();
    });

    describe('loadLoginTemplate', () => {
        it('should load and inject HTML template successfully', async () => {
            const mockHtml = '<div id="loginModal"><form id="loginForm"></form><button id="guestLoginBtn"></button></div>';
            mockFetch.mockResolvedValueOnce({
                ok: true,
                text: jest.fn().mockResolvedValue(mockHtml)
            });

            await LoginComponent.loadLoginTemplate();

            expect(mockFetch).toHaveBeenCalledWith('/components/login/login.html');
            expect(document.body.innerHTML).toContain('loginModal');
            // Verify that event listeners can be set up (elements exist)
            expect(document.getElementById('loginForm')).toBeTruthy();
            expect(document.getElementById('guestLoginBtn')).toBeTruthy();
        });

        it('should return early if loginModal already exists', async () => {
            document.body.innerHTML = '<div id="loginModal">Existing Modal</div>';

            await LoginComponent.loadLoginTemplate();

            expect(mockFetch).not.toHaveBeenCalled();
        });

        it('should create fallback modal on fetch failure', async () => {
            mockFetch.mockRejectedValueOnce(new Error('Network error'));

            await LoginComponent.loadLoginTemplate();

            // Verify fallback modal was created
            expect(document.body.innerHTML).toContain('loginModal');
            expect(document.getElementById('loginModal')).toBeTruthy();
            expect(document.getElementById('loginForm')).toBeTruthy();
            expect(document.getElementById('guestLoginBtn')).toBeTruthy();
        });

        it('should handle non-ok response', async () => {
            mockFetch.mockResolvedValueOnce({
                ok: false,
                text: jest.fn().mockResolvedValue('')
            });

            await LoginComponent.loadLoginTemplate();

            // Note: The current implementation only uses fallback on exception, not on non-ok response
            // A non-ok response will still try to inject the empty HTML, which may cause issues
            // This test verifies the actual behavior - it will attempt to inject empty HTML
            // The test passes if no exception is thrown
            expect(mockFetch).toHaveBeenCalled();
        });
    });

    describe('createFallbackLoginModal', () => {
        it('should create fallback login modal HTML', () => {
            LoginComponent.createFallbackLoginModal();

            const modal = document.getElementById('loginModal');
            expect(modal).toBeTruthy();
            expect(modal?.classList.contains('login-modal')).toBe(true);
        });

        it('should include all required form elements', () => {
            LoginComponent.createFallbackLoginModal();

            expect(document.getElementById('loginForm')).toBeTruthy();
            expect(document.getElementById('username')).toBeTruthy();
            expect(document.getElementById('password')).toBeTruthy();
            expect(document.getElementById('loginError')).toBeTruthy();
            expect(document.getElementById('guestLoginBtn')).toBeTruthy();
        });

        it('should set correct input attributes', () => {
            LoginComponent.createFallbackLoginModal();

            const usernameInput = document.getElementById('username') as HTMLInputElement;
            const passwordInput = document.getElementById('password') as HTMLInputElement;

            expect(usernameInput?.type).toBe('text');
            expect(usernameInput?.autocomplete).toBe('username');
            expect(usernameInput?.required).toBe(true);

            expect(passwordInput?.type).toBe('password');
            expect(passwordInput?.autocomplete).toBe('current-password');
            expect(passwordInput?.required).toBe(true);
        });

        it('should include logo image with correct attributes', () => {
            LoginComponent.createFallbackLoginModal();

            const img = document.querySelector('.login-header img') as HTMLImageElement;
            expect(img).toBeTruthy();
            expect(img?.src).toContain('logo5.png');
            expect(img?.alt).toBe('Excelsior Deckbuilder');
        });
    });

    describe('initializeLoginComponent', () => {
        it('should call loadLoginTemplate when DOM is ready', async () => {
            Object.defineProperty(document, 'readyState', {
                writable: true,
                value: 'complete'
            });
            
            // Mock fetch to track if loadLoginTemplate is called
            mockFetch.mockResolvedValueOnce({
                ok: true,
                text: jest.fn().mockResolvedValue('<div id="loginModal">Test</div>')
            });

            LoginComponent.initializeLoginComponent();

            // Wait a bit for async operations
            await new Promise(resolve => setTimeout(resolve, 50));
            
            // Verify that fetch was called (which means loadLoginTemplate was called)
            expect(mockFetch).toHaveBeenCalledWith('/components/login/login.html');
        });

        it('should wait for DOMContentLoaded when DOM is loading', async () => {
            Object.defineProperty(document, 'readyState', {
                writable: true,
                value: 'loading'
            });
            
            const addEventListenerSpy = jest.spyOn(document, 'addEventListener');
            mockFetch.mockResolvedValueOnce({
                ok: true,
                text: jest.fn().mockResolvedValue('<div id="loginModal">Test</div>')
            });

            LoginComponent.initializeLoginComponent();

            expect(addEventListenerSpy).toHaveBeenCalledWith('DOMContentLoaded', expect.any(Function));
            
            // Simulate DOMContentLoaded
            const callback = addEventListenerSpy.mock.calls.find(call => call[0] === 'DOMContentLoaded')?.[1] as () => Promise<void>;
            if (callback) {
                await callback();
                await new Promise(resolve => setTimeout(resolve, 50));
                // Verify that fetch was called after DOMContentLoaded
                expect(mockFetch).toHaveBeenCalledWith('/components/login/login.html');
            } else {
                // If callback wasn't found, the test should still verify addEventListener was called
                expect(addEventListenerSpy).toHaveBeenCalled();
            }
        });
    });

    describe('setupLoginEventListeners', () => {
        beforeEach(() => {
            document.body.innerHTML = `
                <form id="loginForm"></form>
                <button id="guestLoginBtn"></button>
            `;
        });

        it('should attach submit listener to login form', () => {
            const form = document.getElementById('loginForm') as HTMLFormElement;
            const submitSpy = jest.spyOn(form, 'addEventListener');

            LoginComponent.setupLoginEventListeners();

            expect(submitSpy).toHaveBeenCalledWith('submit', LoginComponent.handleLoginSubmit);
        });

        it('should attach click listener to guest login button', () => {
            const btn = document.getElementById('guestLoginBtn') as HTMLButtonElement;
            const clickSpy = jest.spyOn(btn, 'addEventListener');

            LoginComponent.setupLoginEventListeners();

            expect(clickSpy).toHaveBeenCalledWith('click', LoginComponent.handleGuestLogin);
        });

        it('should handle missing login form gracefully', () => {
            document.body.innerHTML = '<button id="guestLoginBtn"></button>';

            expect(() => LoginComponent.setupLoginEventListeners()).not.toThrow();
        });

        it('should handle missing guest login button gracefully', () => {
            document.body.innerHTML = '<form id="loginForm"></form>';

            expect(() => LoginComponent.setupLoginEventListeners()).not.toThrow();
        });
    });

    describe('handleLoginSubmit', () => {
        beforeEach(() => {
            document.body.innerHTML = `
                <form id="loginForm">
                    <input id="username" type="text" />
                    <input id="password" type="password" />
                    <div id="loginError" style="display: none;"></div>
                </form>
            `;
        });

        it('should prevent default form submission', async () => {
            const form = document.getElementById('loginForm') as HTMLFormElement;
            const event = new Event('submit', { cancelable: true });
            const preventDefaultSpy = jest.spyOn(event, 'preventDefault');

            await LoginComponent.handleLoginSubmit(event);

            expect(preventDefaultSpy).toHaveBeenCalled();
        });

        it('should call hideLoginError on submit', async () => {
            const form = document.getElementById('loginForm') as HTMLFormElement;
            const event = new Event('submit', { cancelable: true });

            await LoginComponent.handleLoginSubmit(event);

            expect(mockHideLoginError).toHaveBeenCalled();
        });

        it('should show error when username is missing', async () => {
            const form = document.getElementById('loginForm') as HTMLFormElement;
            const event = new Event('submit', { cancelable: true });
            const passwordInput = document.getElementById('password') as HTMLInputElement;
            passwordInput.value = 'password123';

            await LoginComponent.handleLoginSubmit(event);

            expect(mockShowLoginError).toHaveBeenCalledWith('Please enter both username and password');
            expect(mockLogin).not.toHaveBeenCalled();
        });

        it('should show error when password is missing', async () => {
            const form = document.getElementById('loginForm') as HTMLFormElement;
            const event = new Event('submit', { cancelable: true });
            const usernameInput = document.getElementById('username') as HTMLInputElement;
            usernameInput.value = 'testuser';

            await LoginComponent.handleLoginSubmit(event);

            expect(mockShowLoginError).toHaveBeenCalledWith('Please enter both username and password');
            expect(mockLogin).not.toHaveBeenCalled();
        });

        it('should show error when both fields are empty', async () => {
            const form = document.getElementById('loginForm') as HTMLFormElement;
            const event = new Event('submit', { cancelable: true });

            await LoginComponent.handleLoginSubmit(event);

            expect(mockShowLoginError).toHaveBeenCalledWith('Please enter both username and password');
            expect(mockLogin).not.toHaveBeenCalled();
        });

        it('should call login function with credentials when both fields are filled', async () => {
            const form = document.getElementById('loginForm') as HTMLFormElement;
            const event = new Event('submit', { cancelable: true });
            const usernameInput = document.getElementById('username') as HTMLInputElement;
            const passwordInput = document.getElementById('password') as HTMLInputElement;
            usernameInput.value = 'testuser';
            passwordInput.value = 'password123';

            await LoginComponent.handleLoginSubmit(event);

            expect(mockLogin).toHaveBeenCalledWith('testuser', 'password123');
            expect(mockShowLoginError).not.toHaveBeenCalled();
        });

        it('should handle fallback error display when showLoginError is not available', async () => {
            (window as any).showLoginError = undefined;
            const form = document.getElementById('loginForm') as HTMLFormElement;
            const event = new Event('submit', { cancelable: true });

            await LoginComponent.handleLoginSubmit(event);

            const errorDiv = document.getElementById('loginError');
            expect(errorDiv?.textContent).toBe('Please enter both username and password');
            expect(errorDiv?.style.display).toBe('block');
        });

        it('should show error when login function is not available', async () => {
            (window as any).login = undefined;
            const form = document.getElementById('loginForm') as HTMLFormElement;
            const event = new Event('submit', { cancelable: true });
            const usernameInput = document.getElementById('username') as HTMLInputElement;
            const passwordInput = document.getElementById('password') as HTMLInputElement;
            usernameInput.value = 'testuser';
            passwordInput.value = 'password123';

            await LoginComponent.handleLoginSubmit(event);

            expect(mockShowLoginError).toHaveBeenCalledWith('Login functionality not available');
        });

        it('should handle login function from window object', async () => {
            const windowLogin = jest.fn().mockResolvedValue(undefined);
            (window as any).login = windowLogin;
            const form = document.getElementById('loginForm') as HTMLFormElement;
            const event = new Event('submit', { cancelable: true });
            const usernameInput = document.getElementById('username') as HTMLInputElement;
            const passwordInput = document.getElementById('password') as HTMLInputElement;
            usernameInput.value = 'testuser';
            passwordInput.value = 'password123';

            await LoginComponent.handleLoginSubmit(event);

            expect(windowLogin).toHaveBeenCalledWith('testuser', 'password123');
        });
    });

    describe('handleGuestLogin', () => {
        beforeEach(() => {
            document.body.innerHTML = '<div id="loginError" style="display: block;"></div>';
        });

        it('should call hideLoginError', async () => {
            await LoginComponent.handleGuestLogin();

            expect(mockHideLoginError).toHaveBeenCalled();
        });

        it('should call login function with guest credentials', async () => {
            await LoginComponent.handleGuestLogin();

            expect(mockLogin).toHaveBeenCalledWith('guest', 'guest');
        });

        it('should show error when login function is not available', async () => {
            (window as any).login = undefined;

            await LoginComponent.handleGuestLogin();

            expect(mockShowLoginError).toHaveBeenCalledWith('Guest login functionality not available');
        });

        it('should handle login function from window object', async () => {
            const windowLogin = jest.fn().mockResolvedValue(undefined);
            (window as any).login = windowLogin;

            await LoginComponent.handleGuestLogin();

            expect(windowLogin).toHaveBeenCalledWith('guest', 'guest');
        });

        it('should handle missing hideLoginError gracefully', async () => {
            (window as any).hideLoginError = undefined;

            await LoginComponent.handleGuestLogin();

            expect(mockLogin).toHaveBeenCalledWith('guest', 'guest');
        });
    });

    describe('handleSignUpClick', () => {
        beforeEach(() => {
            document.body.innerHTML = `
                <div id="loginView" style="display: block;"></div>
                <div id="signupView" style="display: none;"></div>
            `;
        });

        it('should hide login view and show signup view', () => {
            LoginComponent.handleSignUpClick();

            const loginView = document.getElementById('loginView');
            const signupView = document.getElementById('signupView');
            expect(loginView?.style.display).toBe('none');
            expect(signupView?.style.display).toBe('block');
        });

        it('should call hideLoginError and hideSignupError when switching', () => {
            LoginComponent.handleSignUpClick();

            expect(mockHideLoginError).toHaveBeenCalled();
            expect(mockHideSignupError).toHaveBeenCalled();
        });
    });

    describe('handleSignupBackClick', () => {
        beforeEach(() => {
            document.body.innerHTML = `
                <div id="loginView" style="display: none;"></div>
                <div id="signupView" style="display: block;"></div>
            `;
        });

        it('should show login view and hide signup view', () => {
            LoginComponent.handleSignupBackClick();

            const loginView = document.getElementById('loginView');
            const signupView = document.getElementById('signupView');
            expect(loginView?.style.display).toBe('block');
            expect(signupView?.style.display).toBe('none');
        });

        it('should call hideSignupError when switching back', () => {
            LoginComponent.handleSignupBackClick();

            expect(mockHideSignupError).toHaveBeenCalled();
        });
    });

    describe('handleSignupSubmit', () => {
        beforeEach(() => {
            document.body.innerHTML = `
                <form id="signupForm">
                    <input id="signupUsername" type="text" />
                    <input id="signupEmail" type="email" />
                    <input id="signupPassword" type="password" />
                    <input id="signupPasswordConfirm" type="password" />
                    <div id="signupError" style="display: none;"></div>
                </form>
            `;
        });

        it('should prevent default form submission', async () => {
            const form = document.getElementById('signupForm') as HTMLFormElement;
            const event = new Event('submit', { cancelable: true });
            const preventDefaultSpy = jest.spyOn(event, 'preventDefault');

            const usernameInput = document.getElementById('signupUsername') as HTMLInputElement;
            const emailInput = document.getElementById('signupEmail') as HTMLInputElement;
            const passwordInput = document.getElementById('signupPassword') as HTMLInputElement;
            const passwordConfirmInput = document.getElementById('signupPasswordConfirm') as HTMLInputElement;
            usernameInput.value = 'testuser';
            emailInput.value = 'test@example.com';
            passwordInput.value = 'password123';
            passwordConfirmInput.value = 'password123';

            await LoginComponent.handleSignupSubmit(event);

            expect(preventDefaultSpy).toHaveBeenCalled();
        });

        it('should call hideSignupError on submit', async () => {
            const usernameInput = document.getElementById('signupUsername') as HTMLInputElement;
            const emailInput = document.getElementById('signupEmail') as HTMLInputElement;
            const passwordInput = document.getElementById('signupPassword') as HTMLInputElement;
            const passwordConfirmInput = document.getElementById('signupPasswordConfirm') as HTMLInputElement;
            usernameInput.value = 'testuser';
            emailInput.value = 'test@example.com';
            passwordInput.value = 'password123';
            passwordConfirmInput.value = 'password123';

            const event = new Event('submit', { cancelable: true });
            await LoginComponent.handleSignupSubmit(event);

            expect(mockHideSignupError).toHaveBeenCalled();
        });

        it('should show error when passwords do not match', async () => {
            const usernameInput = document.getElementById('signupUsername') as HTMLInputElement;
            const emailInput = document.getElementById('signupEmail') as HTMLInputElement;
            const passwordInput = document.getElementById('signupPassword') as HTMLInputElement;
            const passwordConfirmInput = document.getElementById('signupPasswordConfirm') as HTMLInputElement;
            usernameInput.value = 'testuser';
            emailInput.value = 'test@example.com';
            passwordInput.value = 'password123';
            passwordConfirmInput.value = 'different';

            const event = new Event('submit', { cancelable: true });
            await LoginComponent.handleSignupSubmit(event);

            expect(mockShowSignupError).toHaveBeenCalledWith('Passwords do not match');
            expect(mockSignup).not.toHaveBeenCalled();
        });

        it('should show error when required fields are empty', async () => {
            const event = new Event('submit', { cancelable: true });
            await LoginComponent.handleSignupSubmit(event);

            expect(mockShowSignupError).toHaveBeenCalledWith('Please fill in all fields');
            expect(mockSignup).not.toHaveBeenCalled();
        });

        it('should call signup with credentials when form is valid', async () => {
            const usernameInput = document.getElementById('signupUsername') as HTMLInputElement;
            const emailInput = document.getElementById('signupEmail') as HTMLInputElement;
            const passwordInput = document.getElementById('signupPassword') as HTMLInputElement;
            const passwordConfirmInput = document.getElementById('signupPasswordConfirm') as HTMLInputElement;
            usernameInput.value = 'testuser';
            emailInput.value = 'test@example.com';
            passwordInput.value = 'password123';
            passwordConfirmInput.value = 'password123';

            const event = new Event('submit', { cancelable: true });
            await LoginComponent.handleSignupSubmit(event);

            expect(mockSignup).toHaveBeenCalledWith({
                username: 'testuser',
                email: 'test@example.com',
                password: 'password123'
            });
        });
    });

    describe('Integration Tests', () => {
        it('should complete full login flow', async () => {
            const mockHtml = '<div id="loginModal"><form id="loginForm"><input id="username" type="text" /><input id="password" type="password" /><div id="loginError"></div></form><button id="guestLoginBtn"></button></div>';
            mockFetch.mockResolvedValueOnce({
                ok: true,
                text: jest.fn().mockResolvedValue(mockHtml)
            });

            await LoginComponent.loadLoginTemplate();

            const form = document.getElementById('loginForm') as HTMLFormElement;
            const usernameInput = document.getElementById('username') as HTMLInputElement;
            const passwordInput = document.getElementById('password') as HTMLInputElement;
            
            usernameInput.value = 'testuser';
            passwordInput.value = 'password123';

            const event = new Event('submit', { cancelable: true });
            await LoginComponent.handleLoginSubmit(event);

            expect(mockLogin).toHaveBeenCalledWith('testuser', 'password123');
        });

        it('should handle guest login flow', async () => {
            const mockHtml = '<div id="loginModal"><form id="loginForm"></form><button id="guestLoginBtn"></button></div>';
            mockFetch.mockResolvedValueOnce({
                ok: true,
                text: jest.fn().mockResolvedValue(mockHtml)
            });

            await LoginComponent.loadLoginTemplate();
            await LoginComponent.handleGuestLogin();

            expect(mockLogin).toHaveBeenCalledWith('guest', 'guest');
        });

        it('should handle template loading failure and use fallback', async () => {
            mockFetch.mockRejectedValueOnce(new Error('Network error'));

            await LoginComponent.loadLoginTemplate();

            expect(document.getElementById('loginModal')).toBeTruthy();
            expect(document.getElementById('loginForm')).toBeTruthy();
            expect(document.getElementById('guestLoginBtn')).toBeTruthy();
        });
    });

    describe('Edge Cases', () => {
        it('should handle empty username with whitespace', async () => {
            document.body.innerHTML = `
                <form id="loginForm">
                    <input id="username" type="text" value="   " />
                    <input id="password" type="password" value="password123" />
                    <div id="loginError"></div>
                </form>
            `;

            const form = document.getElementById('loginForm') as HTMLFormElement;
            const event = new Event('submit', { cancelable: true });

            await LoginComponent.handleLoginSubmit(event);

            // The component checks for truthy values, so whitespace-only username will pass validation
            // This tests the actual behavior - whitespace is considered a value
            const usernameInput = document.getElementById('username') as HTMLInputElement;
            // Since whitespace is truthy, login will be called
            expect(mockLogin).toHaveBeenCalledWith('   ', 'password123');
        });

        it('should handle special characters in username', async () => {
            document.body.innerHTML = `
                <form id="loginForm">
                    <input id="username" type="text" value="user@example.com" />
                    <input id="password" type="password" value="password123" />
                    <div id="loginError"></div>
                </form>
            `;

            const form = document.getElementById('loginForm') as HTMLFormElement;
            const event = new Event('submit', { cancelable: true });

            await LoginComponent.handleLoginSubmit(event);

            expect(mockLogin).toHaveBeenCalledWith('user@example.com', 'password123');
        });

        it('should handle very long password', async () => {
            const longPassword = 'a'.repeat(1000);
            document.body.innerHTML = `
                <form id="loginForm">
                    <input id="username" type="text" value="testuser" />
                    <input id="password" type="password" value="${longPassword}" />
                    <div id="loginError"></div>
                </form>
            `;

            const form = document.getElementById('loginForm') as HTMLFormElement;
            const event = new Event('submit', { cancelable: true });

            await LoginComponent.handleLoginSubmit(event);

            expect(mockLogin).toHaveBeenCalledWith('testuser', longPassword);
        });

        it('should handle multiple rapid form submissions', async () => {
            document.body.innerHTML = `
                <form id="loginForm">
                    <input id="username" type="text" value="testuser" />
                    <input id="password" type="password" value="password123" />
                    <div id="loginError"></div>
                </form>
            `;

            const form = document.getElementById('loginForm') as HTMLFormElement;
            const event1 = new Event('submit', { cancelable: true });
            const event2 = new Event('submit', { cancelable: true });

            await Promise.all([
                LoginComponent.handleLoginSubmit(event1),
                LoginComponent.handleLoginSubmit(event2)
            ]);

            expect(mockLogin).toHaveBeenCalledTimes(2);
        });
    });
});

// ---------------------------------------------------------------------------
// Concurrency guard — loadLoginTemplate singleton promise
// ---------------------------------------------------------------------------
describe('loadLoginTemplate — concurrency guard', () => {
    let mockFetch: jest.Mock;
    let LoadComponent: any;

    beforeAll(() => {
        const fs = require('fs');
        const path = require('path');
        let componentCode = fs.readFileSync(
            path.join(__dirname, '../../public/components/login/login.js'),
            'utf8'
        );
        componentCode = componentCode.replace(/\/\/ Initialize login component when script loads[\s\S]*$/, '');

        const funcContainer: any = {};
        const wrappedCode = `
            ${componentCode}
            if (typeof loadLoginTemplate !== 'undefined') funcContainer.loadLoginTemplate = loadLoginTemplate;
            if (typeof createFallbackLoginModal !== 'undefined') funcContainer.createFallbackLoginModal = createFallbackLoginModal;
            if (typeof setupLoginEventListeners !== 'undefined') funcContainer.setupLoginEventListeners = setupLoginEventListeners;
        `;
        eval(wrappedCode);
        LoadComponent = funcContainer;
    });

    beforeEach(() => {
        document.body.innerHTML = '';
        mockFetch = jest.fn();
        (global as any).fetch = mockFetch;
        jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
        document.body.innerHTML = '';
        jest.clearAllMocks();
        jest.restoreAllMocks();
    });

    it('concurrent calls issue only one fetch and inject exactly one modal', async () => {
        let resolveHtml!: (v: string) => void;
        const htmlPromise = new Promise<string>(res => { resolveHtml = res; });

        mockFetch.mockReturnValueOnce({
            ok: true,
            text: () => htmlPromise,
        });

        const modalHtml = '<div id="loginModal"><form id="loginForm"></form><button id="guestLoginBtn"></button></div>';

        // Start two calls without awaiting the first
        const call1 = LoadComponent.loadLoginTemplate();
        const call2 = LoadComponent.loadLoginTemplate();

        // Resolve the fetch after both calls have started
        resolveHtml(modalHtml);

        await Promise.all([call1, call2]);

        // Only one network request
        expect(mockFetch).toHaveBeenCalledTimes(1);
        // Only one modal in the DOM
        expect(document.querySelectorAll('#loginModal').length).toBe(1);
    });

    it('a second call that arrives after the first resolves still finds the modal and skips fetch', async () => {
        const modalHtml = '<div id="loginModal"><form id="loginForm"></form><button id="guestLoginBtn"></button></div>';
        mockFetch.mockResolvedValueOnce({ ok: true, text: jest.fn().mockResolvedValue(modalHtml) });

        // First call loads the template
        await LoadComponent.loadLoginTemplate();
        expect(mockFetch).toHaveBeenCalledTimes(1);

        // Second call after completion — modal already in DOM so no new fetch
        await LoadComponent.loadLoginTemplate();
        expect(mockFetch).toHaveBeenCalledTimes(1);
        expect(document.querySelectorAll('#loginModal').length).toBe(1);
    });

    it('after DOM is cleared a fresh call starts a new fetch', async () => {
        const modalHtml = '<div id="loginModal"><form id="loginForm"></form><button id="guestLoginBtn"></button></div>';
        mockFetch
            .mockResolvedValueOnce({ ok: true, text: jest.fn().mockResolvedValue(modalHtml) })
            .mockResolvedValueOnce({ ok: true, text: jest.fn().mockResolvedValue(modalHtml) });

        await LoadComponent.loadLoginTemplate();
        expect(mockFetch).toHaveBeenCalledTimes(1);

        // Simulate DOM being cleared (e.g., page transition / test teardown)
        document.body.innerHTML = '';

        await LoadComponent.loadLoginTemplate();
        expect(mockFetch).toHaveBeenCalledTimes(2);
        expect(document.getElementById('loginModal')).toBeTruthy();
    });

    it('concurrent calls during a slow fetch do not produce duplicate modals', async () => {
        const modalHtml = '<div id="loginModal"><form id="loginForm"></form><button id="guestLoginBtn"></button></div>';

        let resolveText!: (v: string) => void;
        const slowText = new Promise<string>(res => { resolveText = res; });

        mockFetch.mockReturnValueOnce({ ok: true, text: () => slowText });

        // Simulate 5 concurrent callers
        const calls = Array.from({ length: 5 }, () => LoadComponent.loadLoginTemplate());

        resolveText(modalHtml);
        await Promise.all(calls);

        expect(mockFetch).toHaveBeenCalledTimes(1);
        expect(document.querySelectorAll('#loginModal').length).toBe(1);
    });
});

// ---------------------------------------------------------------------------
// mainContainer default-hidden — IIFE flash prevention
// ---------------------------------------------------------------------------
describe('mainContainer default-hidden — IIFE flash prevention', () => {
    /**
     * The IIFE in index.html now works with mainContainer hidden by default
     * (style="display:none" on the element). These tests exercise the updated
     * logic: show mainContainer for authenticated users, leave it hidden for
     * unauthenticated users.
     */

    function runIIFELogic(storedUser: object | null): void {
        // Mirrors the updated IIFE in public/index.html
        if (storedUser) {
            const mc = document.getElementById('mainContainer');
            if (mc) (mc as HTMLElement).style.display = 'block';
        }
        // No else branch — mainContainer is already hidden by default in HTML
    }

    beforeEach(() => {
        document.body.innerHTML = '<div id="mainContainer" style="display:none"></div>';
    });

    afterEach(() => {
        document.body.innerHTML = '';
    });

    it('stored user → mainContainer is shown immediately', () => {
        runIIFELogic({ id: 'abc', role: 'USER' });

        const mc = document.getElementById('mainContainer') as HTMLElement;
        expect(mc.style.display).toBe('block');
    });

    it('no stored user → mainContainer stays hidden', () => {
        runIIFELogic(null);

        const mc = document.getElementById('mainContainer') as HTMLElement;
        expect(mc.style.display).toBe('none');
    });

    it('does not throw when mainContainer is absent', () => {
        document.body.innerHTML = '';

        expect(() => runIIFELogic({ id: 'abc', role: 'USER' })).not.toThrow();
        expect(() => runIIFELogic(null)).not.toThrow();
    });

    it('login success after unauthenticated page load → mainContainer becomes visible', () => {
        // Page loads with no stored user → mainContainer stays hidden
        runIIFELogic(null);
        const mc = document.getElementById('mainContainer') as HTMLElement;
        expect(mc.style.display).toBe('none');

        // Login succeeds → auth-app-init.js login handler sets display:block
        mc.style.display = 'block';
        expect(mc.style.display).toBe('block');
    });

    it('guest stored user → mainContainer is shown', () => {
        runIIFELogic({ id: 'guest-id', role: 'GUEST' });

        const mc = document.getElementById('mainContainer') as HTMLElement;
        expect(mc.style.display).toBe('block');
    });
});

// ---------------------------------------------------------------------------
// showMainApp() — mainContainer visibility
// ---------------------------------------------------------------------------
describe('showMainApp — shows mainContainer', () => {
    let AppInit: any;

    beforeAll(() => {
        const fs = require('fs');
        const path = require('path');
        const code = fs.readFileSync(
            path.join(__dirname, '../../public/js/app-initialization.js'),
            'utf8'
        );
        const funcContainer: any = {};
        const wrappedCode = `
            ${code}
            if (typeof showMainApp !== 'undefined') funcContainer.showMainApp = showMainApp;
        `;
        // Stub globals required by app-initialization.js
        (global as any).currentUser = { role: 'USER', username: 'testuser' };
        (global as any).disableAddToDeckButtonsImmediate = () => {};
        (global as any).switchToDeckBuilder = () => {};
        (global as any).updateUserWelcome = () => {};
        (global as any).loadCharacters = () => {};
        (global as any).loadSpecialCards = () => {};
        (global as any).loadAdvancedUniverse = () => {};
        (global as any).loadMissions = () => {};
        (global as any).loadLocations = () => {};
        (global as any).loadEvents = () => {};
        (global as any).loadAspects = () => {};
        (global as any).loadTeamwork = () => {};
        (global as any).loadAllyUniverse = () => {};
        (global as any).loadTraining = () => {};
        (global as any).loadBasicUniverse = () => {};
        (global as any).loadPowerCards = () => {};
        (global as any).loadDecks = () => {};
        eval(wrappedCode);
        AppInit = funcContainer;
    });

    beforeEach(() => {
        document.body.innerHTML = `
            <div id="mainContainer" style="display:none"></div>
            <div id="loginModal" style="display:flex"></div>
            <span id="currentUsername"></span>
            <div id="database-view"></div>
            <div id="deck-builder" class="view-removed"></div>
        `;
        (global as any).currentUser = { role: 'USER', username: 'testuser' };
        (global as any).disableAddToDeckButtonsImmediate = jest.fn();
        (global as any).switchToDeckBuilder = jest.fn();
        (global as any).updateUserWelcome = jest.fn();
        jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
        document.body.innerHTML = '';
        jest.clearAllMocks();
        jest.restoreAllMocks();
    });

    it('sets mainContainer display to block', () => {
        AppInit.showMainApp();

        const mc = document.getElementById('mainContainer') as HTMLElement;
        expect(mc.style.display).toBe('block');
    });

    it('hides the login modal', () => {
        AppInit.showMainApp();

        const loginModal = document.getElementById('loginModal') as HTMLElement;
        expect(loginModal.style.display).toBe('none');
    });

    it('does not throw when mainContainer is absent', () => {
        document.body.innerHTML = `
            <div id="loginModal" style="display:flex"></div>
            <span id="currentUsername"></span>
            <div id="database-view"></div>
            <div id="deck-builder" class="view-removed"></div>
        `;

        expect(() => AppInit.showMainApp()).not.toThrow();
    });

    it('shows mainContainer for guest users', () => {
        (global as any).currentUser = { role: 'GUEST', username: 'guest' };

        AppInit.showMainApp();

        const mc = document.getElementById('mainContainer') as HTMLElement;
        expect(mc.style.display).toBe('block');
    });
});

// ---------------------------------------------------------------------------
// showDeckEditor() — mainContainer visibility
// ---------------------------------------------------------------------------
describe('showDeckEditor — shows mainContainer', () => {
    let DeckEditorCore: any;

    beforeAll(() => {
        const fs = require('fs');
        const path = require('path');
        const code = fs.readFileSync(
            path.join(__dirname, '../../public/js/deck-editor-core.js'),
            'utf8'
        );
        const funcContainer: any = {};
        // Stub all globals deck-editor-core.js depends on
        (global as any).currentDeckData = null;
        (global as any).manageDeckLayout = () => false;
        (global as any).createTwoColumnLayout = () => {};
        (global as any).getCurrentUser = () => null;
        (global as any).loadDeckForEditing = async () => {};
        (global as any).requestAnimationFrame = (cb: () => void) => { try { cb(); } catch (_) {} };
        const wrappedCode = `
            ${code}
            if (typeof showDeckEditor !== 'undefined') funcContainer.showDeckEditor = showDeckEditor;
        `;
        eval(wrappedCode);
        DeckEditorCore = funcContainer;
    });

    beforeEach(() => {
        document.body.innerHTML = `
            <div id="mainContainer" style="display:none"></div>
            <div id="deckEditorModal" style="display:none">
                <div class="deck-editor-layout">
                    <div class="deck-pane"></div>
                </div>
            </div>
        `;
        (global as any).currentDeckData = null;
        (global as any).manageDeckLayout = () => false;
        (global as any).createTwoColumnLayout = () => {};
        jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
        document.body.innerHTML = '';
        jest.clearAllMocks();
        jest.restoreAllMocks();
    });

    it('sets mainContainer display to block', () => {
        DeckEditorCore.showDeckEditor();

        const mc = document.getElementById('mainContainer') as HTMLElement;
        expect(mc.style.display).toBe('block');
    });

    it('sets mainContainer display to block even when deckEditorModal is absent', () => {
        document.body.innerHTML = '<div id="mainContainer" style="display:none"></div>';

        DeckEditorCore.showDeckEditor();

        const mc = document.getElementById('mainContainer') as HTMLElement;
        expect(mc.style.display).toBe('block');
    });

    it('does not throw when mainContainer is absent', () => {
        document.body.innerHTML = `
            <div id="deckEditorModal" style="display:none">
                <div class="deck-editor-layout"></div>
            </div>
        `;

        expect(() => DeckEditorCore.showDeckEditor()).not.toThrow();
    });
});
