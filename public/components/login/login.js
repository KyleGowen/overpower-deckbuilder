/**
 * Login Component
 * Renders and manages the login/signup screen.
 * Delegates auth to window.authService.
 * On success, calls window.App.onAuthSuccess(user).
 */
(function () {
  'use strict';

  let _mode = 'login'; // 'login' | 'signup'

  const ICONS = {
    user: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="16" height="16"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>`,
    lock: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="16" height="16"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>`,
    eye: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="16" height="16"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>`,
    eyeOff: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="16" height="16"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>`,
    login: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="18" height="18"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/></svg>`,
    userPlus: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="14" height="14"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" y1="8" x2="19" y2="14"/><line x1="22" y1="11" x2="16" y2="11"/></svg>`,
    excelsiorV: `<svg viewBox="0 0 48 48" fill="none" width="40" height="40"><path d="M24 4L4 20l8 4-8 10 20-8 20 8-8-10 8-4z" fill="none" stroke="#4ecdc4" stroke-width="2" stroke-linejoin="round"/><path d="M16 32l8 12 8-12" fill="none" stroke="#4ecdc4" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`
  };

  const GOOGLE_ICON = `<svg class="login-google-icon" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>`;

  function getFormHtml() {
    const isLogin = _mode === 'login';
    return `
      <div class="login-form-card">
        <div class="login-form-icon">${ICONS.excelsiorV}</div>
        <h1 class="login-form-title">Welcome Back</h1>
        <p class="login-form-subtitle">Log in to access your decks, collections, and battles.</p>

        <div class="login-mode-tabs">
          <button class="login-mode-tab ${isLogin ? 'active' : ''}" data-mode="login">Log In</button>
          <button class="login-mode-tab ${!isLogin ? 'active' : ''}" data-mode="signup">Create Account</button>
        </div>

        <div class="login-error" id="login-error" role="alert"></div>

        <form id="login-form" novalidate>
          ${!isLogin ? `
          <div class="login-field">
            <label for="login-email">Email</label>
            <div class="login-input-wrap">
              <span class="login-input-icon">${ICONS.user}</span>
              <input type="email" id="login-email" name="email" placeholder="Enter your email" autocomplete="email">
            </div>
          </div>
          ` : ''}
          <div class="login-field">
            <label for="login-username">${isLogin ? 'Email or Username' : 'Username'}</label>
            <div class="login-input-wrap">
              <span class="login-input-icon">${ICONS.user}</span>
              <input type="text" id="login-username" name="username" placeholder="${isLogin ? 'Enter your email or username' : 'Enter your username'}" autocomplete="username" autofocus>
            </div>
          </div>
          <div class="login-field">
            <label for="login-password">Password</label>
            <div class="login-input-wrap">
              <span class="login-input-icon">${ICONS.lock}</span>
              <input type="password" id="login-password" name="password" placeholder="Enter your password" autocomplete="${isLogin ? 'current-password' : 'new-password'}">
              <button type="button" class="login-pw-toggle" id="pw-toggle" aria-label="Toggle password visibility">
                ${ICONS.eye}
              </button>
            </div>
          </div>

          ${isLogin ? `
          <div class="login-remember-row">
            <label class="login-remember-label">
              <input type="checkbox" id="login-remember" name="remember">
              <span>Remember me</span>
            </label>
            <button type="button" class="login-forgot-btn">Forgot password?</button>
          </div>
          ` : ''}

          <button type="submit" class="login-submit-btn" id="login-submit">
            ${ICONS.login}
            <span>${isLogin ? 'Log In' : 'Create Account'}</span>
          </button>
        </form>

        <div class="login-or"><span>OR</span></div>

        <button class="login-google-btn" id="login-google">
          ${GOOGLE_ICON}
          Sign in with Google
        </button>

        <div class="login-alt-row">
          <button class="login-alt-btn" id="login-guest">
            ${ICONS.user}
            Continue as Guest
          </button>
          <button class="login-alt-btn" id="login-switch-mode" data-mode="${isLogin ? 'signup' : 'login'}">
            ${ICONS.userPlus}
            ${isLogin ? 'Create Account' : 'Back to Login'}
          </button>
        </div>

        <p class="login-support">
          For support or feedback, email <a href="mailto:kyle@excelsior.cards">kyle@excelsior.cards</a><br>
          or join our community on Discord: <a href="https://discord.gg/girlsgonekyle" target="_blank" rel="noopener">@GirlsGoneKyle</a>
        </p>
      </div>
    `;
  }

  function getLeftPanelHtml() {
    return `
      <div class="login-left-panel">
        <div class="login-logo">
          <img src="/src/resources/images/logo/logo5.png" alt="Excelsior" loading="eager">
        </div>
        <h2 class="login-tagline">Build. Battle. OverPower.</h2>
        <p class="login-tagline-sub">
          The ultimate companion for OverPower Trading Card Game players.
        </p>
        <div class="login-features">
          <div class="login-feature">
            <div class="login-feature-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="4" width="13" height="17" rx="2"/><path d="M7 4V2"/><path d="M11 4V2"/><line x1="6" y1="10" x2="11" y2="10"/><line x1="6" y1="14" x2="11" y2="14"/></svg>
            </div>
            <div>
              <div class="login-feature-title">Build Your Deck</div>
              <div class="login-feature-desc">Thousands of cards. Infinite strategies.</div>
            </div>
          </div>
          <div class="login-feature">
            <div class="login-feature-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 3a3 3 0 0 0-3 3v12a3 3 0 0 0 3 3 3 3 0 0 0 3-3 3 3 0 0 0-3-3H6a3 3 0 0 0-3 3 3 3 0 0 0 3 3 3 3 0 0 0 3-3V6a3 3 0 0 0-3-3 3 3 0 0 0-3 3 3 3 0 0 0 3 3h12a3 3 0 0 0 3-3 3 3 0 0 0-3-3z"/></svg>
            </div>
            <div>
              <div class="login-feature-title">Compete &amp; Climb</div>
              <div class="login-feature-desc">Prove your power on the battlefield.</div>
            </div>
          </div>
          <div class="login-feature">
            <div class="login-feature-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
            </div>
            <div>
              <div class="login-feature-title">Collect &amp; Customize</div>
              <div class="login-feature-desc">Unlock cards, foil variants, and more.</div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  function render() {
    const el = document.getElementById('view-login');
    if (!el) return;
    el.innerHTML = `
      ${getLeftPanelHtml()}
      <div class="login-right-panel">
        <div class="login-logo-mobile mobile-only">
          <img src="/src/resources/images/logo/logo5.png" alt="Excelsior">
        </div>
        ${getFormHtml()}
      </div>
    `;
    bindEvents();
  }

  function showError(msg) {
    const el = document.getElementById('login-error');
    if (el) { el.textContent = msg; el.classList.add('visible'); }
  }

  function hideError() {
    const el = document.getElementById('login-error');
    if (el) el.classList.remove('visible');
  }

  function setLoading(loading) {
    const btn = document.getElementById('login-submit');
    if (!btn) return;
    if (loading) {
      btn.disabled = true;
      btn.innerHTML = `<span class="login-loading"></span> <span>Please wait...</span>`;
    } else {
      btn.disabled = false;
      btn.innerHTML = `${ICONS.login} <span>${_mode === 'login' ? 'Log In' : 'Create Account'}</span>`;
    }
  }

  function bindEvents() {
    // Mode tabs
    document.querySelectorAll('.login-mode-tab[data-mode]').forEach(tab => {
      tab.addEventListener('click', () => { _mode = tab.dataset.mode; render(); });
    });

    // Alt button (switch mode)
    const switchBtn = document.getElementById('login-switch-mode');
    if (switchBtn) {
      switchBtn.addEventListener('click', () => { _mode = switchBtn.dataset.mode; render(); });
    }

    // Form submit
    const form = document.getElementById('login-form');
    if (form) {
      form.addEventListener('submit', async e => {
        e.preventDefault();
        hideError();
        const username = document.getElementById('login-username')?.value?.trim();
        const password = document.getElementById('login-password')?.value;
        if (!username || !password) { showError('Please enter your username and password.'); return; }
        setLoading(true);
        try {
          let result;
          if (_mode === 'signup') {
            const email = document.getElementById('login-email')?.value?.trim() || '';
            result = await window.authService.signup({ username, password, email });
          } else {
            result = await window.authService.login({ username, password });
          }
          if (result.success && result.data) {
            const user = window.authService.getCurrentUser();
            window.App?.onAuthSuccess(user);
          } else {
            showError(result.error || 'Login failed. Please check your credentials.');
          }
        } catch {
          showError('An error occurred. Please try again.');
        } finally {
          setLoading(false);
        }
      });
    }

    // Password toggle
    const pwToggle = document.getElementById('pw-toggle');
    const pwInput = document.getElementById('login-password');
    if (pwToggle && pwInput) {
      pwToggle.addEventListener('click', () => {
        const isText = pwInput.type === 'text';
        pwInput.type = isText ? 'password' : 'text';
        pwToggle.innerHTML = isText ? ICONS.eye : ICONS.eyeOff;
      });
    }

    // Guest login
    const guestBtn = document.getElementById('login-guest');
    if (guestBtn) {
      guestBtn.addEventListener('click', async () => {
        hideError();
        guestBtn.disabled = true;
        guestBtn.textContent = 'Connecting...';
        try {
          const result = await window.authService.guestLogin();
          if (result.success && result.data) {
            window.App?.onAuthSuccess(window.authService.getCurrentUser());
          } else {
            showError('Guest login failed. Please try again.');
            guestBtn.disabled = false;
            guestBtn.innerHTML = `${ICONS.user} Continue as Guest`;
          }
        } catch {
          showError('Guest login failed. Please try again.');
          guestBtn.disabled = false;
          guestBtn.innerHTML = `${ICONS.user} Continue as Guest`;
        }
      });
    }

    // Google login
    const googleBtn = document.getElementById('login-google');
    if (googleBtn) {
      googleBtn.addEventListener('click', async () => {
        hideError();
        googleBtn.disabled = true;
        try {
          const auth = await initializeFirebase();
          if (!auth) { showError('Google sign-in is not available.'); googleBtn.disabled = false; return; }
          const provider = new firebase.auth.GoogleAuthProvider();
          const result = await auth.signInWithPopup(provider);
          const idToken = await result.user.getIdToken();
          const preview = await window.authService.previewGoogleLogin(idToken);
          let loginResult;
          if (preview.requiresConfirmation) {
            loginResult = await window.authService.loginWithGoogle(idToken, { confirmRegistration: true });
          } else {
            loginResult = await window.authService.loginWithGoogle(idToken);
          }
          if (loginResult.success && loginResult.data) {
            window.App?.onAuthSuccess(window.authService.getCurrentUser());
          } else {
            showError(loginResult.error || 'Google sign-in failed.');
          }
        } catch (err) {
          if (err.code !== 'auth/popup-closed-by-user') {
            showError('Google sign-in failed. Please try again.');
          }
        } finally {
          googleBtn.disabled = false;
        }
      });
    }
  }

  window.Login = {
    render,
    show() { document.getElementById('view-login')?.classList.remove('hidden'); },
    hide() { document.getElementById('view-login')?.classList.add('hidden'); }
  };
})();
