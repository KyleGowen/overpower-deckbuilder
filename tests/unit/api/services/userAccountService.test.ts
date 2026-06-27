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
});
