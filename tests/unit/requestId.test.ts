import { createRequestIdMiddleware } from '../../src/middleware/requestId';
import type { Request, Response, NextFunction } from 'express';

type Headers = Record<string, string | undefined>;

function mockReq(headers: Headers = {}): Request {
  return {
    header(name: string) {
      return headers[name.toLowerCase()];
    },
  } as unknown as Request;
}

function mockRes() {
  const setHeaders: Record<string, unknown> = {};
  const res = {
    setHeader(name: string, value: unknown) {
      setHeaders[name] = value;
    },
  } as unknown as Response;
  return { res, setHeaders };
}

describe('createRequestIdMiddleware', () => {
  function getId(req: Request): string {
    return (req as Request & { id?: string }).id ?? '';
  }

  it('generates a UUIDv4 when no header is present', () => {
    const mw = createRequestIdMiddleware();
    const req = mockReq();
    const { res, setHeaders } = mockRes();
    const next: NextFunction = jest.fn();

    mw(req, res, next);

    expect(next).toHaveBeenCalled();
    const id = getId(req);
    expect(id).toMatch(/^[0-9a-f-]{36}$/);
    expect(setHeaders['X-Request-Id']).toBe(id);
  });

  it('preserves a safe incoming X-Request-Id', () => {
    const mw = createRequestIdMiddleware();
    const req = mockReq({ 'x-request-id': 'probe-123_abc' });
    const { res, setHeaders } = mockRes();
    const next: NextFunction = jest.fn();

    mw(req, res, next);

    const id = getId(req);
    expect(id).toBe('probe-123_abc');
    expect(setHeaders['X-Request-Id']).toBe('probe-123_abc');
  });

  it('rejects and regenerates when incoming id contains unsafe chars', () => {
    const mw = createRequestIdMiddleware();
    const req = mockReq({ 'x-request-id': '<script>' });
    const { res } = mockRes();
    const next: NextFunction = jest.fn();

    mw(req, res, next);

    const id = getId(req);
    expect(id).not.toBe('<script>');
    expect(id).toMatch(/^[0-9a-f-]{36}$/);
  });

  it('rejects and regenerates when incoming id is too long', () => {
    const mw = createRequestIdMiddleware();
    const req = mockReq({ 'x-request-id': 'a'.repeat(200) });
    const { res } = mockRes();
    const next: NextFunction = jest.fn();

    mw(req, res, next);

    const id = getId(req);
    expect(id.length).toBe(36);
  });
});
