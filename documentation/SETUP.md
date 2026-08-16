# Setup — local development

## Prerequisites

- Node 20+, npm
- A PostgreSQL database (a free [Neon](https://neon.tech) branch works; local Postgres works too — enable the `pg_trgm` extension)

> **A remote database must carry `?sslmode=verify-full`.** Both apps refuse to start without it — `verifiedDbSsl.ts` checks the connection string, because weaker modes (`require`, `prefer`, `verify-ca`) are verified only by accident of the current `pg` release and stop being verified in `pg` v9. A `localhost` database is exempt; there is no certificate to verify. This is the most common first-run failure.

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

Everything below is validated at boot by the Zod schema in `src/config.ts` — the server refuses to start on a bad value, and the error names the offending variable.

| Var | Required | What |
|---|---|---|
| `DATABASE_URL` | **yes** | Postgres connection string (`?sslmode=verify-full` when remote) |
| `PORT` | no (4000) | |
| `FRONTEND_URL` | no (`http://localhost:3000`) | CORS origin; must include the scheme |
| `DATABASE_POOL_SIZE` | no (25) | |
| `GEMINI_API_KEY` | no | Ask AI natural-language roll; route 503s if unset |
| `METRICS_TOKEN` | no | bearer token for `/api/metrics/*`; endpoints 503 if unset |
| `TMDB_API_KEY`, `OMDB_API_KEY` | no | data-pipeline enrichment only, never at runtime |
| `RESEND_API_KEY`, `OWNER_EMAIL` | no | feedback email notifications |
| `SENTRY_DSN`, `SENTRY_DEBUG` | no | error tracking; disabled when unset |
| `RATE_LIMIT_WINDOW_MS` / `_MAX_PER_IP` / `_MAX_PER_USER` / `_DISABLED` | no | rate-limit knobs (defaults 60000 / 300 / 600 / false) |
| `SLOW_QUERY_THRESHOLD_MS`, `SLOW_REQUEST_THRESHOLD_MS` | no (100 / 200) | ops logging |

**Read outside the schema** — these are *not* boot-validated, so a mistake surfaces at request time instead:

| Var | Required | What |
|---|---|---|
| `NEXTAUTH_SECRET` | for signed-in features | Read from `process.env` by `middleware/auth.ts`. Must equal the frontend's — it verifies the JWT bridge. Missing it means every authenticated request returns 500 `MISSING_SECRET` while the server itself looks healthy. |
| `REC_QUALITY_WEIGHT` | no (0.8) | Recommender scoring knobs, read by `lib/experiments.ts`. Retune the ranker without a redeploy; each A/B variant layers its own overrides on top. |
| `REC_RECENCY_WEIGHT` | no (0.15) | |
| `REC_MMR_LAMBDA` | no (0.7) | MMR diversity trade-off — 1.0 is pure relevance, 0.0 pure novelty |

### Frontend (`frontend/.env.local`)

| Var | Required | What |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | **yes** | backend URL, locally `http://localhost:4000` |
| `NEXTAUTH_SECRET` | **yes** | same value as the backend's |
| `DATABASE_URL` | **yes** | same DB — Auth.js stores users/accounts there |
| `AUTH_GOOGLE_ID`, `AUTH_GOOGLE_SECRET` | for Google sign-in | Google OAuth credentials |
| `RESEND_API_KEY`, `EMAIL_FROM` | for password-reset emails | the mailed one-time reset link |
| `NEXT_PUBLIC_SITE_URL` | no | canonical URL for SEO/OG |
| `NEXT_PUBLIC_SENTRY_DSN` | no | error tracking |
| `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION` | no | Search Console ownership token; production only, leave empty locally and on previews |

Sign-in is **email + password** (bcrypt) or **Google OAuth**. There is no email OTP flow.

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

cd backend
npm test                    # unit tests (Vitest)
npm run test:integration    # needs a local test DB (cineroll_test + pg_trgm)
npm run eval:recommender    # offline eval harness, read-only
npm run load-check          # latency check; -- --base=<url> to target a deploy

cd ../frontend
npm run test:e2e            # Playwright: golden path, home, pool count, accessibility
```

`npm run build` runs `check:build-inputs` first — a guard that fails the build if a file the deploy needs (the Prisma schema and migrations, chiefly) has been gitignored. A missing schema on Vercel is a boot crash with no useful error, so it is caught here instead.
