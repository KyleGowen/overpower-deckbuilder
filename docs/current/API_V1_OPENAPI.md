# API v1 — OpenAPI spec

The OpenAPI 3 spec for the Excelsior `/api/v1` surface lives at
[`docs/openapi.yaml`](../openapi.yaml). It is a stub maintained by hand
alongside [`API_V1.md`](../../API_V1.md) and the error catalog
([`API_V1_ERROR_CATALOG.md`](API_V1_ERROR_CATALOG.md)).

## Where it lives

- Source of truth: `docs/openapi.yaml`.
- Security: declares a single `bearerAuth` HTTP scheme (JWT). Endpoints
  that are session-or-Bearer use the same security requirement; session
  cookies are not modeled because they are an implementation detail for
  the first-party frontend.
- Shared schemas: `Envelope`, `Meta`, `ErrorBody`, `LoginRequest`,
  `LoginSuccess`, `RefreshRequest`, `LogoutRequest`, `User`, `Deck`,
  `Card`. The catalog/deck data shapes deliberately use
  `additionalProperties: true` until the DTOs stabilize; see the
  TypeScript DTO sources under `src/api/dto/v1/` for the current shape.

## How to update

Any PR that changes `/api/v1` must also:

1. Update `docs/openapi.yaml` (new path, parameters, or response codes).
2. Add or update the entry in
   [`API_V1_ERROR_CATALOG.md`](API_V1_ERROR_CATALOG.md) if new error codes
   are emitted.
3. Add a line to [`API_V1_CHANGELOG.md`](API_V1_CHANGELOG.md).
4. Update [`API_V1.md`](../../API_V1.md) with the contract text.

## Validation

Locally:

```bash
npx @redocly/cli lint docs/openapi.yaml
```

Or:

```bash
npx swagger-cli validate docs/openapi.yaml
```

Neither tool is currently wired into CI; it is fine to run either one
before shipping contract changes.

## Client SDK generation

External clients can feed `docs/openapi.yaml` into any OpenAPI generator
(e.g. `openapi-generator`, `orval`, `openapi-typescript`). Because the
DTOs use `additionalProperties: true`, generated clients will treat
`data` as loosely typed for now; tighten schemas as we stabilize.

## Related docs

- [`API_V1.md`](../../API_V1.md) — human-readable contract.
- [`API_V1_ERROR_CATALOG.md`](API_V1_ERROR_CATALOG.md)
- [`API_V1_CHANGELOG.md`](API_V1_CHANGELOG.md)
- [`API_V1_CATALOG_CACHING.md`](API_V1_CATALOG_CACHING.md)
- [`API_V1_IMAGE_CONTRACT.md`](API_V1_IMAGE_CONTRACT.md)
