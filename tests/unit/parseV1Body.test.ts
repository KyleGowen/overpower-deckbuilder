import type { Response } from 'express';
import { z } from 'zod';
import { parseV1Body } from '../../src/api/http/parseV1Body';

function mockRes(): {
  res: Response;
  statusCode: number;
  body: unknown;
} {
  let statusCode = 0;
  let body: unknown = undefined;
  const res = {
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
    get statusCode() {
      return statusCode;
    },
    get body() {
      return body;
    }
  };
}

describe('parseV1Body', () => {
  const originalEnv = { ...process.env };
  const Schema = z.object({
    name: z.string().min(1),
    count: z.number().int().nonnegative()
  });

  beforeEach(() => {
    delete process.env.DISABLE_ZOD_V1;
  });

  afterEach(() => {
    process.env = { ...originalEnv };
  });

  it('returns parsed value on success', () => {
    const m = mockRes();
    const parsed = parseV1Body(Schema, { name: 'ok', count: 2 }, m.res);
    expect(parsed).not.toBeNull();
    expect(parsed!.value).toEqual({ name: 'ok', count: 2 });
    expect(m.statusCode).toBe(0);
  });

  it('sends 400 with VALIDATION_ERROR when the body is malformed', () => {
    const m = mockRes();
    const parsed = parseV1Body(Schema, { name: '', count: -1 }, m.res);
    expect(parsed).toBeNull();
    expect(m.statusCode).toBe(400);
    const envelope = m.body as { errors: { code: string; field?: string }[] };
    expect(envelope.errors.length).toBeGreaterThan(0);
    expect(envelope.errors[0].code).toBe('VALIDATION_ERROR');
    expect(envelope.errors[0].field).toBeDefined();
  });

  it('DISABLE_ZOD_V1=1 bypasses parse', () => {
    process.env.DISABLE_ZOD_V1 = '1';
    const m = mockRes();
    const parsed = parseV1Body(Schema, { anything: true }, m.res);
    expect(parsed).not.toBeNull();
    expect(m.statusCode).toBe(0);
  });
});
