import express, { Request } from 'express';
import type { UsersDebugRoutesDeps } from './types';

export function registerUsersDebugRoutes(app: express.Application, deps: UsersDebugRoutesDeps): void {
  app.get('/api/users', deps.authenticateUser, async (req: Request, res) => {
    try {
      if (!deps.requireAdmin(req, res)) return;
      const users = await deps.userRepository.getAllUsers();
      res.json({ success: true, data: users });
    } catch {
      res.status(500).json({ success: false, error: 'Failed to fetch users' });
    }
  });

  app.get('/api/debug/clear-cache', deps.authenticateUser, async (req: Request, res) => {
    try {
      if (!deps.requireAdmin(req, res)) return;
      (deps.deckRepository as unknown as { clearCache: () => void }).clearCache();
      res.json({ success: true, message: 'Deck cache cleared' });
    } catch {
      res.status(500).json({ success: false, error: 'Failed to clear cache' });
    }
  });

  app.get('/api/debug/clear-card-cache', deps.authenticateUser, async (req: Request, res) => {
    try {
      if (!deps.requireAdmin(req, res)) return;
      (deps.cardRepository as unknown as { clearCaches: () => void }).clearCaches();
      res.json({ success: true, message: 'Card repository cache cleared' });
    } catch {
      res.status(500).json({ success: false, error: 'Failed to clear card cache' });
    }
  });

  app.post('/api/users', deps.authenticateUser, async (req: Request, res) => {
    try {
      if (!deps.requireAdmin(req, res)) return;
      const { username, password } = req.body;

      if (!username || !password) {
        return res.status(400).json({ success: false, error: 'Username and password are required' });
      }

      const existingUser = await deps.userRepository.getUserByUsername(username);
      if (existingUser) {
        return res.status(409).json({ success: false, error: 'Username already exists' });
      }

      const newUser = await deps.userRepository.createUser(username, `${username}@example.com`, password, 'USER');

      const { password_hash: _password_hash, ...userWithoutPassword } = newUser as unknown as Record<string, unknown>;

      res.status(201).json({
        success: true,
        data: userWithoutPassword,
        message: `User "${username}" created successfully`
      });
    } catch (error) {
      console.error('Error creating user:', error);
      res.status(500).json({ success: false, error: 'Failed to create user' });
    }
  });

  app.post('/api/users/change-password', deps.authenticateUser, async (req: Request, res) => {
    try {
      const currentUser = req.user;
      if (!currentUser || (currentUser.role !== 'USER' && currentUser.role !== 'ADMIN')) {
        return res.status(403).json({ success: false, error: 'Only USER or ADMIN may change password' });
      }

      const { newPassword } = req.body;
      if (!newPassword || typeof newPassword !== 'string') {
        return res.status(400).json({ success: false, error: 'New password is required' });
      }

      const updated = await deps.userRepository.updateUserPassword(currentUser.id, newPassword);
      if (!updated) {
        return res.status(404).json({ success: false, error: 'User not found' });
      }
      res.json({ success: true, message: 'Password updated' });
    } catch (error) {
      console.error('Error changing password:', error);
      res.status(500).json({ success: false, error: 'Failed to change password' });
    }
  });
}
