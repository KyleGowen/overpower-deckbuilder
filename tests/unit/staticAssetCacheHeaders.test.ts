import express from 'express';
import request from 'supertest';
import { setStaticAssetCacheHeaders, SHORT_STATIC_CACHE_CONTROL, APP_SHELL_CACHE_CONTROL, buildStaticImageCdnRedirectUrl } from '../../src/middleware/staticAssetCache';
import { registerStaticAndHealthRoutes } from '../../src/routes/static-health.routes';

function buildStaticApp(): express.Application {
  const app = express();
  registerStaticAndHealthRoutes(app, {
    authenticateUser: (_req, _res, next) => next(),
    getGitInfo: () => ({
      commit: 'test',
      shortCommit: 'test',
      branch: 'test',
      commitDate: 'test',
      commitMessage: 'test',
      commitAuthor: 'test',
      commitEmail: 'test@example.com',
    }),
    dataSource: {
      getPool: () => ({
        connect: async () => ({
          query: async () => ({ rows: [] }),
          release: () => undefined,
        }),
        query: async () => ({ rows: [] }),
      }),
    },
  });
  return app;
}

describe('static asset cache headers', () => {
  it('serves JavaScript with a short public cache instead of no-store', async () => {
    const response = await request(buildStaticApp()).get('/js/card-image-utils.js');

    expect(response.status).toBe(200);
    expect(response.headers['cache-control']).toBe(SHORT_STATIC_CACHE_CONTROL);
    expect(response.headers.pragma).toBeUndefined();
    expect(response.headers.expires).toBeUndefined();
  });

  it('serves CSS, templates, and resource images with a short public cache', async () => {
    const app = buildStaticApp();

    await expect(request(app).get('/css/index.css')).resolves.toMatchObject({
      status: 200,
      headers: expect.objectContaining({ 'cache-control': SHORT_STATIC_CACHE_CONTROL }),
    });
    await expect(request(app).get('/templates/deck-editor-template.html')).resolves.toMatchObject({
      status: 200,
      headers: expect.objectContaining({ 'cache-control': SHORT_STATIC_CACHE_CONTROL }),
    });
    await expect(request(app).get('/src/resources/images/icons/energy.png')).resolves.toMatchObject({
      status: 200,
      headers: expect.objectContaining({ 'cache-control': SHORT_STATIC_CACHE_CONTROL }),
    });
  });

  it('keeps app-shell HTML no-store when served as a plain static file', () => {
    const headers = new Map<string, string>();
    const res = {
      setHeader: (name: string, value: string) => headers.set(name, value),
    } as unknown as express.Response;

    setStaticAssetCacheHeaders(res, '/repo/public/index.html');

    expect(headers.get('Cache-Control')).toBe(APP_SHELL_CACHE_CONTROL);
    expect(headers.get('Pragma')).toBe('no-cache');
    expect(headers.get('Expires')).toBe('0');
  });

  it('builds CDN redirects only for UI image assets when a CDN base is configured', () => {
    expect(buildStaticImageCdnRedirectUrl(
      '/src/resources/images/icons/energy.png',
      'https://d6vp4hrkfkf5v.cloudfront.net/',
    )).toBe('https://d6vp4hrkfkf5v.cloudfront.net/src/resources/images/icons/energy.png');
    expect(buildStaticImageCdnRedirectUrl(
      '/src/resources/cards/images/characters/anubis.webp',
      'https://d6vp4hrkfkf5v.cloudfront.net',
    )).toBeNull();
    expect(buildStaticImageCdnRedirectUrl('/src/resources/images/icons/energy.png', '')).toBeNull();
  });
});

describe('/health/ready', () => {
  it('returns OK with database status when SELECT 1 succeeds', async () => {
    const query = jest.fn().mockResolvedValue({ rows: [{ ok: 1 }] });
    const app = express();
    registerStaticAndHealthRoutes(app, {
      authenticateUser: (_req, _res, next) => next(),
      getGitInfo: () => ({
        commit: 'test',
        shortCommit: 'test',
        branch: 'test',
        commitDate: 'test',
        commitMessage: 'test',
        commitAuthor: 'test',
        commitEmail: 'test@example.com',
      }),
      dataSource: {
        getPool: () => ({
          connect: async () => ({
            query: async () => ({ rows: [] }),
            release: () => undefined,
          }),
          query,
        }),
      },
    });

    const response = await request(app).get('/health/ready');

    expect(response.status).toBe(200);
    expect(response.body.status).toBe('OK');
    expect(response.body.database).toEqual(expect.objectContaining({
      status: 'OK',
      connection: 'Active',
    }));
    expect(response.body.database.latency).toMatch(/^\d+ms$/);
    expect(query).toHaveBeenCalledWith('SELECT 1 AS ok');
  });

  it('returns DEGRADED when SELECT 1 fails', async () => {
    const query = jest.fn().mockRejectedValue(new Error('Connection terminated due to connection timeout'));
    const app = express();
    registerStaticAndHealthRoutes(app, {
      authenticateUser: (_req, _res, next) => next(),
      getGitInfo: () => ({
        commit: 'test',
        shortCommit: 'test',
        branch: 'test',
        commitDate: 'test',
        commitMessage: 'test',
        commitAuthor: 'test',
        commitEmail: 'test@example.com',
      }),
      dataSource: {
        getPool: () => ({
          connect: async () => ({
            query: async () => ({ rows: [] }),
            release: () => undefined,
          }),
          query,
        }),
      },
    });

    const response = await request(app).get('/health/ready');

    expect(response.status).toBe(200);
    expect(response.body.status).toBe('DEGRADED');
    expect(response.body.database.status).toBe('ERROR');
    expect(response.body.database.error).toContain('connection timeout');
  });
});
