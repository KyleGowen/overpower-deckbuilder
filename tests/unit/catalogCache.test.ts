import type { Request, Response } from 'express';
import {
  bumpCatalogDataVersion,
  getCatalogDataVersion,
  parseSinceVersionQuery,
  resetCatalogDataVersionForTests,
  sendCachedCatalogResponse
} from '../../src/api/http/catalogCache';

function mockReq(headers: Record<string, string> = {}, query: Record<string, string> = {}): Request {
  const lowered: Record<string, string> = {};
  for (const [k, v] of Object.entries(headers)) lowered[k.toLowerCase()] = v;
  return { headers: lowered, query } as unknown as Request;
}

function mockRes(): {
  res: Response;
  headers: Record<string, string>;
  statusCode: number;
  body: string | undefined;
} {
  const headers: Record<string, string> = {};
  let statusCode = 0;
  let body: string | undefined;
  const res = {
    set: (name: string, value: string) => {
      headers[name] = value;
      return res;
    },
    status: (code: number) => {
      statusCode = code;
      return res;
    },
    type: () => res,
    send: (payload: string) => {
      body = payload;
      return res;
    },
    end: () => {
      body = '';
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

describe('catalogCache', () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    process.env.NODE_ENV = 'test';
    delete process.env.DISABLE_CATALOG_CACHE_HEADERS;
    delete process.env.DISABLE_SINCE_SYNC;
    resetCatalogDataVersionForTests();
  });

  afterEach(() => {
    process.env = { ...originalEnv };
  });

  it('emits Cache-Control and ETag on the first response', () => {
    const req = mockReq();
    const m = mockRes();

    sendCachedCatalogResponse(req, m.res, [{ id: 'a' }]);

    expect(m.statusCode).toBe(200);
    expect(m.headers['Cache-Control']).toMatch(/public, max-age=300/);
    expect(m.headers['ETag']).toMatch(/^"\d+-[0-9a-f]+"$/);
    expect(m.headers['Vary']).toBe('Accept-Encoding');
    const envelope = JSON.parse(m.body!);
    expect(envelope.data).toEqual([{ id: 'a' }]);
    expect(envelope.meta.catalogDataVersion).toBe(1);
  });

  it('returns 304 when If-None-Match matches', () => {
    const first = mockRes();
    sendCachedCatalogResponse(mockReq(), first.res, ['x']);
    const etag = first.headers['ETag'];

    const second = mockRes();
    const sent304 = sendCachedCatalogResponse(
      mockReq({ 'if-none-match': etag }),
      second.res,
      ['x']
    );

    expect(sent304).toBe(true);
    expect(second.statusCode).toBe(304);
  });

  it('DISABLE_CATALOG_CACHE_HEADERS=1 emits no-store and skips 304', () => {
    process.env.DISABLE_CATALOG_CACHE_HEADERS = '1';
    const m = mockRes();
    const sent304 = sendCachedCatalogResponse(mockReq(), m.res, []);
    expect(sent304).toBe(false);
    expect(m.headers['Cache-Control']).toBe('no-store');
    expect(m.headers['ETag']).toBeUndefined();
  });

  it('parseSinceVersionQuery parses only well-formed integers', () => {
    expect(parseSinceVersionQuery(mockReq({}, { since_version: '5' }))).toBe(5);
    expect(parseSinceVersionQuery(mockReq({}, { since_version: 'abc' }))).toBeNull();
    expect(parseSinceVersionQuery(mockReq({}, {}))).toBeNull();
  });

  it('DISABLE_SINCE_SYNC=1 ignores since_version', () => {
    process.env.DISABLE_SINCE_SYNC = '1';
    expect(parseSinceVersionQuery(mockReq({}, { since_version: '5' }))).toBeNull();
  });

  it('bumpCatalogDataVersion increments and changes ETag prefix', () => {
    const before = getCatalogDataVersion();
    const m1 = mockRes();
    sendCachedCatalogResponse(mockReq(), m1.res, ['a']);

    const after = bumpCatalogDataVersion();
    expect(after).toBe(before + 1);

    const m2 = mockRes();
    sendCachedCatalogResponse(mockReq(), m2.res, ['a']);
    expect(m1.headers['ETag']).not.toBe(m2.headers['ETag']);
  });
});
