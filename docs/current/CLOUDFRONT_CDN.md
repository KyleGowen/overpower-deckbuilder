# CDN Infrastructure — CloudFront + S3

## Overview

Card images are offloaded from the EC2 instance to AWS. A private S3 bucket holds the canonical image files; a CloudFront distribution serves them globally from edge locations. The EC2 instance (`t2.micro`) handles only application traffic — API requests, page rendering, auth — and never serves a card image in production.

**Why this matters:**
- The EC2 free-tier instance has a very limited CPU and network budget. Before this architecture, every image request competed with API requests on the same machine.
- ~740 source images + thumbnails total ~1.4 GB. Keeping them out of the Docker image cuts build time and image size significantly.
- CloudFront's free tier covers 1 TB/month data transfer and 10 million requests/month — more than enough for this traffic level.

---

## Architecture

```
User Browser
     │
     │  GET https://xxxx.cloudfront.net/src/resources/cards/images/characters/thumb/spider_man.webp
     ▼
┌─────────────────────────────────────────┐
│           CloudFront Edge               │  ← Nearest edge location (New York, London, etc.)
│  Ordered cache behavior evaluation:     │
│  ┌─────────────────────────────────┐    │
│  │ /src/resources/cards/images/*   │────┼──── Cache HIT → serve cached image immediately
│  │ → s3-assets-origin              │    │
│  └─────────────────────────────────┘    │
│  ┌─────────────────────────────────┐    │
│  │ /* (default)                    │────┼──── All other traffic → EC2
│  │ → ec2-origin                    │    │
│  └─────────────────────────────────┘    │
└────────────────────┬────────────────────┘
                     │ Cache MISS only (first request per edge location per TTL period)
          ┌──────────┴──────────┐
          ▼                     ▼
┌──────────────────┐   ┌──────────────────────┐
│  S3 Bucket       │   │  EC2 (excelsior.cards)│
│  (private)       │   │  Oregon (us-west-2)  │
│  card images     │   │  port 80             │
│  OAC auth only   │   │  app + API traffic   │
└──────────────────┘   └──────────────────────┘
```

**Request routing rules (evaluated top-down):**

| Path pattern | Origin | Use |
|---|---|---|
| `/src/resources/cards/images/*` | S3 bucket | All card images (source + thumbnails) |
| `/*` (default) | EC2 instance | Everything else (API, pages, static JS/CSS) |

---

## AWS Resources

### S3 Bucket (`infra/s3.tf`)

| Resource | Name |
|---|---|
| Bucket | `op-deckbuilder-cards-assets-{env}` |
| Public access | Fully blocked (all four block flags enabled) |
| Access method | CloudFront OAC only — no public HTTP, no signed URLs |

The bucket is **completely private**. Direct `https://` requests to the bucket URL return 403. Only CloudFront can read objects, authenticated via Origin Access Control (OAC).

**Bucket policy** grants `s3:GetObject` to the CloudFront service principal scoped to this specific distribution ARN:

```json
{
  "Sid": "AllowCloudFrontServicePrincipal",
  "Effect": "Allow",
  "Principal": { "Service": "cloudfront.amazonaws.com" },
  "Action": "s3:GetObject",
  "Resource": "arn:aws:s3:::op-deckbuilder-cards-assets-dev/*",
  "Condition": {
    "StringEquals": { "AWS:SourceArn": "<distribution-arn>" }
  }
}
```

### CloudFront Distribution (`infra/cloudfront.tf`)

| Setting | Value | Reason |
|---|---|---|
| Price class | `PriceClass_100` | US, Canada, Europe — lowest cost tier |
| Viewer protocol | `redirect-to-https` | Force HTTPS for all requests |
| Compression | enabled | Gzip/Brotli on text responses |
| Default certificate | `*.cloudfront.net` (free) | No custom domain needed for CDN |
| Geo restriction | none | Serve worldwide |

**Cache TTL for card images (`/src/resources/cards/images/*`):**

| Setting | Value | Effect |
|---|---|---|
| `min_ttl` | 0 | Honor `Cache-Control: no-cache` if set |
| `default_ttl` | 86400 (1 day) | Applied when origin sends no `Cache-Control` |
| `max_ttl` | 31536000 (1 year) | Card filenames are stable — treat as immutable |

Cookies and query strings are not forwarded to the S3 origin — the cache key is the path only.

### Origin Access Control (OAC)

