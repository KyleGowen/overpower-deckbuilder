import { useState, type ReactNode } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../app/AuthProvider';
import { useLayoutMode } from '../../lib/layout/LayoutModeProvider';
import { Logo } from '../Logo';
import { UserMenu } from '../UserMenu';
import { SlideOutPanel } from '../SlideOutPanel';
import {
  IconHome,
  IconDatabase,
  IconDecks,
  IconCollection,
  IconProfile,
  IconLogout,
} from '../icons';
import './AppShell.css';

interface NavItem {
  key: string;
  label: string;
  icon: ReactNode;
  to: (userId: string) => string;
  match: (pathname: string, userId: string) => boolean;
}

const NAV_ITEMS: NavItem[] = [
  {
    key: 'home',
    label: 'Home',
    icon: <IconHome />,
    to: () => '/home',
    match: (p) => p === '/home' || p === '/',
  },
  {
    key: 'database',
    label: 'Database',
    icon: <IconDatabase />,
    to: () => '/data',
    match: (p) => p.startsWith('/data'),
  },
  {
    key: 'decks',
    label: 'Decks',
    icon: <IconDecks />,
    to: (userId) => `/users/${userId}/decks`,
    match: (p) => /\/users\/[^/]+\/decks/.test(p),
  },
  {
    key: 'collection',
    label: 'Collection',
    icon: <IconCollection />,
    to: (userId) => `/users/${userId}/collection`,
    match: (p) => /\/users\/[^/]+\/collection/.test(p),
  },
];

export function AppShell({ children }: { children: ReactNode }) {
  const { user, isGuest, logout } = useAuth();
  const { isMobile, preferDesktop, setPreferDesktop } = useLayoutMode();
  const location = useLocation();
  const navigate = useNavigate();
  const [accountOpen, setAccountOpen] = useState(false);

  const userId = user?.id ?? '';

  const handleLogout = async () => {
    setAccountOpen(false);
    await logout();
    navigate('/login');
  };

  if (isMobile) {
    return (
      <div className="app-shell app-shell--mobile">
        <main className="app-shell__content">{children}</main>

        <nav className="bottom-nav" aria-label="Primary">
          {NAV_ITEMS.map((item) => {
            const active = item.match(location.pathname, userId);
            return (
              <NavLink
                key={item.key}
                to={item.to(userId)}
                className={`bottom-nav__item ${active ? 'is-active' : ''}`}
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
          title={isGuest ? 'Guest' : user?.username}
          ariaLabel="Account"
        >
          <div className="account-sheet">
            <button
              type="button"
              className="account-sheet__item"
              onClick={() => {
                setAccountOpen(false);
                navigate(`/users/${userId}/decks`);
              }}
            >
              <IconDecks /> My Decks
            </button>
            <button
              type="button"
              className="account-sheet__item"
              onClick={() => {
                setAccountOpen(false);
                navigate(`/users/${userId}/collection`);
              }}
            >
              <IconCollection /> Collection
            </button>
            <label className="account-sheet__toggle">
              <span>Use desktop layout</span>
              <input
                type="checkbox"
                checked={preferDesktop}
                onChange={(e) => setPreferDesktop(e.target.checked)}
              />
            </label>
            <button type="button" className="account-sheet__item account-sheet__item--danger" onClick={handleLogout}>
              <IconLogout /> {isGuest ? 'Exit Guest' : 'Log Out'}
            </button>
          </div>
        </SlideOutPanel>
      </div>
    );
  }

  return (
    <div className="app-shell app-shell--desktop">
      <header className="top-nav">
        <div className="top-nav__inner">
          <NavLink to="/home" className="top-nav__brand" aria-label="Excelsior home">
            <Logo height={30} />
          </NavLink>

          <nav className="top-nav__tabs" aria-label="Primary">
            {NAV_ITEMS.map((item) => {
              const active = item.match(location.pathname, userId);
              return (
                <NavLink
                  key={item.key}
                  to={item.to(userId)}
                  className={`top-nav__tab ${active ? 'is-active' : ''}`}
                >
                  <span className="top-nav__tab-icon">{item.icon}</span>
                  {item.label}
                </NavLink>
              );
            })}
          </nav>

          <div className="top-nav__right">
            <UserMenu />
          </div>
        </div>
      </header>

      <main className="app-shell__content">{children}</main>
    </div>
  );
}
