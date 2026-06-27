import { UserAccountService } from '../../../../src/api/services/userAccountService';
import type { User } from '../../../../src/types';

const baseUser: User = {
  id: 'user-1',
  name: 'tester',
  email: 'old@example.com',
  role: 'USER'
};

function stubRepo(over: Partial<{
  getUserById: jest.Mock;
  getUserByEmail: jest.Mock;
  getUserByUsername: jest.Mock;
  getUserAuthMeta: jest.Mock;
  updateUser: jest.Mock;
  updateUserPassword: jest.Mock;
}> = {}) {
  return {
    getUserById: jest.fn().mockResolvedValue(baseUser),
    getUserByEmail: jest.fn().mockResolvedValue(undefined),
    getUserByUsername: jest.fn().mockResolvedValue(undefined),
    getUserAuthMeta: jest.fn().mockResolvedValue({ auth_provider: null }),
    updateUser: jest.fn().mockResolvedValue({ ...baseUser, email: 'new@example.com' }),
    updateUserPassword: jest.fn().mockResolvedValue(true),
    ...over
  };
}

describe('UserAccountService', () => {
  describe('changeEmail', () => {
    it('rejects guests', async () => {
      const service = new UserAccountService(stubRepo());
      const result = await service.changeEmail('user-1', 'GUEST', 'a@b.com');
      expect(result.ok).toBe(false);
      if (!result.ok) expect(result.status).toBe(403);
    });

    it('rejects empty email', async () => {
      const service = new UserAccountService(stubRepo());
      const result = await service.changeEmail('user-1', 'USER', '   ');
      expect(result.ok).toBe(false);
      if (!result.ok) expect(result.code).toBe('EMAIL_REQUIRED');
    });

    it('rejects invalid email format', async () => {
      const service = new UserAccountService(stubRepo());
      const result = await service.changeEmail('user-1', 'USER', 'not-an-email');
      expect(result.ok).toBe(false);
      if (!result.ok) expect(result.code).toBe('EMAIL_INVALID');
    });

    it('rejects unchanged email', async () => {
      const service = new UserAccountService(stubRepo());
      const result = await service.changeEmail('user-1', 'USER', 'old@example.com');
      expect(result.ok).toBe(false);
      if (!result.ok) expect(result.code).toBe('EMAIL_UNCHANGED');
    });

    it('rejects Google-linked accounts', async () => {
      const repo = stubRepo({
        getUserAuthMeta: jest.fn().mockResolvedValue({ auth_provider: 'google' })
      });
      const service = new UserAccountService(repo);
      const result = await service.changeEmail('user-1', 'USER', 'new@example.com');
      expect(result.ok).toBe(false);
      if (!result.ok) expect(result.code).toBe('GOOGLE_EMAIL_LOCKED');
    });

    it('rejects taken email', async () => {
      const repo = stubRepo({
        getUserByEmail: jest.fn().mockResolvedValue({ ...baseUser, id: 'other' })
      });
      const service = new UserAccountService(repo);
      const result = await service.changeEmail('user-1', 'USER', 'taken@example.com');
      expect(result.ok).toBe(false);
      if (!result.ok) expect(result.code).toBe('EMAIL_TAKEN');
    });

    it('updates email on success', async () => {
      const repo = stubRepo();
      const service = new UserAccountService(repo);
      const result = await service.changeEmail('user-1', 'USER', 'new@example.com');
      expect(result.ok).toBe(true);
      if (result.ok) expect(result.data.email).toBe('new@example.com');
      expect(repo.updateUser).toHaveBeenCalledWith('user-1', { email: 'new@example.com' });
    });
  });

  describe('changePassword', () => {
    it('rejects guests', async () => {
      const service = new UserAccountService(stubRepo());
      const result = await service.changePassword('user-1', 'GUEST', 'a', 'a');
      expect(result.ok).toBe(false);
      if (!result.ok) expect(result.status).toBe(403);
    });

    it('rejects password mismatch', async () => {
      const service = new UserAccountService(stubRepo());
      const result = await service.changePassword('user-1', 'USER', 'abc', 'xyz');
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.code).toBe('PASSWORD_MISMATCH');
        expect(result.message).toBe('Passwords do not match.');
      }
    });

    it('rejects Google-linked accounts', async () => {
      const repo = stubRepo({
        getUserAuthMeta: jest.fn().mockResolvedValue({ auth_provider: 'google' })
      });
      const service = new UserAccountService(repo);
      const result = await service.changePassword('user-1', 'USER', 'newpass', 'newpass');
      expect(result.ok).toBe(false);
      if (!result.ok) expect(result.code).toBe('GOOGLE_PASSWORD_LOCKED');
      expect(repo.updateUserPassword).not.toHaveBeenCalled();
    });

    it('updates password on success', async () => {
      const repo = stubRepo();
      const service = new UserAccountService(repo);
      const result = await service.changePassword('user-1', 'USER', 'newpass', 'newpass');
      expect(result.ok).toBe(true);
      expect(repo.updateUserPassword).toHaveBeenCalledWith('user-1', 'newpass');
    });
  });

  describe('setDisplayName', () => {
    it('rejects guests', async () => {
      const service = new UserAccountService(stubRepo());
      const result = await service.setDisplayName('user-1', 'GUEST', 'New Name');
      expect(result.ok).toBe(false);
      if (!result.ok) expect(result.status).toBe(403);
    });

    it('rejects empty display name', async () => {
      const service = new UserAccountService(stubRepo());
      const result = await service.setDisplayName('user-1', 'USER', '   ');
      expect(result.ok).toBe(false);
      if (!result.ok) expect(result.code).toBe('DISPLAY_NAME_REQUIRED');
    });

    it('password user: renames the username and reports resolved name', async () => {
      const repo = stubRepo({
        updateUser: jest.fn().mockResolvedValue({ ...baseUser, name: 'NewName' }),
      });
      const service = new UserAccountService(repo);
      const result = await service.setDisplayName('user-1', 'USER', 'NewName');
      expect(result.ok).toBe(true);
      expect(repo.updateUser).toHaveBeenCalledWith('user-1', { name: 'NewName' });
      if (result.ok) {
        expect(result.data.username).toBe('NewName');
        expect(result.data.displayName).toBeNull();
        expect(result.data.resolvedName).toBe('NewName');
      }
    });

    it('password user: rejects a username already taken by someone else', async () => {
      const repo = stubRepo({
        getUserByUsername: jest.fn().mockResolvedValue({ ...baseUser, id: 'other' }),
      });
      const service = new UserAccountService(repo);
      const result = await service.setDisplayName('user-1', 'USER', 'taken');
      expect(result.ok).toBe(false);
      if (!result.ok) expect(result.code).toBe('USERNAME_TAKEN');
      expect(repo.updateUser).not.toHaveBeenCalled();
    });

    it('password user: keeping the same username does not check uniqueness', async () => {
      const repo = stubRepo({
        getUserById: jest.fn().mockResolvedValue({ ...baseUser, name: 'tester' }),
        updateUser: jest.fn().mockResolvedValue({ ...baseUser, name: 'tester' }),
      });
      const service = new UserAccountService(repo);
      const result = await service.setDisplayName('user-1', 'USER', 'tester');
      expect(result.ok).toBe(true);
      expect(repo.getUserByUsername).not.toHaveBeenCalled();
    });

    it('SSO user: sets display_name only (no rename) and resolves to it', async () => {
      const ssoUser: User = {
        ...baseUser,
        name: 'sso-login',
        email: 'sso@b.com',
        authProvider: 'google',
      };
      const repo = stubRepo({
        getUserById: jest.fn().mockResolvedValue(ssoUser),
        getUserAuthMeta: jest.fn().mockResolvedValue({ auth_provider: 'google' }),
        updateUser: jest
          .fn()
          .mockResolvedValue({ ...ssoUser, displayName: 'SSO Display' }),
      });
      const service = new UserAccountService(repo);
      const result = await service.setDisplayName('user-1', 'USER', 'SSO Display');
      expect(result.ok).toBe(true);
      expect(repo.updateUser).toHaveBeenCalledWith('user-1', { displayName: 'SSO Display' });
      if (result.ok) {
        expect(result.data.displayName).toBe('SSO Display');
        expect(result.data.resolvedName).toBe('SSO Display');
      }
      expect(repo.getUserByUsername).not.toHaveBeenCalled();
    });
  });
});