OAC is the modern (2022+) replacement for Origin Access Identity (OAI). It signs requests from CloudFront to S3 using SigV4, proving the request came from this specific CloudFront distribution. The S3 bucket policy only accepts requests that carry a matching distribution ARN in the condition.

```hcl
resource "aws_cloudfront_origin_access_control" "card_images" {
  signing_behavior = "always"
  signing_protocol = "sigv4"
}
```

### IAM Policy for CI (`infra/iam.tf`)

GitHub Actions needs write access to S3 to sync images on each push. The policy is **least-privilege**:

| Permission | Scope | Purpose |
|---|---|---|
| `s3:ListBucket` | Bucket ARN | `aws s3 sync` needs to enumerate existing objects |
| `s3:PutObject` | Objects `/*` | Upload new/changed images |
| `s3:DeleteObject` | Objects `/*` | `--delete` flag removes stale images |
| `s3:GetObject` | Objects `/*` | `aws s3 sync` reads objects to compute ETags |

The policy is conditionally created — only applied when `var.ci_iam_username` is non-empty. The IAM user itself is created manually outside Terraform; this file only attaches the policy to the existing user.

To activate:
```bash
cd infra
terraform apply -var="ci_iam_username=$(aws iam list-users --query 'Users[0].UserName' --output text)"
```

### SSM Parameter

`CDN_BASE_URL` is stored in SSM Parameter Store and injected into the Docker container at startup via the `null_resource.restart_app_with_cdn` provisioner in `cloudfront.tf`. This means the EC2 instance always knows the correct CloudFront domain without SSH access.

SSM parameter path: `/{project_name}/{environment}/app/cdn_base_url`

---

## How Images Get Into S3

### CI: `sync-images` job (`.github/workflows/deploy.yml`)

On every push to `main` (after all quality gates pass), the pipeline syncs the local `src/resources/cards/images/` directory to S3:

```yaml
aws s3 sync src/resources/cards/images/ \
  s3://${{ secrets.AWS_S3_ASSETS_BUCKET }}/src/resources/cards/images/ \
  --delete \
  --cache-control "public, max-age=31536000, immutable"
```

- `--delete` removes S3 objects that no longer exist locally (keeps S3 in sync with the repo)
- `--cache-control "public, max-age=31536000, immutable"` is set on every object at upload time, telling both CloudFront and browsers to cache indefinitely
- The job runs **in parallel** with `build-docker` (both need only the quality gates to pass), so image sync adds no extra wall-clock time to the deployment pipeline

**Required GitHub Actions secret:** `AWS_S3_ASSETS_BUCKET` — set to the bucket name output by `terraform output assets_bucket_name`.

**Required IAM:** The CI user (whose keys are in `AWS_ACCESS_KEY_ID` / `AWS_SECRET_ACCESS_KEY`) must have the S3 assets policy attached. Terraform does this when `ci_iam_username` is set: in `infra/`, set `ci_iam_username` to that IAM username (e.g. `github-actions-deploy`) in `terraform.tfvars` or via `-var`, then run `terraform apply`. If it is not set, the sync-images job fails with "not authorized to perform: s3:ListBucket". See `infra/iam.tf` and [scripts/setup-github-secrets.md](../../scripts/setup-github-secrets.md) troubleshooting.

### One-time manual seed

When setting up a new environment, seed the bucket before first deployment:

```bash
aws s3 sync src/resources/cards/images/ \
  s3://$(cd infra && terraform output -raw assets_bucket_name)/src/resources/cards/images/ \
  --delete \
  --cache-control "public, max-age=31536000, immutable"
```

---

## How the Frontend Uses the CDN

The CDN base URL flows from the server environment variable to the browser automatically:

```
EC2 env var: CDN_BASE_URL=https://xxxx.cloudfront.net
      │
      ▼
Express route: GET /js/app-config.js          (cached 5 minutes, loaded synchronously in <head>)
      │  response: window.APP_CDN_BASE = "https://xxxx.cloudfront.net";
      ▼
deckTileImages.js / card-image-utils.js
      │  const CDN_BASE = (window.APP_CDN_BASE || '').replace(/\/$/, '');
      │  all image paths are prefixed: CDN_BASE + /src/resources/cards/images/...
      ▼
Browser fetches: https://xxxx.cloudfront.net/src/resources/cards/images/characters/thumb/spider_man.webp
```

