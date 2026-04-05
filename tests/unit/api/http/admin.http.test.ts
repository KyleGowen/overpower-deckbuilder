import express, { type Request, type RequestHandler } from 'express';
import request from 'supertest';
import { registerAdminV1HttpRoutes, type AdminV1HttpDeps } from '../../../../src/api/http/admin.http';
import type { AdminService } from '../../../../src/api/services/adminService';

const adminAuth: RequestHandler = (req: Request, _res, next) => {
  (req as Request & { user?: unknown }).user = {
    id: 'admin-1',
    name: 'a',
    email: 'a@example.com',
    role: 'ADMIN'
  };
  next();
};

const userAuth: RequestHandler = (req: Request, _res, next) => {
  (req as Request & { user?: unknown }).user = {
    id: 'u1',
    name: 'u',
    email: 'u@example.com',
    role: 'USER'
  };
  next();
};

function buildApp(deps: AdminV1HttpDeps): express.Application {
  const app = express();
  app.use(express.json());
  const router = express.Router();
  registerAdminV1HttpRoutes(router, deps);
  app.use(router);
  return app;
}

function stubAdminService(over: Partial<AdminService> = {}): AdminService {
  return {
    listUsers: jest.fn().mockResolvedValue([
      { id: '1', name: 'n', email: 'n@e.com', role: 'USER', lastLoginAt: null }
    ]),
    createUser: jest.fn().mockResolvedValue({
      ok: true,
      user: { id: '2', name: 'new', email: 'new@example.com', role: 'USER', lastLoginAt: null }
    }),
    clearDeckCache: jest.fn(),
    clearCardCaches: jest.fn(),
    getDatabaseStatus: jest.fn().mockResolvedValue({
      status: 'OK' as const,
      database: { valid: true, upToDate: true, migrations: 'Flyway managed' }
    }),
    ...over
  } as unknown as AdminService;
}

describe('admin.http', () => {
  it('GET /admin/users returns 403 for non-admin', async () => {
    const svc = stubAdminService();
    const app = buildApp({ adminService: svc, authenticateUser: userAuth });
    const res = await request(app).get('/admin/users').expect(403);
    expect(res.body.errors[0].code).toBe('ADMIN_REQUIRED');
    expect(svc.listUsers).not.toHaveBeenCalled();
  });

  it('GET /admin/users lists users for admin', async () => {
    const svc = stubAdminService();
    const app = buildApp({ adminService: svc, authenticateUser: adminAuth });
    const res = await request(app).get('/admin/users').expect(200);
    expect(res.body.errors).toEqual([]);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data[0].name).toBe('n');
  });

  it('POST /admin/users creates user', async () => {
    const svc = stubAdminService();
    const app = buildApp({ adminService: svc, authenticateUser: adminAuth });
    const res = await request(app)
      .post('/admin/users')
      .send({ username: 'bob', password: 'secret' })
      .expect(201);
    expect(res.body.errors).toEqual([]);
    expect(res.body.data.name).toBe('new');
    expect(svc.createUser).toHaveBeenCalledWith('bob', 'secret');
  });

  it('POST /admin/users validates body', async () => {
    const svc = stubAdminService();
    const app = buildApp({ adminService: svc, authenticateUser: adminAuth });
    const res = await request(app).post('/admin/users').send({}).expect(400);
    expect(res.body.errors.length).toBeGreaterThan(0);
    expect(svc.createUser).not.toHaveBeenCalled();
  });

  it('GET /admin/debug/clear-cache', async () => {
    const svc = stubAdminService();
    const app = buildApp({ adminService: svc, authenticateUser: adminAuth });
    await request(app).get('/admin/debug/clear-cache').expect(200);
    expect(svc.clearDeckCache).toHaveBeenCalled();
  });

  it('GET /admin/database/status', async () => {
    const svc = stubAdminService();
    const app = buildApp({ adminService: svc, authenticateUser: adminAuth });
    const res = await request(app).get('/admin/database/status').expect(200);
    expect(res.body.data.status).toBe('OK');
    expect(res.body.data.database.valid).toBe(true);
  });
});
