import { useEffect, useRef, useState } from 'react';
import { useAuth } from '../../app/AuthProvider';
import { IconChevronDown } from '../icons';
import { ProfileMenuContent } from '../ProfileMenu/ProfileMenuContent';
import './UserMenu.css';

export function UserMenu() {
  const { user, isGuest } = useAuth();
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
          <ProfileMenuContent onClose={() => setOpen(false)} variant="dropdown" />
        </div>
      ) : null}
    </div>
  );
}