### `/js/app-config.js` route (`src/routes/auth.routes.ts`)

```typescript
app.get('/js/app-config.js', (req, res) => {
  const cdnBaseUrl = process.env.CDN_BASE_URL || '';
  res.set('Content-Type', 'application/javascript');
  res.set('Cache-Control', 'public, max-age=300'); // 5-minute browser cache
  res.send(`window.APP_CDN_BASE = ${JSON.stringify(cdnBaseUrl)};`);
});
```

This is the single source of truth for the CDN domain in the frontend. It is loaded synchronously via `<script src="/js/app-config.js">` in `<head>` before any other scripts run.

### `deckTileImages.js` (deck selection thumbnails)

```javascript
const CDN_BASE = (window.APP_CDN_BASE || '').replace(/\/$/, '');

// Converts full-res path → thumbnail path, then prepends CDN_BASE
function getDeckCardImagePath(card) {
  const fullPath = getCardImagePath(card, card.card_type);
  return CDN_BASE + toThumbnailPathForType(fullPath, card.card_type);
}
```

Used for all card images on the deck selection screen tiles (characters, locations, missions).

### `card-image-utils.js` (deck editor and card database)

```javascript
const _CARD_IMAGE_CDN_BASE = (typeof window !== 'undefined' && window.APP_CDN_BASE || '').replace(/\/$/, '');

function getCardImagePath(card, cardType, options) {
  const path = _getCardImagePathRaw(card, cardType, options);
  if (!path || !_CARD_IMAGE_CDN_BASE || path.startsWith('http')) return path;
  return _CARD_IMAGE_CDN_BASE + path;
}
```

Used for full-resolution images in the deck editor card view and the card database browser.

---

## Local Development

When `CDN_BASE_URL` is unset (empty string), `/js/app-config.js` returns:

```javascript
window.APP_CDN_BASE = "";
```

All image path functions return relative paths like `/src/resources/cards/images/characters/spider_man.webp`. Express static middleware serves these directly from `src/resources/cards/images/` on disk. **Local development behavior is completely unchanged.**

The `.dockerignore` excludes `src/resources/cards/images` from the Docker build context so production images stay small. **Deck backgrounds** live under `src/resources/images/backgrounds/landscape/` (not under `cards/images`) and are **included** in the image so the server can list deck backgrounds (`/api/deck-backgrounds`) and validate paths on save. The `sync-images` job syncs `src/resources/images/backgrounds/` to S3 alongside card images. Card art and thumbnails remain CDN-only under `src/resources/cards/images/`. This only affects the Docker build — it does not affect `npm run dev` (which runs directly from the host filesystem).

---

## Cache Invalidation

Card image filenames are stable (content-addressed by character/card name). When a new card is added it gets a new filename, so the cache is never stale by design. You only need to invalidate if you **replace** an existing file in-place with the same filename.

```bash
# Get the distribution ID
DIST_ID=$(cd infra && terraform output -raw cloudfront_domain_name | \
  sed 's|https://||' | \
  xargs -I{} aws cloudfront list-distributions \
    --query "DistributionList.Items[?DomainName=='{}'].Id" --output text)

# Invalidate a specific image
aws cloudfront create-invalidation \
  --distribution-id "$DIST_ID" \
  --paths "/src/resources/cards/images/characters/thumb/spider_man.webp"

# Invalidate all card images at once
aws cloudfront create-invalidation \
  --distribution-id "$DIST_ID" \
  --paths "/src/resources/cards/images/*"
```

**Free tier:** 1,000 invalidation paths/month. Avoid `/*` (root wildcard) unless truly necessary.

---

## Verifying the CDN Is Working

```bash
# Get the CloudFront domain
CDN=$(cd infra && terraform output -raw cloudfront_domain_name)

# Test a known image — should return HTTP/2 200
curl -sI "$CDN/src/resources/cards/images/characters/anubis.webp" | head -5

# Check the x-cache header — HIT means CloudFront served from edge, MISS means it fetched from S3
curl -sI "$CDN/src/resources/cards/images/characters/anubis.webp" | grep x-cache
# x-cache: Hit from cloudfront    ← good (cached at edge)
# x-cache: Miss from cloudfront   ← fine (first request to this edge location)
# x-cache: Error from cloudfront  ← problem — see Troubleshooting below
```

List actual files in the bucket to find valid test filenames:
```bash
aws s3 ls s3://$(cd infra && terraform output -raw assets_bucket_name)/src/resources/cards/images/characters/ | head -5
```

