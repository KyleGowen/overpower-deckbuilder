---
name: start-aws-db-tunnel
description: >-
  Starts the production PostgreSQL path from a laptop via AWS Systems Manager
  Session Manager port forwarding (localhost to RDS through the app EC2
  instance). Use when the user asks to start the AWS tunnel, SSM DB tunnel,
  production RDS access, connect TablePlus or psql to prod, or run
  scripts/ssm-prod-db-tunnel.sh in the background.
---

# Start AWS (SSM) DB tunnel

## When to use

The user wants a **long-lived local tunnel** so GUI or CLI clients can reach **production RDS** as `127.0.0.1:<local-port>`. Traffic path: **laptop → SSM → app EC2 → RDS** (RDS is not exposed to the public internet).

## Source of truth

- **Runbook (IAM, parameters, raw `aws ssm start-session`):** [docs/current/DEPLOYMENT.md](docs/current/DEPLOYMENT.md) — section *Production database access (SSM port forwarding)*.
- **Helper script:** [scripts/ssm-prod-db-tunnel.sh](scripts/ssm-prod-db-tunnel.sh) (repo root-relative paths below assume **cwd = repository root**).

Do **not** duplicate IAM policy JSON here; use the runbook and [docs/examples/ssm-prod-db-tunnel-policy.json.sample](docs/examples/ssm-prod-db-tunnel-policy.json.sample).

## Prerequisites

Per DEPLOYMENT: AWS CLI v2, **Session Manager plugin**, credentials (`aws sts get-caller-identity`), and IAM allowing `ssm:StartSession` for the target instance and port-forward document. Use `--profile NAME` on every `aws` command when the user relies on a non-default profile.

## Resolve EC2 instance ID

Prefer an `i-...` the user supplies. Otherwise list the running app instance (tag `Name=op-deckbuilder-app`, region `us-west-2`):

```bash
aws ec2 describe-instances --region us-west-2 \
  --filters "Name=tag:Name,Values=op-deckbuilder-app" "Name=instance-state-name,Values=running" \
  --query 'Reservations[].Instances[].[InstanceId,State.Name,Tags[?Key==`Name`].Value|[0]]' \
  --output table
```

Optionally confirm SSM **Online** (see DEPLOYMENT for `aws ssm describe-instance-information`).

## Avoid duplicate tunnels

Default local port is **15432** (`LOCAL_PORT`). Before starting, check nothing is already listening (macOS):

```bash
lsof -nP -iTCP:15432 -sTCP:LISTEN
```

If the port is in use, either reuse the existing tunnel or pick another port, e.g. `LOCAL_PORT=15433 ./scripts/ssm-prod-db-tunnel.sh i-INSTANCE_ID`.

## Start the tunnel in the background

The `start-session` process must **keep running**. Do not block the whole agent turn on a foreground session unless the user explicitly wants that.

**Preferred patterns:**

1. **Cursor Shell (fire-and-forget):** run from repo root with the tool’s **background / non-blocking** invocation (e.g. `block_until_ms: 0`) so the tunnel continues after the command returns.
2. **`nohup` + log + PID:** e.g. log under the user home or project temp, then report PID:

```bash
nohup ./scripts/ssm-prod-db-tunnel.sh i-INSTANCE_ID >>"${HOME}/.ssm-op-deckbuilder-db-tunnel.log" 2>&1 &
echo $!
```

If `./scripts/ssm-prod-db-tunnel.sh` is not executable, `chmod +x scripts/ssm-prod-db-tunnel.sh` once (per DEPLOYMENT).

**Environment overrides (see script):** `AWS_REGION` (default `us-west-2`), `LOCAL_PORT`, `RDS_PORT`, `RDS_HOST`.

## Verify

After a short wait, confirm the local port is listening, e.g.:

```bash
lsof -nP -iTCP:15432 -sTCP:LISTEN
```

(Use the actual `LOCAL_PORT` if overridden.)

## Connect

Point the client at **`127.0.0.1`** and **`LOCAL_PORT`** (default **15432**) — **not** the RDS hostname from the laptop.

Database name, user, password, and SSM parameter paths are in DEPLOYMENT (**SSM parameter names**). Use **`sslmode=require`** for `psql` as documented there.

## Stop

If `nohup` was used, **kill the PID** that was printed. Otherwise find the listener with `lsof` and terminate that process. If the tunnel dies, the local port stops listening.
