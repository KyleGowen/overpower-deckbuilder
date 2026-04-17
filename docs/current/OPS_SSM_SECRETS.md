# OPS: SSM Parameter Store for app secrets (Phase 1)

## Status

Phase 1 is the first step of moving all runtime secrets onto SSM Parameter
Store. Today, most parameters live in SSM already and are appended to
`/opt/app/.env` on EC2 during the deploy workflow. Two gaps remain and will
close in follow-up PRs after a stable period of green SSM reads:

1. The database URL, username, and password are still baked into
   [`.github/workflows/deploy.yml`](../../.github/workflows/deploy.yml) as
   literal strings (`TempPassword123!` etc.). These must move to SSM.
2. The final `/opt/app/.env` file on EC2 will go away in a future phase —
   the container will fetch directly from SSM at boot via the IAM policy
   already attached in [`infra/ec2.tf`](../../infra/ec2.tf).

## Parameter naming

Every parameter lives under `/${project_name}/${environment}/...` where
`project_name = op-deckbuilder` and `environment = dev` today.

| Parameter                                                   | Type          | Consumed by                                                                 |
|-------------------------------------------------------------|---------------|-----------------------------------------------------------------------------|
| `/op-deckbuilder/dev/database/url`                          | `SecureString`| App `DATABASE_URL`                                                          |
| `/op-deckbuilder/dev/app/environment`                       | `String`      | App `NODE_ENV`                                                              |
| `/op-deckbuilder/dev/app/cdn_base_url`                      | `String`      | App `CDN_BASE_URL` → [`/js/app-config.js`](../../src/routes/auth.routes.ts) |
| `/op-deckbuilder/dev/app/jwt_secret`                        | `SecureString`| v1 JWT signing (`V1JwtTokenService`)                                         |
| `/op-deckbuilder/dev/firebase/api_key` (+ auth_domain, …)   | `String`      | Firebase client config                                                      |
| `/op-deckbuilder/dev/firebase/service_account_json`         | `SecureString`| Firebase Admin SDK bootstrap                                                |
| `/op-deckbuilder/dev/app/allowed_origins` *(new)*           | `String`      | CORS allowlist ([`API_V1_CORS.md`](API_V1_CORS.md))                         |

## How the app reads them

[`infra/ec2.tf`](../../infra/ec2.tf) grants the EC2 instance profile
`ssm:GetParameter` / `GetParameters` on `/op-deckbuilder/dev/*`.

During deploy, [`.github/workflows/deploy.yml`](../../.github/workflows/deploy.yml)
runs `aws ssm get-parameter` for each value and appends it to
`/opt/app/.env`. The app reads `.env` via `dotenv/config` in
[`src/index.ts`](../../src/index.ts).

After the follow-up migration, the app will call `SSM:GetParameters` itself
at boot and skip the `.env` file entirely.

## Adding a new secret

1. Put the value in SSM:

   ```bash
   aws ssm put-parameter \
     --region us-west-2 \
     --name /op-deckbuilder/dev/app/<name> \
     --type SecureString \
     --value '<value>' \
     --overwrite
   ```

2. If the deploy workflow needs to bake it into `.env`, add a new step to
   [`.github/workflows/deploy.yml`](../../.github/workflows/deploy.yml)
   modeled after the existing `Append CDN_BASE_URL to .env` step.
3. If the app reads it directly via `SSM:GetParameter`, no workflow change
   is needed — but verify the IAM policy in `infra/ec2.tf` covers the new
   key (it does because the policy grants `*` under the project prefix).

## Rollback

- **Bad parameter value:** `aws ssm put-parameter --overwrite` with the
  previous value, then redeploy or `docker restart overpower-app`.
- **Deploy step broken:** the feature flag for each secret is the env var
  that consumes it. E.g. if the new `ALLOWED_ORIGINS` param is malformed,
  temporarily `DISABLE_CORS=1` until the param is fixed.
- **Plaintext removal from workflow breaks deploy:** `git revert` the
  workflow commit. `TempPassword123!` is already in git history (pre-Phase-1)
  so nothing new is exposed by a rollback; rotate the RDS password
  immediately after the final plaintext removal.

## Validation

- Manual smoke (admin-scoped):

  ```bash
  aws ssm describe-parameters --parameter-filters "Key=Path,Values=/op-deckbuilder/dev/" --recursive
  ```

  Expect every row from the table above.

- The deploy workflow's `Verify CDN_BASE_URL in .env on EC2` and
  `Verify JWT_SECRET in .env on EC2` steps already guard the append. Mirror
  that pattern when you move DB credentials.

## Data safety

Appending to `.env` is idempotent (`rm -f /opt/app/.env` at the start of the
deploy). No database side effects.

## See also

- [`infra/.cursorrules`](../../infra/.cursorrules) — file map; the SSM
  Terraform lives in `ssm.tf`.
- [`OPS_RDS_SECURITY_GROUP.md`](OPS_RDS_SECURITY_GROUP.md) — once DB
  credentials are in SSM, the only path to RDS is via the app SG.
