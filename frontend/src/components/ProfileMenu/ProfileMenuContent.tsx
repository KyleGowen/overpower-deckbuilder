import { useState, useEffect, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../app/AuthProvider';
import { fetchDecksForUser } from '../../lib/api/decks';
import { changeEmail, changePassword } from '../../lib/api/account';
import { isValidEmail } from '../../lib/validation/email';
import { PasswordInput } from '../PasswordInput/PasswordInput';
import { IconPlus, IconLogout, IconLock, IconSettings } from '../icons';
import './ProfileMenuContent.css';

type OpenForm = 'email' | 'password' | null;

export interface ProfileMenuContentProps {
  onClose: () => void;
  variant?: 'dropdown' | 'sheet';
}

export function ProfileMenuContent({ onClose, variant = 'dropdown' }: ProfileMenuContentProps) {
  const { user, isGuest, logout, refresh } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [openForm, setOpenForm] = useState<OpenForm>(null);
  const [emailValue, setEmailValue] = useState('');
  const [emailError, setEmailError] = useState<string | null>(null);
  const [emailBusy, setEmailBusy] = useState(false);

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordBusy, setPasswordBusy] = useState(false);

  const userId = user?.id ?? '';

  const decksQuery = useQuery({
    queryKey: ['decks', 'mine', userId],
    queryFn: () => fetchDecksForUser(isGuest),
    enabled: Boolean(userId),
  });

  useEffect(() => {
    if (!isGuest && user && !user.email) {
      void refresh();
    }
  }, [isGuest, user, refresh]);

  useEffect(() => {
    if (user?.authProvider === 'google' && openForm) {
      setOpenForm(null);
    }
  }, [user?.authProvider, openForm]);

  if (!user) return null;

  const displayName = isGuest ? 'Guest' : user.username;
  const deckCount = decksQuery.data?.length ?? 0;
  const deckLabel = deckCount === 1 ? '1 deck' : `${deckCount} decks`;
  const isGoogleUser = user.authProvider === 'google';
  const canChangeAccountSettings = !isGuest && !isGoogleUser;

  const toggleForm = (form: OpenForm) => {
    setOpenForm((current) => (current === form ? null : form));
    setEmailError(null);
    setPasswordError(null);
    if (form === 'email') {
      setEmailValue(user.email ?? '');
    }
    if (form === 'password') {
      setNewPassword('');
      setConfirmPassword('');
    }
  };

  const handleCreateDeck = () => {
    onClose();
    navigate(`/users/${user.id}/decks?create=1`);
  };

  const handleLogout = async () => {
    onClose();
    await logout();
    navigate('/login');
  };

  const handleEmailSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const trimmed = emailValue.trim();
    if (!trimmed) {
      setEmailError('Email is required.');
      return;
    }
    if (!isValidEmail(trimmed)) {
      setEmailError('Invalid email address.');
      return;
    }
    setEmailBusy(true);
    setEmailError(null);
    try {
      await changeEmail(trimmed);
      await refresh();
      await queryClient.invalidateQueries({ queryKey: ['auth', 'me'] });
      setOpenForm(null);
    } catch (err) {
      setEmailError((err as Error)?.message || 'Could not change email');
    } finally {
      setEmailBusy(false);
    }
  };

  const passwordsFilled = newPassword.length > 0 && confirmPassword.length > 0;
  const passwordsMatch = newPassword === confirmPassword;
  const showPasswordMismatch = passwordsFilled && !passwordsMatch;

  const handlePasswordSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!passwordsFilled) {
      setPasswordError('Both fields are required.');
      return;
    }
    if (!passwordsMatch) {
      setPasswordError('Passwords do not match.');
      return;
    }
    setPasswordBusy(true);
    setPasswordError(null);
    try {
      await changePassword(newPassword, confirmPassword);
      setOpenForm(null);
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setPasswordError((err as Error)?.message || 'Could not change password');
    } finally {
      setPasswordBusy(false);
    }
  };

  const rootClass = `profile-menu profile-menu--${variant}`;

  return (
    <div className={rootClass}>
      <div className="profile-menu__header">
        <div className="profile-menu__username">{displayName}</div>
        {!isGuest && user.email ? (
          <div className="profile-menu__email">{user.email}</div>
        ) : null}
        <div className="profile-menu__deck-count">{deckLabel}</div>
      </div>

      <div className="profile-menu__actions" role="menu">
        <button type="button" className="profile-menu__item" role="menuitem" onClick={handleCreateDeck}>
          <IconPlus /> Create New Deck
        </button>

        {canChangeAccountSettings ? (
          <>
            <button
              type="button"
              className={`profile-menu__item${openForm === 'email' ? ' is-active' : ''}`}
              role="menuitem"
              onClick={() => toggleForm('email')}
              aria-expanded={openForm === 'email'}
            >
              <IconSettings /> Change Email
            </button>
            {openForm === 'email' ? (
              <form className="profile-menu__subform" onSubmit={handleEmailSubmit}>
                <label className="profile-menu__field">
                  <span>New email</span>
                  <input
                    type="email"
                    value={emailValue}
                    onChange={(e) => setEmailValue(e.target.value)}
                    autoComplete="email"
                    required
                  />
                </label>
                {emailError ? <div className="profile-menu__error" role="alert">{emailError}</div> : null}
                <div className="profile-menu__subform-actions">
                  <button type="button" className="btn btn-ghost" onClick={() => setOpenForm(null)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary" disabled={emailBusy}>
                    {emailBusy ? 'Saving...' : 'Save'}
                  </button>
                </div>
              </form>
            ) : null}

            <button
              type="button"
              className={`profile-menu__item${openForm === 'password' ? ' is-active' : ''}`}
              role="menuitem"
              onClick={() => toggleForm('password')}
              aria-expanded={openForm === 'password'}
            >
              <IconLock /> Change Password
            </button>
            {openForm === 'password' ? (
              <form className="profile-menu__subform" onSubmit={handlePasswordSubmit}>
                <PasswordInput
                  id="profile-new-password"
                  label="New Password"
                  value={newPassword}
                  onChange={setNewPassword}
                />
                <PasswordInput
                  id="profile-confirm-password"
                  label="Confirm Password"
                  value={confirmPassword}
                  onChange={setConfirmPassword}
                />
                {showPasswordMismatch ? (
                  <div className="profile-menu__error" role="alert">Passwords do not match.</div>
                ) : null}
                {passwordError && !showPasswordMismatch ? (
                  <div className="profile-menu__error" role="alert">{passwordError}</div>
                ) : null}
                <div className="profile-menu__subform-actions">
                  <button type="button" className="btn btn-ghost" onClick={() => setOpenForm(null)}>
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={passwordBusy || !passwordsFilled || !passwordsMatch}
                  >
                    {passwordBusy ? 'Saving...' : 'Save'}
                  </button>
                </div>
              </form>
            ) : null}
          </>
        ) : null}

        <div className="profile-menu__divider" />
        <button
          type="button"
          className="profile-menu__item profile-menu__item--danger"
          role="menuitem"
          onClick={handleLogout}
        >
          <IconLogout /> {isGuest ? 'Exit Guest' : 'Log Out'}
        </button>
      </div>
    </div>
  );
}
