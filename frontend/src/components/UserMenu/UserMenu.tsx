import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../app/AuthProvider';
import { IconChevronDown, IconCollection, IconLogout, IconProfile, IconPlus } from '../icons';
import './UserMenu.css';

export function UserMenu() {
  const { user, isGuest, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  if (!user) return null;

  const initial = (user.username || '?').charAt(0).toUpperCase();

  const handleLogout = async () => {
    setOpen(false);
    await logout();
    navigate('/login');
  };

  return (
    <div className="user-menu" ref={ref}>
      <button
        type="button"
        className="user-menu__toggle"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <span className="user-menu__avatar" aria-hidden="true">{initial}</span>
        <span className="user-menu__name">{isGuest ? 'Guest' : user.username}</span>
        <IconChevronDown className="user-menu__caret" />
      </button>

      {open ? (
        <div className="user-menu__dropdown" role="menu">
          <div className="user-menu__header">
            <span className="user-menu__avatar user-menu__avatar--lg" aria-hidden="true">{initial}</span>
            <div>
              <div className="user-menu__dropdown-name">{isGuest ? 'Guest' : user.username}</div>
              <div className="user-menu__role">{user.role}</div>
            </div>
          </div>
          <button
            type="button"
            className="user-menu__item"
            role="menuitem"
            onClick={() => {
              setOpen(false);
              navigate(`/users/${user.id}/decks`);
            }}
          >
            <IconPlus /> My Decks
          </button>
          <button
            type="button"
            className="user-menu__item"
            role="menuitem"
            onClick={() => {
              setOpen(false);
              navigate(`/users/${user.id}/collection`);
            }}
          >
            <IconCollection /> Collection
          </button>
          <button type="button" className="user-menu__item" role="menuitem" disabled>
            <IconProfile /> Profile
            <span className="user-menu__soon">Soon</span>
          </button>
          <div className="user-menu__divider" />
          <button type="button" className="user-menu__item user-menu__item--danger" role="menuitem" onClick={handleLogout}>
            <IconLogout /> {isGuest ? 'Exit Guest' : 'Log Out'}
          </button>
        </div>
      ) : null}
    </div>
  );
}
