# Production Performance Triage — verification log

Automated/CLI probes against live production. Re-run after deploy or Terraform apply and update the **Date** line.

**Date of probes:** 2026-04-25 (all times GMT from response headers)

## Summary

| Check | Result |
|--------|--------|
| `GET /js/app-config.js` on `http://excelsior.cards` | **Pass** — body sets `window.APP_CDN_BASE = "https://d6vp4hrkfkf5v.cloudfront.net"`, `Cache-Control: public, max-age=300` |
| `GET /src/resources/images/icons/energy.png` on origin | **Findings** — `Server: nginx`, `Content-Length: 470936` (large legacy asset), `Cache-Control: public, max-age=0` — traffic to the **site hostname** is still EC2; short-cache / optimized assets in repo are not reflected here if deploy did not update the box |
| Same icon via **`https://d6vp4hrkfkf5v.cloudfront.net/.../energy.png`** | **Findings** — `via: ...cloudfront.net (CloudFront)`, `x-cache: Miss from cloudfront` (or Hit after warm-up), but **`server: nginx/1.28.0`**, `content-length: 470936`, `cache-control: public, max-age=0` — the **origin behind CloudFront for this path is still nginx (EC2)**, not S3. The ordered cache behavior in [`infra/cloudfront.tf`](../../infra/cloudfront.tf) that routes `/src/resources/images/*` to the S3 origin does **not** appear to be applied in the live distribution, **or** the behavior exists but the origin is still the wrong target until Terraform is applied. |
| S3 as origin (sanity) | A card path that does not match an object can return `Server: AmazonS3` with 403, confirming the distribution **can** use S3 for paths under the card-images rules — different from the UI icon response. |

**Conclusion:** Push 2’s **app-config** short cache is **live** on production. Pushes 3+5+Terraform for **offloading UI images to S3/CloudFront with immutable cache** are **not fully realized at the edge** for `/src/resources/images/*` until `terraform apply` updates the live CloudFront configuration (and CI has synced optimized assets to S3 for that path).

## Commands (copy-paste)

```bash
# App shell config + cache
curl -s "http://excelsior.cards/js/app-config.js"
curl -sI "http://excelsior.cards/js/app-config.js" | tr -d '\r'

# UI icon: direct origin
curl -sI "http://excelsior.cards/src/resources/images/icons/energy.png" | tr -d '\r'

# Same path via CloudFront (what clients use for prefixed asset URLs)
curl -sI "https://d6vp4hrkfkf5v.cloudfront.net/src/resources/images/icons/energy.png" | tr -d '\r'
```

**Browser smoke (still recommended):** DevTools → Network, load the app with a deck in card view; filter images and confirm WebP thumb requests and sizes after Terraform + deploy catch up with repo.

## Follow-up (ops)

1. From repo root, in the environment that manages AWS: `terraform -chdir=infra plan` (or your wrapper) and **apply** if the diff shows the `/src/resources/images/*` ordered cache behavior not yet in state.
2. Run or verify the last **Deploy** workflow on `main` (S3 sync for `src/resources/images/` and Docker deploy).
3. If CloudFront was updated, optional invalidation for `/src/resources/images/*` if stale objects were cached (usually unnecessary once origin switches to S3 with new cache headers).

## Related docs

- [CLOUDFRONT_CDN.md](CLOUDFRONT_CDN.md) — intended architecture and path rules
- [DEPLOYMENT_STRATEGY.md](../../DEPLOYMENT_STRATEGY.md) — deploy pipeline
