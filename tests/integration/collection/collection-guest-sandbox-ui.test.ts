/**
 * Integration tests for Collection GUEST Sandbox UI
 * 
 * Tests the frontend behavior of the GUEST sandbox mode:
 * - Signup link in sandbox banner triggers modal (not navigation)
 * - Required JS files are properly included
 */

import request from 'supertest';
import { app } from '../../../src/test-server';

describe('Collection GUEST Sandbox UI Integration Tests', () => {
  describe('collection-view.js source code', () => {
    it('should contain guest-signup-link class for signup link', async () => {
      const response = await request(app)
        .get('/js/collection-view.js');
      
      expect(response.status).toBe(200);
      expect(response.text).toContain('guest-signup-link');
    });

    it('should NOT contain href="/signup" navigation link', async () => {
      const response = await request(app)
        .get('/js/collection-view.js');
      
      expect(response.status).toBe(200);
      expect(response.text).not.toContain('href="/signup"');
    });

    it('should call showLoginModal on signup link click', async () => {
      const response = await request(app)
        .get('/js/collection-view.js');
      
      expect(response.status).toBe(200);
      expect(response.text).toContain('showLoginModal');
    });
  });

  describe('auth-app-init.js source code', () => {
    it('should export showSignupModal function', async () => {
      const response = await request(app)
        .get('/js/auth-app-init.js');
      
      expect(response.status).toBe(200);
      expect(response.text).toContain('function showSignupModal');
    });

    it('showSignupModal should switch to signup view', async () => {
      const response = await request(app)
        .get('/js/auth-app-init.js');
      
      expect(response.status).toBe(200);
      // Verify it shows signup view and hides login view
      expect(response.text).toContain("signupView.style.display = 'block'");
      expect(response.text).toContain("loginView.style.display = 'none'");
    });
  });
});
