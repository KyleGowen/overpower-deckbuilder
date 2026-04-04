import type { Application, Request, RequestHandler, Response, Router } from 'express';
import type { Pool } from 'pg';

/** Suffix Express path-to-regexp adds for non-ending mount paths: \/?(?=\/|$) */
const EXPRESS_MOUNT_SUFFIX = String.fromCharCode(92, 47, 63, 40, 63, 61, 92, 47, 124, 36, 41);

type LayerLike = {
  handle?: unknown;
  route?: { path: string; methods: Record<string, boolean> };
  regexp: RegExp & { fast_slash?: boolean; fast_star?: boolean };
  keys: { name: string }[];
};

function isExpressRouter(handle: unknown): handle is Router {
  return typeof handle === 'function' && 'stack' in handle && Array.isArray((handle as Router).stack);
}

function joinPaths(base: string, segment: string): string {
  if (!segment || segment === '/') {
    return base || '/';
  }
  if (!base || base === '/') {
    return segment.startsWith('/') ? segment : `/${segment}`;
  }
  return `${base.replace(/\/$/, '')}${segment.startsWith('/') ? segment : `/${segment}`}`;
}

export function normalizeEndpointPath(path: string): string {
  if (!path || path === '') {
    return '/';
  }
  return path.replace(/\/+/g, '/');
}

/**
 * Mount path for a Layer wrapping a Router (no route), e.g. /api/v1 or /prefix/:foo.
 */
function getRouterMountPath(layer: LayerLike): string {
  const r = layer.regexp;
  if (r.fast_slash) {
    return '/';
  }
  if (r.fast_star) {
    return '/*';
  }
  const keys = layer.keys || [];
  const src = r.source;
  if (keys.length > 0) {
    const idx = src.indexOf('(?:');
    let prefix = idx === -1 ? src : src.slice(0, idx);
    prefix = prefix.replace(/^\^/, '').replace(/\\\//g, '/');
    if (!prefix.startsWith('/')) {
      prefix = `/${prefix}`;
    }
    let p = prefix.replace(/\/$/, '');
    for (const k of keys) {
      p += `/:${k.name}`;
    }
    return p;
  }
  let body = src.startsWith('^') ? src.slice(1) : src;
  if (body.endsWith(EXPRESS_MOUNT_SUFFIX)) {
    body = body.slice(0, -EXPRESS_MOUNT_SUFFIX.length);
  }
  const path = body.replace(/\\\//g, '/');
  if (!path.startsWith('/')) {
    return `/${path}`;
  }
  return path;
}

function walk(stack: LayerLike[], basePath: string, out: Set<string>): void {
  for (const layer of stack) {
    if (layer.route) {
      const fullPath = normalizeEndpointPath(joinPaths(basePath, layer.route.path));
      const methods = layer.route.methods;
      if (methods._all) {
        for (const m of ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS', 'HEAD']) {
          out.add(`${m} ${fullPath}`);
        }
      } else {
        for (const method of Object.keys(methods)) {
          if (method === '_all') {
            continue;
          }
          if (methods[method]) {
            out.add(`${method.toUpperCase()} ${fullPath}`);
          }
        }
        if (methods.get && !methods.head) {
          out.add(`HEAD ${fullPath}`);
        }
      }
    } else if (isExpressRouter(layer.handle)) {
      const mount = getRouterMountPath(layer);
      const nextBase = mount === '/' ? basePath : joinPaths(basePath, mount);
      walk(layer.handle.stack as unknown as LayerLike[], nextBase, out);
    }
  }
}

/**
 * Lists canonical endpoint keys for all Express-registered routes (METHOD + path pattern).
 */
export function enumerateExpressRoutes(app: Application): string[] {
  const root = (app as unknown as { _router?: { stack: LayerLike[] } })._router;
  if (!root?.stack) {
    return [];
  }
  const out = new Set<string>();
  walk(root.stack, '', out);
  return Array.from(out).sort();
}

export function buildEndpointMetricKey(
  req: Pick<Request, 'method' | 'baseUrl'> & { route?: { path: string } }
): string | null {
  if (!req.route) {
    return null;
  }
  const path = normalizeEndpointPath(`${req.baseUrl}${req.route.path}`);
  return `${req.method.toUpperCase()} ${path}`;
}

const UPSERT_HIT_SQL = `
INSERT INTO endpoint_hit_counts (endpoint_key, hit_count, last_hit_at)
VALUES ($1, 1, CURRENT_TIMESTAMP)
ON CONFLICT (endpoint_key)
DO UPDATE SET
  hit_count = endpoint_hit_counts.hit_count + 1,
  last_hit_at = CURRENT_TIMESTAMP
`;

export async function seedEndpointHitCounts(pool: Pool, keys: string[]): Promise<void> {
  if (keys.length === 0) {
    return;
  }
  await pool.query(
    `INSERT INTO endpoint_hit_counts (endpoint_key, hit_count, last_hit_at)
     SELECT unnest($1::text[]), 0, NULL
     ON CONFLICT (endpoint_key) DO NOTHING`,
    [keys]
  );
}

export function createEndpointHitMetricsMiddleware(pool: Pool): RequestHandler {
  return (_req: Request, res: Response, next: () => void) => {
    const req = _req;
    res.on('finish', () => {
      const key = buildEndpointMetricKey(req);
      if (!key) {
        return;
      }
      setImmediate(() => {
        pool.query(UPSERT_HIT_SQL, [key]).catch((err: unknown) => {
          console.error('endpoint hit metrics upsert failed:', err);
        });
      });
    });
    next();
  };
}
