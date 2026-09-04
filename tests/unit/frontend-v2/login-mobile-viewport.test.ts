import * as fs from 'fs';
import * as path from 'path';

describe('Login mobile viewport styling', () => {
  const css = fs.readFileSync(
    path.join(process.cwd(), 'frontend/src/features/login/LoginPage.css'),
    'utf8',
  );

  const loginRule = css.match(/\.login\s*\{([^}]*)\}/)?.[1] ?? '';
  const mobileLoginRule = css.match(/\.layout-mobile \.login\s*\{([^}]*)\}/)?.[1] ?? '';

  it('sizes the login screen to the dynamic visible viewport', () => {
    expect(loginRule).toContain('min-height: 100vh');
    expect(loginRule).toContain('min-height: 100dvh');
    expect(mobileLoginRule).toContain('height: 100dvh');
    expect(mobileLoginRule).toContain('min-height: 100dvh');
  });

  it('keeps the logo visible and lets short mobile viewports scroll', () => {
    expect(mobileLoginRule).toContain('env(safe-area-inset-top, 0px)');
    expect(mobileLoginRule).toContain('env(safe-area-inset-bottom, 0px)');
    expect(mobileLoginRule).toContain('align-content: safe center');
    expect(mobileLoginRule).toContain('overflow-y: auto');
  });
});
