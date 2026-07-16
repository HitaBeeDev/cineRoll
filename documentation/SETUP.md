# Setup — local development

## Prerequisites

- Node 20+, npm
- A PostgreSQL database (a free [Neon](https://neon.tech) branch works; local Postgres works too — enable the `pg_trgm` extension)

## Install & run

```bash
git clone <repo> && cd cineroll
npm install                 # installs all workspaces, generates the Prisma client

# env files
cp backend/.env.example backend/.env      # fill in DATABASE_URL at minimum
cp frontend/.env.example frontend/.env.local

npm run dev                 # backend on :4000 + frontend on :3000, concurrently
```

Sanity check: `http://localhost:4000/health` should return `{ ok: true, db: "up" }`.

## Environment variables

### Backend (`backend/.env`)

Validated at boot (`src/config.ts`) — the server refuses to start on a bad value.

| Var | Required | What |
|---|---|---|
| `DATABASE_URL` | **yes** | Postgres connection string |
| `NEXTAUTH_SECRET` | for signed-in features | must equal the frontend's — verifies the JWT bridge |
| `PORT` | no (4000) | |
| `FRONTEND_URL` | no (`http://localhost:3000`) | CORS origin |
| `DATABASE_POOL_SIZE` | no (25) | |
| `GEMINI_API_KEY` | no | "Describe It" natural-language roll; route 503s if unset |
| `METRICS_TOKEN` | no | bearer token for `/api/metrics/*`; endpoints 503 if unset |
| `TMDB_API_KEY`, `OMDB_API_KEY` | no | data-pipeline enrichment only, never at runtime |
| `RESEND_API_KEY`, `OWNER_EMAIL` | no | feedback email notifications |
| `SENTRY_DSN`, `SENTRY_DEBUG` | no | error tracking; disabled when unset |
| `RATE_LIMIT_WINDOW_MS` / `_MAX_PER_IP` / `_MAX_PER_USER` / `_DISABLED` | no | rate-limit knobs |
| `SLOW_QUERY_THRESHOLD_MS`, `SLOW_REQUEST_THRESHOLD_MS` | no | ops logging |

### Frontend (`frontend/.env.local`)

| Var | Required | What |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | **yes** | backend URL, locally `http://localhost:4000` |
| `NEXTAUTH_SECRET` | **yes** | same value as the backend's |
| `DATABASE_URL` | **yes** | same DB — Auth.js stores users/sessions there |
| `AUTH_GOOGLE_ID`, `AUTH_GOOGLE_SECRET` | for Google sign-in | Google OAuth credentials |
| `RESEND_API_KEY`, `EMAIL_FROM` | for email OTP sign-in | |
| `NEXT_PUBLIC_SITE_URL` | no | canonical URL for SEO/OG |
| `NEXT_PUBLIC_SENTRY_DSN` | no | error tracking |

## Getting film data

The catalog seeds from `backend/data/master.json`:

```bash
cd backend
npm run db:seed-master
```

**The raw data files are private.** Excel award sources, `master.json`, recall/export files (`backend/data/`, `backend/film-data/`) are project assets that stay outside git — a fresh clone has an empty catalog until the owner provides `master.json`.

## Tests & checks

```bash
npm run lint          # both apps
npm run type-check    # all workspaces
cd backend && npm test              # unit tests
cd backend && npm run test:integration   # needs a local test DB (cineroll_test + pg_trgm)
```
