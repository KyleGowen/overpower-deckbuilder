import express, { Request } from 'express';
import type { UsersDebugRoutesDeps } from './types';

/** Legacy user self-service only; admin list/create/debug/database moved to `/api/v1/admin/*`. */
export function registerUsersDebugRoutes(app: express.Application, deps: UsersDebugRoutesDeps): void {
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
