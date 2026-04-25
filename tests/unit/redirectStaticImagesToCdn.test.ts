/**
 * @jest-environment node
 */
import express from 'express';
import request from 'supertest';
import path from 'path';
import {
  redirectStaticImagesToCdn,
  shouldSkipCdnImageRedirect,
  buildStaticImageCdnRedirectUrl,
  setStaticAssetCacheHeaders,
} from '../../src/middleware/staticAssetCache';

function buildImageStaticApp() {
  const app = express();
  app.use(
    '/src/resources/images',
    redirectStaticImagesToCdn,
    express.static(path.join(process.cwd(), 'src', 'resources', 'images'), {
      setHeaders: setStaticAssetCacheHeaders,
    })
  );
  return app;
}

describe('shouldSkipCdnImageRedirect', () => {
  const mk = (hostname: string): express.Request => ({ hostname } as express.Request);

  it('returns true for origin.* hostnames (CloudFront custom origin)', () => {
    expect(shouldSkipCdnImageRedirect(mk('origin.excelsior.cards'))).toBe(true);
    expect(shouldSkipCdnImageRedirect(mk('origin.example.com'))).toBe(true);
  });

  it('returns false for public site hostnames (redirect to CDN is ok)', () => {
    expect(shouldSkipCdnImageRedirect(mk('excelsior.cards'))).toBe(false);
    expect(shouldSkipCdnImageRedirect(mk('www.excelsior.cards'))).toBe(false);
  });

  it('returns true for localhost and loopback', () => {
    expect(shouldSkipCdnImageRedirect(mk('localhost'))).toBe(true);
    expect(shouldSkipCdnImageRedirect(mk('127.0.0.1'))).toBe(true);
    expect(shouldSkipCdnImageRedirect(mk('[::1]'))).toBe(true);
  });

  it('returns true when Host matches the hostname of CDN_BASE_URL (no self-redirect)', () => {
    const prev = process.env.CDN_BASE_URL;
    process.env.CDN_BASE_URL = 'https://d6vp4hrkfkf5v.cloudfront.net';
    try {
      expect(shouldSkipCdnImageRedirect(mk('d6vp4hrkfkf5v.cloudfront.net'))).toBe(true);
    } finally {
      if (prev === undefined) {
        delete process.env.CDN_BASE_URL;
      } else {
        process.env.CDN_BASE_URL = prev;
      }
    }
  });

  it('returns true when STATIC_IMAGE_CDN_REDIRECT=0', () => {
    const prev = process.env.STATIC_IMAGE_CDN_REDIRECT;
    process.env.STATIC_IMAGE_CDN_REDIRECT = '0';
    try {
      expect(shouldSkipCdnImageRedirect(mk('api.example.com'))).toBe(true);
    } finally {
      if (prev === undefined) {
        delete process.env.STATIC_IMAGE_CDN_REDIRECT;
      } else {
        process.env.STATIC_IMAGE_CDN_REDIRECT = prev;
      }
    }
  });
});

describe('redirectStaticImagesToCdn middleware', () => {
  const cdn = 'https://d6vp4hrkfkf5v.cloudfront.net';
  const testPath = '/src/resources/images/icons/energy.png';
  let cdnBasePrev: string | undefined;
  let staticRedirectPrev: string | undefined;

  beforeAll(() => {
    cdnBasePrev = process.env.CDN_BASE_URL;
    staticRedirectPrev = process.env.STATIC_IMAGE_CDN_REDIRECT;
  });

  afterEach(() => {
    if (cdnBasePrev === undefined) {
      delete process.env.CDN_BASE_URL;
    } else {
      process.env.CDN_BASE_URL = cdnBasePrev;
    }
    if (staticRedirectPrev === undefined) {
      delete process.env.STATIC_IMAGE_CDN_REDIRECT;
    } else {
      process.env.STATIC_IMAGE_CDN_REDIRECT = staticRedirectPrev;
    }
  });

  it('serves 200 from disk when Host is origin.* (no redirect loop)', async () => {
    process.env.CDN_BASE_URL = cdn;
    expect(buildStaticImageCdnRedirectUrl(testPath, cdn)).toBe(
      'https://d6vp4hrkfkf5v.cloudfront.net/src/resources/images/icons/energy.png'
    );
    const res = await request(buildImageStaticApp())
      .get(testPath)
      .set('Host', 'origin.excelsior.cards');
    expect(res.status).toBe(200);
    expect(res.headers.location).toBeUndefined();
  });

  it('serves 200 from disk when Host is the CloudFront domain (no self-redirect)', async () => {
    process.env.CDN_BASE_URL = cdn;
    const res = await request(buildImageStaticApp())
      .get(testPath)
      .set('Host', 'd6vp4hrkfkf5v.cloudfront.net');
    expect(res.status).toBe(200);
    expect(res.headers.location).toBeUndefined();
  });

  it('returns 302 to CDN when Host is a non-origin hostname', async () => {
    process.env.CDN_BASE_URL = cdn;
    const res = await request(buildImageStaticApp())
      .get(testPath)
      .set('Host', 'direct-to-origin.internal');
    expect(res.status).toBe(302);
    expect(res.headers.location).toBe(
      'https://d6vp4hrkfkf5v.cloudfront.net/src/resources/images/icons/energy.png'
    );
  });
});
