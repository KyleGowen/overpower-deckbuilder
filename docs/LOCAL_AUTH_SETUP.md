# Local Auth Setup (Username/Password + Google Sign-In)

## Prerequisites

1. **PostgreSQL** running (e.g., `localhost:1337` — matches default `.env`)
2. **Node.js** dev server: `npm run dev`
3. **`.env`** in project root with Firebase client config (see below)

## .env for Local Development

```env
# Database (required for username/password login)
DATABASE_URL=postgresql://postgres:password@localhost:1337/overpower
DATA_SOURCE_TYPE=postgresql

# Firebase (required for Google Sign-In)
FIREBASE_API_KEY=your_api_key_from_firebase_console
FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_APP_ID=your_app_id
```

The backend reads the Firebase service account from `infra/firebase-service-account.json` when `FIREBASE_SERVICE_ACCOUNT_JSON` is not set in `.env`.

## Firebase Console: Authorized Domains

For local Google Sign-In, add both to **Authentication → Settings → Authorized domains**:

- `localhost`
- `127.0.0.1`

## Troubleshooting "Can't Sign In"

| Symptom | Cause | Fix |
|---------|-------|-----|
| Username/password fails | Database not running | Start Postgres; ensure port matches `DATABASE_URL` |
| Username/password fails | Migration not run | Run `npm run migrate` |
| "Google sign-in is not available" | Firebase config empty | Ensure .env has all 4 Firebase vars; restart server |
| "Google sign-in is not configured" | Service account missing | Ensure `infra/firebase-service-account.json` exists |
| Google popup then error | Firebase key rotated | Get new API key from Firebase Console → Project settings → Your apps → Config; update .env |
| Google popup then "Please confirm account creation" | New user skipped confirmation | Click **Create Account** on the confirmation screen after choosing Google |
| Google blocked on localhost | Domain not authorized | Add `localhost` and `127.0.0.1` to Firebase Auth → Settings → Authorized domains |

## Quick Checks

```bash
# 1. Start server
npm run dev

# 2. In another terminal: verify Firebase config endpoint
curl -s http://localhost:8085/api/config/firebase | jq .
# Should show apiKey, authDomain, projectId, appId (non-empty)

# 3. Health check
curl -s http://localhost:8085/health | jq .status
# Should show "OK"
```
