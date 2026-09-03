# Excelsior production AWS reference

Use this reference to identify expected relationships, not to assume that a dated ID is still live. Resolve current IDs from stable selectors on every audit and report drift.

## Identity and stable selectors

- AWS account: `474120878015`
- Primary region: `us-west-2`
- Billing API region: `us-east-1`
- Public application: `https://excelsior.cards`
- Health endpoint: `https://excelsior.cards/health`
- Project/name tokens: `op-deckbuilder`, `overpower-deckbuilder`, `OverPower Deckbuilder`, `Excelsior`
- Primary Terraform tag values: `Project=op-deckbuilder` or `Project=OverPower Deckbuilder`
- Environment tags currently use both `dev` and production terminology. Do not exclude a live resource solely because its tag says `dev`.
- Historical Excelsior Elastic IP cleanup candidate: `44.230.134.205`. It was previously observed unassociated and unreferenced. Reconfirm that the account still owns it, that it remains unassociated, and that current Route 53/repository references are absent before recommending release. Remove this exception from the skill after the address is released.

## Runtime dependency map

```text
Route 53: excelsior.cards / www.excelsior.cards
                |
                v
CloudFront: alias excelsior.cards
      | default app traffic                    | image paths
      v                                        v
origin.excelsior.cards -> EC2 Elastic IP       S3 assets bucket
                              |
                              v
                    EC2 tag Name=op-deckbuilder-app
                         |       |       |
                         |       |       +--> ECR overpower-deckbuilder
                         |       +----------> SSM /op-deckbuilder/dev/*
                         +------------------> RDS op-deckbuilder-postgres

SES -> S3 email-storage bucket -> Lambda email forwarder -> SES
```

The default deployment is a single EC2 web host with blue-green Docker containers on alternate local ports. An app-instance change can therefore affect all live users.

## Stable resource selectors

| Area | Stable selector | Notes |
|---|---|---|
| EC2 | tag `Name=op-deckbuilder-app` | Resolve the current running instance ID; IDs in docs may be stale. |
| ECR active | repository `overpower-deckbuilder` | GitHub Actions builds SHA and `latest` tags here. Protect the production SHA and rollback depth. |
| ECR legacy/IaC | repository `op-deckbuilder-repo` | Terraform and bootstrap code may still reference it. Do not delete until every active reference is corrected and recovery is tested. |
| RDS | identifier `op-deckbuilder-postgres` | PostgreSQL, encrypted gp3, seven-day backup intent. The EC2 app and SSM tunnel depend on it. |
| S3 assets | bucket prefix `op-deckbuilder-cards-assets-` | CloudFront origin for card and UI images; CI currently syncs image trees. |
| S3 email | bucket prefix `op-deckbuilder-email-storage-` | SES receipt storage with Lambda notification and lifecycle intent. |
| CloudFront | alias `excelsior.cards` or comment `Card images CDN for excelsior.cards` | Default behavior proxies app traffic; ordered behaviors serve S3 images and cache selected APIs. |
| Route 53 | public hosted zone `excelsior.cards.` | Apex and www target CloudFront; `origin` targets the app address. |
| SSM | path `/op-deckbuilder/dev/` | Contains runtime configuration, including SecureStrings. Never read decrypted values for a cost audit. |
| Lambda | name/tag associated with `op-deckbuilder` email forwarding | Preserve SES/S3 trigger relationships. |

## Authoritative repository sources

- `infra/*.tf`: intended Terraform topology, tags, lifecycle settings, networking, DNS, CDN, S3, SES, Lambda, IAM, SSM, RDS, EC2, and ECR.
- `.github/workflows/deploy.yml`: live release repository, current EC2 target, ECR tags, S3 sync, migrations, blue-green deployment, and health gates.
- `Dockerfile` and `.dockerignore`: image composition and layer-cache behavior.
- `scripts/deploy-to-production.sh`: alternate/manual deployment dependencies.
- `scripts/ssm-prod-db-tunnel.sh`: operator database-access path.
- `docs/current/DEPLOYMENT.md`, `CLOUDFRONT_CDN.md`, `IMAGE_PIPELINE.md`, `OPS_RDS_SECURITY_GROUP.md`, and `OPS_TLS_AND_HTTPS.md`: operational dependencies and recovery assumptions.
- `business-operations/metrics/aws-costs.csv`: append-only cost-report ledger; read-only for this skill.

When these sources disagree, report drift. Do not silently choose the cheapest interpretation.

## Known risk-sensitive relationships

- The running container is unaffected by ECR expiration, but rollback to an expired image is impossible unless it can be rebuilt exactly.
- ECR manifest sizes are not billed repository size because layers can be shared across images.
- Public IPv4 charges may include the EC2 address and a publicly accessible RDS address. Removing either can break CloudFront origin traffic, direct operations, or deployment connectivity.
- RDS CPU alone is insufficient for downsizing. Minimum freeable memory, connections, burst behavior, storage headroom, and maintenance/deployment peaks all matter.
- S3 image sync and CloudFront behaviors are part of production rendering. A path-filter optimization must cover both `src/resources/cards/images/` and `src/resources/images/` and preserve a manual recovery path.
- The SES email path uses Route 53, SES, S3, Lambda, IAM, and lifecycle configuration. A quiet queue does not prove it is unused.
- Terraform currently uses historical project/environment naming in places. A Terraform reference is dependency evidence even when the live deployment has drifted.
- The application has one main production EC2 host and one production RDS instance. Avoid recommendations that create a single-step outage or eliminate the only backup/recovery path.

## Audit coverage expectations

The deterministic collector gathers:

- caller identity and regional context;
- current partial-month and previous complete-month relevant service/usage-type charges;
- owned EC2 instances, EBS volumes/snapshots, addresses, network interfaces, NAT gateways, and load balancers;
- the production RDS instance, snapshots, and reservation recommendations;
- active and legacy ECR inventory and lifecycle policies;
- owned S3 buckets and lifecycle/versioning configuration;
- the Excelsior CloudFront distribution and Route 53 zone;
- owned Lambda functions and CloudWatch log groups;
- 14-day EC2/RDS CloudWatch utilization summaries;
- Compute Optimizer and reservation recommendation availability;
- repository references for live identifiers when practical.

Coverage failures must remain visible in the final report.
