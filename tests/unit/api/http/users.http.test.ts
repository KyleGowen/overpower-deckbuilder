import express, { type Request, type RequestHandler } from 'express';
import request from 'supertest';
import {
  registerUsersV1HttpRoutes,
  type UsersV1HttpDeps
} from '../../../../src/api/http/users.http';
import { UserAccountService } from '../../../../src/api/services/userAccountService';

const passAuth: RequestHandler = (req: Request, _res, next) => {
  (req as Request & { user?: { id: string; name: string; email: string; role: string } }).user = {
    id: 'user-1',
    name: 't',
    email: 't@example.com',
    role: 'USER'
  };
  next();
};

const guestAuth: RequestHandler = (req: Request, _res, next) => {
  (req as Request & { user?: { id: string; name: string; email: string; role: string } }).user = {
    id: 'guest-1',
    name: 'Guest',
    email: 'guest@example.com',
    role: 'GUEST'
  };
  next();
};

function buildApp(deps: UsersV1HttpDeps): express.Application {
  const app = express();
  app.use(express.json());
  const router = express.Router();
  registerUsersV1HttpRoutes(router, deps);
  app.use(router);
  return app;
}

function stubUserAccountService(over: Partial<UserAccountService> = {}): UserAccountService {
  return {
    changeEmail: jest.fn().mockResolvedValue({ ok: true, status: 200, data: { email: 'new@example.com' } }),
    changePassword: jest.fn().mockResolvedValue({ ok: true, status: 200, data: { message: 'Password updated' } }),
    ...over
  } as unknown as UserAccountService;
}

describe('users.http', () => {
  it('POST /users/change-email returns v1 envelope on success', async () => {
    const userAccountService = stubUserAccountService();
    const deps: UsersV1HttpDeps = { userAccountService, authenticateUser: passAuth };
    const res = await request(buildApp(deps))
      .post('/users/change-email')
      .send({ email: 'new@example.com' })
      .expect(200);
    expect(res.body.data).toEqual({ email: 'new@example.com' });
    expect(userAccountService.changeEmail).toHaveBeenCalledWith('user-1', 'USER', 'new@example.com');
  });

  it('POST /users/change-email validates body', async () => {
    const userAccountService = stubUserAccountService();
    const deps: UsersV1HttpDeps = { userAccountService, authenticateUser: passAuth };
    const res = await request(buildApp(deps)).post('/users/change-email').send({}).expect(400);
    expect(res.body.errors[0].field).toBe('email');
    expect(userAccountService.changeEmail).not.toHaveBeenCalled();
  });

  it('POST /users/change-email rejects guests', async () => {
    const userAccountService = stubUserAccountService();
    const deps: UsersV1HttpDeps = { userAccountService, authenticateUser: guestAuth };
    const res = await request(buildApp(deps))
      .post('/users/change-email')
      .send({ email: 'new@example.com' })
      .expect(403);
    expect(res.body.errors[0].code).toBe('FORBIDDEN');
    expect(userAccountService.changeEmail).not.toHaveBeenCalled();
  });

  it('POST /users/change-email maps service errors', async () => {
    const userAccountService = stubUserAccountService({
      changeEmail: jest.fn().mockResolvedValue({
        ok: false,
        status: 409,
        code: 'EMAIL_TAKEN',
        message: 'Email is already in use'
      })
    });
    const deps: UsersV1HttpDeps = { userAccountService, authenticateUser: passAuth };
    const res = await request(buildApp(deps))
      .post('/users/change-email')
      .send({ email: 'taken@example.com' })
      .expect(409);
    expect(res.body.errors[0].code).toBe('EMAIL_TAKEN');
  });

  it('POST /users/change-password returns v1 envelope on success', async () => {
    const userAccountService = stubUserAccountService();
    const deps: UsersV1HttpDeps = { userAccountService, authenticateUser: passAuth };
    const res = await request(buildApp(deps))
      .post('/users/change-password')
      .send({ newPassword: 'abc', confirmPassword: 'abc' })
      .expect(200);
    expect(res.body.data).toEqual({ message: 'Password updated' });
    expect(userAccountService.changePassword).toHaveBeenCalledWith('user-1', 'USER', 'abc', 'abc');
  });

  it('POST /users/change-password validates body', async () => {
    const userAccountService = stubUserAccountService();
    const deps: UsersV1HttpDeps = { userAccountService, authenticateUser: passAuth };
    const res = await request(buildApp(deps))
      .post('/users/change-password')
      .send({ newPassword: 'abc' })
      .expect(400);
    expect(res.body.errors.some((e: { field?: string }) => e.field === 'confirmPassword')).toBe(true);
    expect(userAccountService.changePassword).not.toHaveBeenCalled();
  });

  it('POST /users/change-password maps Google lock error', async () => {
    const userAccountService = stubUserAccountService({
      changePassword: jest.fn().mockResolvedValue({
        ok: false,
        status: 403,
        code: 'GOOGLE_PASSWORD_LOCKED',
        message: 'Password cannot be changed for Google-linked accounts'
      })
    });
    const deps: UsersV1HttpDeps = { userAccountService, authenticateUser: passAuth };
    const res = await request(buildApp(deps))
      .post('/users/change-password')
      .send({ newPassword: 'a', confirmPassword: 'a' })
      .expect(403);
    expect(res.body.errors[0].code).toBe('GOOGLE_PASSWORD_LOCKED');
  });

  it('POST /users/change-password maps mismatch error', async () => {
    const userAccountService = stubUserAccountService({
      changePassword: jest.fn().mockResolvedValue({
        ok: false,
        status: 400,
        code: 'PASSWORD_MISMATCH',
        message: 'Passwords do not match.'
      })
    });
    const deps: UsersV1HttpDeps = { userAccountService, authenticateUser: passAuth };
    const res = await request(buildApp(deps))
      .post('/users/change-password')
      .send({ newPassword: 'a', confirmPassword: 'b' })
      .expect(400);
    expect(res.body.errors[0].code).toBe('PASSWORD_MISMATCH');
  });

  it('POST /users/change-password returns 500 on unexpected error', async () => {
    const userAccountService = stubUserAccountService({
      changePassword: jest.fn().mockRejectedValue(new Error('db'))
    });
    const deps: UsersV1HttpDeps = { userAccountService, authenticateUser: passAuth };
    const res = await request(buildApp(deps))
      .post('/users/change-password')
      .send({ newPassword: 'a', confirmPassword: 'a' })
      .expect(500);
    expect(res.body.errors[0].code).toBe('CHANGE_PASSWORD_ERROR');
  });
});