---

## Troubleshooting

### `x-cache: Error from cloudfront` / HTTP 403

**Most common cause:** S3 bucket policy or OAC misconfiguration.

Check order:
1. Verify the bucket policy exists and references the correct CloudFront distribution ARN:
   ```bash
   aws s3api get-bucket-policy --bucket $(cd infra && terraform output -raw assets_bucket_name) | jq .
   ```
2. Verify the OAC is attached to the S3 origin in the distribution (AWS Console → CloudFront → distribution → Origins tab).
3. Verify the object actually exists in S3:
   ```bash
   aws s3 ls s3://$(cd infra && terraform output -raw assets_bucket_name)/src/resources/cards/images/characters/ | grep <filename>
   ```
4. If you just created/updated the bucket policy, wait ~60 seconds for propagation.

### Images show as broken in production but work locally

1. Confirm `CDN_BASE_URL` is set in the EC2 environment:
   ```bash
   aws ssm get-parameter --name /op-deckbuilder/dev/app/cdn_base_url --output text --query Parameter.Value
   ```
2. Confirm the app container received the variable:
   ```bash
   curl -s https://excelsior.cards/js/app-config.js
   # Should print: window.APP_CDN_BASE = "https://xxxx.cloudfront.net";
   # Empty string means CDN_BASE_URL was not injected → images fall back to EC2 (not S3)
   ```
3. If the variable is missing, re-run `terraform apply` to trigger the `restart_app_with_cdn` provisioner.

### Images are stale after updating a file

Run a cache invalidation (see above) after `aws s3 sync` completes.

---

## Terraform Management

All CDN infrastructure is defined in `infra/` and managed with Terraform. State is local — coordinate with Kyle before applying.

```bash
cd infra

# Preview changes (always do this first)
terraform plan

# Apply (human must review plan output before running this)
terraform apply

# Get the CloudFront domain to use as CDN_BASE_URL
terraform output cloudfront_domain_name

# Get the S3 bucket name to use as AWS_S3_ASSETS_BUCKET GitHub secret
terraform output assets_bucket_name
```

**Terraform files for this feature:**

| File | Resources |
|---|---|
| `infra/s3.tf` | S3 bucket, public access block, OAC, bucket policy |
| `infra/cloudfront.tf` | CloudFront distribution, `cloudfront_domain_name` output, SSM-based container restart |
| `infra/iam.tf` | CI IAM policy + attachment (conditional on `ci_iam_username`) |
| `infra/outputs.tf` | `assets_bucket_name`, `assets_bucket_arn` |
| `infra/variables.tf` | `ci_iam_username` variable |

**Apply only CDN/S3 resources (avoids touching unrelated resources like Firebase SSM):**

```bash
terraform apply \
  -target=aws_s3_bucket.card_images \
  -target=aws_s3_bucket_public_access_block.card_images \
  -target=aws_cloudfront_origin_access_control.card_images \
  -target=aws_s3_bucket_policy.card_images \
  -target=aws_cloudfront_distribution.card_images \
  -target=aws_ssm_parameter.cdn_base_url
```

---

## Cost Estimate

All current usage is within the AWS free tier.

| Resource | Free tier | Overage rate |
|---|---|---|
| CloudFront data transfer out | 1 TB/month | ~$0.0085/GB |
| CloudFront HTTP requests | 10M requests/month | ~$0.0075/10K |
| S3 storage | 5 GB/month | ~$0.023/GB |
| S3 GET requests | 20,000/month | ~$0.0004/1K |
| CloudFront invalidations | 1,000 paths/month | $0.005/path |

The `PriceClass_100` setting restricts edge locations to US, Canada, and Europe — the lowest-cost tier. Changing to `PriceClass_All` would add Asia-Pacific and South America coverage at higher cost. **Do not change the price class without explicit approval (infrastructure spend lock applies).**

---

## Related Documentation

- [`docs/current/IMAGE_PIPELINE.md`](IMAGE_PIPELINE.md) — thumbnail generation pipeline
- [`docs/current/DEPLOYMENT.md`](DEPLOYMENT.md) — full deployment workflow
- [`infra/.cursorrules`](../../infra/.cursorrules) — Terraform conventions and infrastructure spend lock
- [`DEAD_CODE_POLICY.md`](../../DEAD_CODE_POLICY.md) — removing unused assets
