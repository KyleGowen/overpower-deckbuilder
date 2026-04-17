# API v1 — Body validation with `parseV1Body`

Phase 2 §6.1.7 of the external API client plan. A thin wrapper around `zod` `safeParse` that formats errors into the v1 envelope.

## Usage

```ts
import { z } from 'zod';
import { parseV1Body } from '../parseV1Body';

const MyBody = z.object({
  name: z.string().min(1),
  quantity: z.number().int().nonnegative()
});

router.post('/things', auth, (req, res) => {
  const parsed = parseV1Body(MyBody, req.body, res);
  if (!parsed) return; // 400 already sent with VALIDATION_ERROR per field

  const { name, quantity } = parsed.value;
  // ...
});
```

## Error shape

Every schema violation becomes one entry in `errors[]`:

```json
{
  "data": null,
  "meta": {},
  "errors": [
    { "code": "VALIDATION_ERROR", "message": "String must contain at least 1 character(s)", "field": "name" }
  ]
}
```

`field` is omitted when the path is the root of the body.

## Where schemas live

Zod schemas for mutation bodies go in [`src/api/http/models/<area>/<Name>.ts`](../../src/api/http/models) alongside the existing request-body helpers. New routes MUST call `parseV1Body`; see [`src/api/http/.cursorrules`](../../src/api/http/.cursorrules).

## Env vars / kill switches

- `DISABLE_ZOD_V1=1` — short-circuits to pass-through (the handler receives the raw body as `parsed.value`). Emits a `console.warn` each call so the rollout can verify it's off. Useful for isolating a routing bug from a validation bug during an incident.

## Validation plan

### Automated (unit)

- `tests/unit/parseV1Body.test.ts` — happy path, field-level error formatting, kill-switch pass-through.

## Rollback plan

1. `DISABLE_ZOD_V1=1` → per-route validation disabled for all routes.
2. Per-route revert: remove the `parseV1Body` call and its import; each call site is independent.

## Related docs

- [`API_V1_AUTH_REFRESH.md`](API_V1_AUTH_REFRESH.md) — `/auth/refresh` + `/auth/logout` use this helper.
- [`API_V1_RATE_LIMITS.md`](API_V1_RATE_LIMITS.md) — rate-limit 429 emits a similarly shaped error envelope.
