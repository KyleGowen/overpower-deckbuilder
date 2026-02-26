# Infrastructure Upgrade Options

> ## ⛔ SPEND LOCK — READ THIS FIRST
>
> **NONE of the upgrades documented here may be implemented without explicit, direct instruction from the project owner (Kyle).**
>
> These options exist as a reference for the future. They are **NOT part of any active plan**. Do not make any AWS infrastructure changes described in this document unless Kyle explicitly says "upgrade the EC2 instance" or "set up Redis" etc. in that conversation.
>
> A `.cursorrules` rule (Infrastructure Spend Lock) enforces this policy for AI agents.

---

## Current Infrastructure

| Component | Current Spec | Monthly Cost (approx) |
|-----------|-------------|----------------------|
| EC2 | t2.micro — 1 vCPU, 1 GB RAM | ~$8.50/mo (on-demand) |
| RDS | db.t4g.micro — 1 vCPU, 1 GB RAM | ~$12.10/mo (on-demand) |
| CloudFront | Free tier (1 TB/mo transfer) | $0/mo at current scale |
| S3 / ECR | Minimal usage | <$1/mo |

---

## Option 1 — Upgrade EC2: t2.micro → t3.small

**What changes:** The EC2 instance running the Node.js/Express app and Docker container gets more CPU, more RAM, and a better network baseline.

| | t2.micro | t3.small |
|--|----------|----------|
| vCPU | 1 | 2 |
| RAM | 1 GB | 2 GB |
| Network | Low | Up to 5 Gbps |
| CPU Credits | Burstable (less efficient) | Burstable (T3 more efficient than T2) |
| On-demand price | ~$0.0116/hr (~$8.50/mo) | ~$0.0208/hr (~$15.20/mo) |

**Cost delta: ~+$6.70/mo**

**When to consider:** App response times are degrading under load, or the instance is consistently hitting CPU credit exhaustion (visible in CloudWatch `CPUCreditBalance` metric).

**How to implement (when instructed):**
In `infra/ec2.tf`, change:
```hcl
instance_type = "t2.micro"
```
to:
```hcl
instance_type = "t3.small"
```
Then run `terraform apply` (human must approve the plan).

---

## Option 2 — Upgrade RDS: db.t4g.micro → db.t4g.small

**What changes:** The PostgreSQL RDS instance gets more CPU and RAM, allowing it to hold more of the working set in memory and handle more concurrent queries.

| | db.t4g.micro | db.t4g.small |
|--|--------------|--------------|
| vCPU | 2 | 2 |
| RAM | 1 GB | 2 GB |
| On-demand price | ~$0.016/hr (~$11.70/mo) | ~$0.032/hr (~$23.40/mo) |

**Cost delta: ~+$11.70/mo**

**When to consider:** Slow query times persist even after query optimization (Phases 1 & 2 of the performance plan), or RDS FreeableMemory metric is consistently near zero.

**How to implement (when instructed):**
In `infra/rds.tf`, change:
```hcl
instance_class = "db.t4g.micro"
```
to:
```hcl
instance_class = "db.t4g.small"
```
Then run `terraform apply` (human must approve the plan). RDS will have a brief downtime during the resize (~2–5 minutes).

---

## Option 3 — Add Redis/ElastiCache for Shared Caching

**What changes:** Replaces the current in-process Node.js `Map`-based cache with a Redis instance. Enables cache sharing across multiple EC2 instances and cache persistence across app restarts.

**Current limitation:** The in-process cache is wiped every time the Docker container restarts or a new deployment occurs. Any user who hits the app immediately after a deploy gets a cold cache (full DB query).

| ElastiCache Option | Spec | Price |
|--------------------|------|-------|
| cache.t4g.micro | 0.5 GB | ~$0.016/hr (~$11.70/mo) |
| cache.t3.micro | 0.555 GB | ~$0.017/hr (~$12.40/mo) |

**Cost delta: ~+$11.70–$12.40/mo** (plus minor data transfer)

**When to consider:** The app scales to multiple EC2 instances (load balancer setup), or cache-miss storms after deployments become a visible problem in production latency.

**How to implement (when instructed):**
1. Add `infra/elasticache.tf` defining an `aws_elasticache_cluster` resource (Redis engine, `cache.t4g.micro`)
2. Update security groups to allow EC2 → ElastiCache traffic on port 6379
3. Add `ioredis` or `redis` npm package
4. Replace the `Map`-based cache in `src/database/PostgreSQLDeckRepository.ts` with Redis `GET`/`SET` calls
5. Add `REDIS_URL` environment variable to `infra/user_data.sh` and SSM Parameter Store

---

## Summary — Combined Upgrade Cost

| Scenario | Monthly Increase |
|----------|-----------------|
| EC2 upgrade only | +$6.70/mo |
| RDS upgrade only | +$11.70/mo |
| Redis only | +$11.70/mo |
| All three | +$30.10/mo |

Current total infra cost is approximately **$21–23/mo**. All three upgrades would bring it to approximately **$51–53/mo**.

---

*Last updated: 2026-02-25. Prices are AWS us-east-1 on-demand rates and subject to change.*
