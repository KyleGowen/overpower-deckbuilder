## Excelsior

Excelsior is an **Overpower card game database + deck building tool** that was **100% vibe coded by me**.

### Website / accounts

- **Live site**: `https://excelsior.cards`
- **Questions or want an account?** Contact me (repo owner) and I’ll get you set up.

### Install dependencies

You’ll need:

- **Node.js + npm**
- **Docker** (recommended for local Postgres via `docker/docker-compose.yml`)

From the repo root:

```bash
npm install
```

### Generate card image thumbnails (local dev)

Character card images use thumbnails for faster loading. Generate them once (or after adding new character images):

```bash
npm run generate:thumbnails
```

The script skips any thumbnail that already exists and is newer than the source image. In CI, thumbnails are generated automatically.

### Run the server

#### Option A (recommended): start everything (Postgres + build + server)

```bash
npm run start:full
```

#### Option B: dev mode (assumes database is already available)

```bash
# start postgres (if you use docker)
cd docker && docker-compose up -d
cd ..

# run the server
npm run dev
```

By default the server listens on `http://localhost:8085` (override with `PORT`).

### Session cookie and HTTPS

Login sets an httpOnly `sessionId` cookie backed by PostgreSQL. In production
the site is served over HTTPS (CloudFront + ACM — see
[`docs/current/OPS_TLS_AND_HTTPS.md`](docs/current/OPS_TLS_AND_HTTPS.md)) and
[`src/services/authCookieOptions.ts`](src/services/authCookieOptions.ts)
automatically emits `Secure; HttpOnly; SameSite=Strict` whenever `req.secure`
is true or `NODE_ENV=production`. For plain **HTTP local dev**, no env var is
needed — the cookie falls back to `SameSite=Lax` / `Secure=false`. Emergency
rollback: set `DISABLE_SECURE_COOKIES=1` to revert to the pre-Phase-0 shape.

### Run tests (unit + integration)

```bash
# unit tests
npm run test:unit

# integration tests (requires a database)
npm run test:integration
```

### Verify the server is running

Use the **health check endpoint**:

```bash
curl -s http://localhost:8085/health | jq -r '
"Server Health Check
┌─────────────────────────────────────────────────────────────┐
│ Status: " + (if .status == "OK" then "OK" else "ERROR" end) + " │
│ Uptime: " + (.uptime | floor | . / 3600 | floor | tostring) + "h " + ((.uptime | floor) % 3600 / 60 | floor | tostring) + "m " + ((.uptime | floor) % 60 | tostring) + "s │
│ Database: " + (if .database.status == "OK" then "Connected" else "Error" end) + " (" + (.database.latency // "N/A") + ") │
│ Response Time: " + .latency + " │
│ Environment: " + .environment + " │
├─────────────────────────────────────────────────────────────┤
│ Latest Git Commit: │
│ " + .git.shortCommit + " - " + .git.commitMessage + " │
├─────────────────────────────────────────────────────────────┤
│ Latest Migration: │
│ V" + .database.migrations.latest.version + " - " + .database.migrations.latest.description + " │
└─────────────────────────────────────────────────────────────┘"'
```

### Deployments

Pushes to `main` run the full **Build, Test, and Deploy** workflow. If GitHub
stalls before allocating jobs, maintainers can manually dispatch `deploy.yml`
from `main`; the manual path runs the same production deployment and health
checks as a push.

### Docs

- **Current**: `docs/current/`
- **History**: `docs/history/`
- **Product/UI**: `docs/`
