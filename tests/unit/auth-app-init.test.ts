/**
 * Unit tests for public/js/auth-app-init.js
 * Tests showLoginModal, showSignupModal, and related auth UI functions
 * @jest-environment jsdom
 */

const nodeFs = require('fs');
const nodePath = require('path');

// Mock window globals
(window as any).__flashDebug = null;

// Load the module
const authAppInitCode = nodeFs.readFileSync(
    nodePath.join(__dirname, '../../public/js/auth-app-init.js'),
    'utf8'
);

let authFns: Record<string, (...args: any[]) => any>;

function loadModule() {
    authFns = eval(`
        ${authAppInitCode}
        ({
            showLoginModal,
            showSignupModal,
            showLoginError,
            hideLoginError,
            showSignupError,
            hideSignupError
        })
    `);
}

function setupDOM() {
    document.body.innerHTML = `
        <div id="loginModal" class="login-modal" style="display: none;">
            <div id="loginView" style="display: block;"></div>
            <div id="signupView" style="display: none;"></div>
        </div>
        <div id="loginError" style="display: none;"></div>
        <div id="signupError" style="display: none;"></div>
        <div id="mainContainer" style="display: block;"></div>
        <div id="database-view"></div>
        <div id="deck-builder"></div>
    `;
}

describe('showLoginModal()', () => {
    beforeEach(() => {
        loadModule();
        setupDOM();
    });

    it('displays the login modal', async () => {
        const loginModal = document.getElementById('loginModal');
        expect(loginModal!.style.display).toBe('none');
        
        await authFns.showLoginModal();
        
        expect(loginModal!.style.display).toBe('flex');
    });

    it('shows login view and hides signup view', async () => {
        const loginView = document.getElementById('loginView');
        const signupView = document.getElementById('signupView');
        
        // Start with signup view visible
        loginView!.style.display = 'none';
        signupView!.style.display = 'block';
        
        await authFns.showLoginModal();
        
        expect(loginView!.style.display).toBe('block');
        expect(signupView!.style.display).toBe('none');
    });

    it('hides main container', async () => {
        const mainContainer = document.getElementById('mainContainer');
        expect(mainContainer!.style.display).toBe('block');
        
        await authFns.showLoginModal();
        
        expect(mainContainer!.style.display).toBe('none');
    });
});

describe('showSignupModal()', () => {
    beforeEach(() => {
        loadModule();
        setupDOM();
    });

    it('displays the login modal', async () => {
        const loginModal = document.getElementById('loginModal');
        expect(loginModal!.style.display).toBe('none');
        
        await authFns.showSignupModal();
        
        expect(loginModal!.style.display).toBe('flex');
    });

    it('shows signup view and hides login view', async () => {
        const loginView = document.getElementById('loginView');
        const signupView = document.getElementById('signupView');
        
        await authFns.showSignupModal();
        
        expect(loginView!.style.display).toBe('none');
        expect(signupView!.style.display).toBe('block');
    });

    it('hides main container', async () => {
        const mainContainer = document.getElementById('mainContainer');
        expect(mainContainer!.style.display).toBe('block');
        
        await authFns.showSignupModal();
        
        expect(mainContainer!.style.display).toBe('none');
    });

    it('clears any existing error messages', async () => {
        const loginError = document.getElementById('loginError');
        const signupError = document.getElementById('signupError');
        
        loginError!.style.display = 'block';
        signupError!.style.display = 'block';
        
        await authFns.showSignupModal();
        
        expect(loginError!.style.display).toBe('none');
        expect(signupError!.style.display).toBe('none');
    });
});

describe('showLoginError()', () => {
    beforeEach(() => {
        loadModule();
        setupDOM();
    });

    it('displays error message', () => {
        const errorDiv = document.getElementById('loginError');
        
        authFns.showLoginError('Test error message');
        
        expect(errorDiv!.textContent).toBe('Test error message');
        expect(errorDiv!.style.display).toBe('block');
    });
});

describe('hideLoginError()', () => {
    beforeEach(() => {
        loadModule();
        setupDOM();
    });

    it('hides error message', () => {
        const errorDiv = document.getElementById('loginError');
        errorDiv!.style.display = 'block';
        
        authFns.hideLoginError();
        
        expect(errorDiv!.style.display).toBe('none');
    });
});

describe('showSignupError()', () => {
    beforeEach(() => {
        loadModule();
        setupDOM();
    });

    it('displays error message', () => {
        const errorDiv = document.getElementById('signupError');
        
        authFns.showSignupError('Signup error message');
        
        expect(errorDiv!.textContent).toBe('Signup error message');
        expect(errorDiv!.style.display).toBe('block');
    });
});

describe('hideSignupError()', () => {
    beforeEach(() => {
        loadModule();
        setupDOM();
    });

    it('hides error message', () => {
        const errorDiv = document.getElementById('signupError');
        errorDiv!.style.display = 'block';
        
        authFns.hideSignupError();
        
        expect(errorDiv!.style.display).toBe('none');
    });
});
