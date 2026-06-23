import { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../../app/AuthProvider';
import { useLayoutMode } from '../../lib/layout/LayoutModeProvider';
import { SlideOutPanel } from '../SlideOutPanel';
import { ProfileMenuContent } from '../ProfileMenu/ProfileMenuContent';
import { IconProfile } from '../icons';
import { MOBILE_NAV_ORDER, NAV_ITEMS } from './navConfig';
import '../AppShell/AppShell.css';

export function MobileBottomNav() {
  const { user } = useAuth();
  const { preferDesktop, setPreferDesktop } = useLayoutMode();
  const location = useLocation();
  const [accountOpen, setAccountOpen] = useState(false);

  useEffect(() => {
    setAccountOpen(false);
  }, [location.pathname]);

  const userId = user?.id ?? '';

  return (
    <>
      <nav className="bottom-nav" aria-label="Primary">
        {MOBILE_NAV_ORDER.map((key) => NAV_ITEMS.find((item) => item.key === key)!).map((item) => {
          const active = item.match(location.pathname, userId);
          return (
            <NavLink
              key={item.key}
              to={item.to(userId)}
              className={`bottom-nav__item${item.key === 'home' ? ' bottom-nav__item--home' : ''} ${active ? 'is-active' : ''}`}
            >
              <span className="bottom-nav__icon">{item.icon}</span>
              <span className="bottom-nav__label">{item.label}</span>
            </NavLink>
          );
        })}
        <button
          type="button"
          className={`bottom-nav__item ${accountOpen ? 'is-active' : ''}`}
          onClick={() => setAccountOpen(true)}
        >
          <span className="bottom-nav__icon"><IconProfile /></span>
          <span className="bottom-nav__label">Profile</span>
        </button>
      </nav>

      <SlideOutPanel
        open={accountOpen}
        onClose={() => setAccountOpen(false)}
        side="bottom"
        title="Account"
        ariaLabel="Account"
      >
        <div className="account-sheet">
          <ProfileMenuContent onClose={() => setAccountOpen(false)} variant="sheet" />
          <label className="account-sheet__toggle">
            <span>Use desktop layout</span>
            <input
              type="checkbox"
              checked={preferDesktop}
              onChange={(e) => setPreferDesktop(e.target.checked)}
            />
          </label>
        </div>
      </SlideOutPanel>
    </>
  );
}
