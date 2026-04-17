# OPS: RDS security group (Phase 1)

## Pre-Phase-1 problem

The RDS PostgreSQL instance accepted inbound traffic on 5432 from
`0.0.0.0/0`. With `publicly_accessible = true` and a known password for the
default account, that is a meaningful exposure: any successful guess of the
RDS endpoint hostname (or a leaked `DATABASE_URL`) lets an attacker connect
from anywhere.

## Phase 1 change

[`infra/rds.tf`](../../infra/rds.tf) now permits inbound 5432 only from:

1. The app EC2 security group (`aws_security_group.app_sg`). All normal app
   traffic — which originates from the Node app inside the EC2 SG —
   continues to work.
2. An optional admin allowlist configured via
   `var.rds_admin_cidrs` ([`infra/variables.tf`](../../infra/variables.tf)).
   Defaults to `[]`. Populate with explicit CIDRs only.

The old `0.0.0.0/0` rule is preserved as a commented block inside the
resource as a reference point. Do NOT re-enable without explicit sign-off.

## Who needs an allowlist entry

| Use case                                   | Action                                                          |
|--------------------------------------------|-----------------------------------------------------------------|
| Normal app traffic (Node → RDS)            | Nothing — EC2 SG ingress covers it.                             |
| Local `psql` from Kyle's machine           | Add your public IP `/32` to `rds_admin_cidrs`, `terraform apply`. |
| CI integration tests from GitHub runners   | Resolve the current GitHub Actions CIDR range and add it. Remove it after the job ends, or leave it long-term if the range is stable. |

## How to find a GitHub runner CIDR

GitHub publishes runner CIDRs at
<https://api.github.com/meta>. Pull `actions` IP ranges, pick the regional
IPv4 block you need, and add to `var.rds_admin_cidrs`. Update this doc when
the list changes so future operators know why each entry is there.

## Validation

- `terraform plan` output for the change must show exactly one removal of
  the `0.0.0.0/0` ingress rule and exactly one addition of the app SG
  reference.
- AWS Console → RDS → the instance → Security groups → should list only the
  app SG and any explicit `rds_admin_cidrs` entries.
- `psql` from a non-allowed CIDR should time out; from the app SG (via an
  EC2 shell) should connect.

## Rollback

- `terraform plan -target=aws_security_group.rds_sg` with the uncommented
  legacy `0.0.0.0/0` rule re-applies the old shape. The commented block in
  the resource makes this a one-line change. Keep the revert temporary;
  re-lock within 24 hours.

## Data safety

SG changes do not touch data. No migration.

## See also

- [`infra/.cursorrules`](../../infra/.cursorrules) — Infrastructure Spend
  Lock (not triggered by this change; SG changes are free).
- [`OPS_SSM_SECRETS.md`](OPS_SSM_SECRETS.md) — getting the DB URL into the
  app without leaking it into the CI workflow file.
