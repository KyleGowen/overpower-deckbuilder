import express, { Request } from 'express';
import type { UsersDebugRoutesDeps } from './types';

/** Legacy user self-service only; admin list/create/debug/database moved to `/api/v1/admin/*`. */
export function registerUsersDebugRoutes(app: express.Application, deps: UsersDebugRoutesDeps): void {
  app.post('/api/users/change-password', deps.authenticateUser, async (req: Request, res) => {
    try {
      const currentUser = req.user;
      if (!currentUser) {
        return res.status(401).json({ success: false, error: 'Authentication required' });
      }

      const { newPassword, confirmPassword } = req.body;
      const result = await deps.userAccountService.changePassword(
        currentUser.id,
        currentUser.role,
        newPassword,
        typeof confirmPassword === 'string' && confirmPassword.length > 0
          ? confirmPassword
          : newPassword
      );

      if (!result.ok) {
        return res.status(result.status).json({ success: false, error: result.message });
      }

      res.json({ success: true, message: result.data.message });
    } catch (error) {
      console.error('Error changing password:', error);
      res.status(500).json({ success: false, error: 'Failed to change password' });
    }
  });
}
