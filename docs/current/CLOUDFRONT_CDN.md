# CloudFront CDN for Card Images

## What is CloudFront?

AWS CloudFront is a Content Delivery Network (CDN). It sits in front of your origin server (EC2) and caches static files — in this case, card images — at dozens of **edge locations** around the world. When a user requests a card image, CloudFront serves it from the nearest edge node instead of from the EC2 instance in `us-west-2`.

## Why is it used here?

The EC2 instance (`t2.micro`) has a very limited CPU and network budget. Before CloudFront, every card image request — characters, missions, locations — hit EC2 directly, competing with API requests (`/api/decks`, `/api/characters`, etc.) for the same limited resources. This made the deck selection screen feel slow because image loading and API loading were bottlenecked on the same machine.

CloudFront solves this by:

1. **Caching images at the edge** — after the first request for an image, CloudFront stores it and serves all subsequent requests without ever touching EC2.
2. **Reducing EC2 load** — EC2 only serves each image once per edge location per cache TTL period (up to 1 year for immutable assets).
3. **Improving latency** — users on the East Coast, Europe, or elsewhere get images from a nearby edge node, not a server in Oregon.

## Architecture

```
User Browser
     │
     │  GET https://xxxx.cloudfront.net/src/resources/cards/images/characters/thumb/spider_man.webp
     ▼
┌─────────────────────┐
│   CloudFront Edge   │  ← Edge location nearest to user (e.g. New York, London)
│   (cached hit?)     │
└──────────┬──────────┘
           │ Cache MISS (first request only)
           ▼
┌─────────────────────┐
│   EC2 Origin        │  ← Oregon (us-west-2), port 80
│   excelsior.cards   │
└─────────────────────┘
```

On a **cache hit**, EC2 is never contacted. On a **cache miss** (first request per edge location), CloudFront fetches from EC2, caches the response, and returns it — all transparent to the user.

## Cache TTL Policy

| Setting      | Value      | Effect                                       |
|--------------|------------|----------------------------------------------|
| `min_ttl`    | 0          | Respect `Cache-Control: no-cache` if set     |
| `default_ttl`| 86400s (1d)| Default if origin sends no `Cache-Control`   |
| `max_ttl`    | 31536000s (1yr) | Card images are immutable by filename — never expire |

Card image filenames are stable (e.g. `spider_man.webp`). When a new image is added, it gets a new filename, so the old cache is never stale.

## How to Access the Distribution in AWS Console

1. Log in to the [AWS Console](https://console.aws.amazon.com/)
2. Navigate to **CloudFront** (search "CloudFront" in the top search bar)
3. Click **Distributions** in the left sidebar
4. Find the distribution with comment **"Card images CDN for excelsior.cards"**
5. The **Domain name** column shows `xxxx.cloudfront.net` — this is the `CDN_BASE_URL` value

Direct link (you must be logged in): https://us-east-1.console.aws.amazon.com/cloudfront/v4/home#/distributions

## Cache Invalidation

If you ever need to force CloudFront to re-fetch images from EC2 (e.g. after replacing an existing image file with the same name):

```bash
# Invalidate a specific image
aws cloudfront create-invalidation \
  --distribution-id <DISTRIBUTION_ID> \
  --paths "/src/resources/cards/images/characters/thumb/spider_man.webp"

# Invalidate all card images at once
aws cloudfront create-invalidation \
  --distribution-id <DISTRIBUTION_ID> \
  --paths "/src/resources/*"
```

Find `<DISTRIBUTION_ID>` in the AWS Console under CloudFront → Distributions → ID column.

**Note:** Invalidations are free for the first 1,000 paths/month. Avoid invalidating `/*` (root wildcard) unless necessary.

## The `CDN_BASE_URL` Environment Variable

The CloudFront domain must be set as an environment variable on EC2 so the server can pass it to the frontend.

### How it flows

```
EC2 env var: CDN_BASE_URL=https://xxxx.cloudfront.net
      │
      ▼
Express route: GET /js/app-config.js
      │  responds with: window.APP_CDN_BASE = "https://xxxx.cloudfront.net";
      ▼
index.html: <script src="/js/app-config.js"></script>  (synchronous, loads first)
      │
      ▼
deckTileImages.js: const CDN_BASE = window.APP_CDN_BASE || '';
      │  all thumbnail paths are prefixed: CDN_BASE + /src/resources/...
      ▼
Browser: fetches images from https://xxxx.cloudfront.net/src/resources/...
```

### Setting `CDN_BASE_URL` on EC2

After running `terraform apply` and getting the `cloudfront_domain_name` output:

1. SSH into the EC2 instance (or use AWS SSM Session Manager)
2. Edit the application environment file or Docker run command to add:
   ```
   CDN_BASE_URL=https://xxxx.cloudfront.net
   ```
3. Restart the application

Alternatively, store it in AWS SSM Parameter Store and inject at container startup (consistent with how other env vars are managed in `infra/ssm.tf`).

### Local Development

When `CDN_BASE_URL` is not set (empty string), `/js/app-config.js` returns:

```js
window.APP_CDN_BASE = "";
```

All image paths remain relative (e.g. `/src/resources/cards/images/...`), served directly from the local server. **No change to local dev behavior.**

## Cost Estimate

| Tier          | Data Transfer Out | HTTP Requests       |
|---------------|-------------------|---------------------|
| Free tier     | 1 TB/month        | 10 million/month    |
| After free    | ~$0.0085/GB       | ~$0.0075/10K reqs   |

For a small-traffic application like excelsior.cards, usage will comfortably stay within the free tier. Even at moderate traffic, the savings on EC2 CPU/bandwidth outweigh any CloudFront charges.

## Terraform Resources

Defined in [`infra/cloudfront.tf`](../../infra/cloudfront.tf):

- `aws_cloudfront_distribution.card_images` — the distribution
- `output.cloudfront_domain_name` — prints `https://xxxx.cloudfront.net` after `terraform apply`

### Workflow

The agent writes the Terraform file and runs `terraform plan` for human review. **No AWS resources are created until the human explicitly approves with `terraform apply`.**

```bash
cd infra/
terraform init    # only needed once or after provider changes
terraform plan    # review before applying
terraform apply   # human must approve this step
```
