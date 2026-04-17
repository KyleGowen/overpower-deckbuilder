import type { NextFunction, Request, Response } from 'express';
import {
  createV1RateLimit,
  getDefaultBudgets,
  resetV1RateLimitBucketsForTests
} from '../../src/api/http/middleware/v1RateLimit';

function mockReq(opts: { userId?: string; ip?: string } = {}): Request {
  return {
    ip: opts.ip ?? '1.2.3.4',
    socket: { remoteAddress: opts.ip ?? '1.2.3.4' },
    user: opts.userId ? { id: opts.userId } : undefined
  } as unknown as Request;
}

function mockRes(): {
  res: Response;
  headers: Record<string, string>;
  statusCode: number;
  body: unknown;
} {
  const headers: Record<string, string> = {};
  let statusCode = 0;
  let body: unknown = undefined;
  const res = {
    setHeader: (name: string, value: string) => {
      headers[name] = value;
    },
    status: (code: number) => {
      statusCode = code;
      return res;
    },
    type: () => res,
    json: (payload: unknown) => {
      body = payload;
      return res;
    }
  } as unknown as Response;
  return {
    res,
    headers,
    get statusCode() {
      return statusCode;
    },
    get body() {
      return body;
    }
  };
}

describe('createV1RateLimit', () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    resetV1RateLimitBucketsForTests();
    delete process.env.DISABLE_V1_RATE_LIMIT;
    process.env.NODE_ENV = 'test';
  });

  afterEach(() => {
    process.env = { ...originalEnv };
  });

  it('emits X-RateLimit-* headers and counts down', () => {
    const mw = createV1RateLimit({
      routeKey: 'unit-test-budget',
      budget: { limit: 2, windowMs: 60_000 }
    });
    const req = mockReq();
    const m = mockRes();
    const next: NextFunction = jest.fn();

    mw(req, m.res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(m.headers['X-RateLimit-Limit']).toBe('2');
    expect(m.headers['X-RateLimit-Remaining']).toBe('1');
    expect(m.headers['X-RateLimit-Reset']).toMatch(/^\d+$/);
  });

  it('returns 429 once the budget is exhausted', () => {
    const mw = createV1RateLimit({
      routeKey: 'unit-test-exhaust',
      budget: { limit: 1, windowMs: 60_000 }
    });
    const req = mockReq();

    const m1 = mockRes();
    const n1: NextFunction = jest.fn();
    mw(req, m1.res, n1);
    expect(n1).toHaveBeenCalled();

    const m2 = mockRes();
    const n2: NextFunction = jest.fn();
    mw(req, m2.res, n2);

    expect(n2).not.toHaveBeenCalled();
    expect(m2.statusCode).toBe(429);
    expect(m2.headers['X-RateLimit-Remaining']).toBe('0');
    expect(m2.headers['Retry-After']).toMatch(/^\d+$/);
  });

  it('keys buckets separately per user when authenticated', () => {
    const mw = createV1RateLimit({
      routeKey: 'unit-test-per-user',
      budget: { limit: 1, windowMs: 60_000 }
    });
    const reqA = mockReq({ userId: 'user-A' });
    const reqB = mockReq({ userId: 'user-B' });
    const mA = mockRes();
    const mB = mockRes();
    const nA: NextFunction = jest.fn();
    const nB: NextFunction = jest.fn();

    mw(reqA, mA.res, nA);
    mw(reqB, mB.res, nB);

    expect(nA).toHaveBeenCalled();
    expect(nB).toHaveBeenCalled();
  });

  it('DISABLE_V1_RATE_LIMIT=1 short-circuits to pass-through', () => {
    process.env.DISABLE_V1_RATE_LIMIT = '1';
    const mw = createV1RateLimit({
      routeKey: 'unit-test-disabled',
      budget: { limit: 0, windowMs: 60_000 }
    });
    const req = mockReq();
    const m = mockRes();
    const next: NextFunction = jest.fn();

    mw(req, m.res, next);

    expect(next).toHaveBeenCalled();
    expect(m.headers['X-RateLimit-Limit']).toBeUndefined();
  });

  it('exposes default budgets', () => {
    const budgets = getDefaultBudgets();
    expect(budgets.default.limit).toBeGreaterThan(0);
    expect(budgets.login.limit).toBeGreaterThan(0);
  });
});
