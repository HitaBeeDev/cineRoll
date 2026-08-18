# CineRoll

Technical documentation for the CineRoll codebase — what the system is, how it is
built, how to run it, and what you need to know before changing it.

This is the project's single documentation file and it is self-contained —
everything a developer needs to understand, run, and change the system is here.
(The repository also has a gitignored `docs/` folder; that is the owner's private
working notes, not part of the project's documentation.)

**Last updated:** 2026-08-18.

## Contents

[Overview](#overview) · [Features](#features) · [Architecture](#architecture) ·
[Technology Stack](#technology-stack) · [Project Structure](#project-structure) ·
[Installation](#installation) · [Environment Configuration](#environment-configuration) ·
[Development](#development) · [API](#api) · [Database](#database) ·
[Authentication](#authentication) · [Application Flows](#application-flows) ·
[Algorithms](#algorithms) · [Future Work](#future-work) ·
[Performance and Caching](#performance-and-caching) · [Testing](#testing) ·
[CI/CD](#cicd) · [Deployment](#deployment) · [Security](#security) ·
[Error Handling and Logging](#error-handling-and-logging) ·
[Troubleshooting](#troubleshooting) · [Known Limitations](#known-limitations)

---

## Overview

CineRoll is a film-discovery web app for **award-winning cinema**. It holds one
clean catalog of roughly 9,200 titles — features, shorts, documentaries and
series — resolved out of a century of Oscar, Golden Globe, Cannes and Berlinale
award data, and puts an algorithmic layer on top: content-based recommendations,
a learned taste model, and bandit-driven random "rolls".

Live site: [cineroll.de](https://cineroll.de/).

### The problem it solves

Award data arrives as Excel workbooks assembled by Python scripts, one row per
*nomination*, spread across four award bodies and about a hundred years of
inconsistent formatting. The same film appears under different titles (*The Lives
of Others* vs *Das Leben der Anderen*), in different ceremony years, and each body
names its categories differently. Stored naively, *The Godfather* exists three
times, each row carrying a fragment of its award history — useless for a query
like "films that won at both Cannes and the Oscars", and poisonous as input to a
recommender.

The pipeline solves this with **entity resolution against an external authority**:
candidate films are matched to TMDB, and the TMDB ID becomes the identity key.
Rows that resolve to the same ID are the same film, whatever they are titled.
Award records merge onto one canonical row; anything without a confident match
goes to a manual recall queue rather than being silently dropped or written
half-broken. The result is a catalog where every film carries its complete award
history — the foundation everything else stands on.

### Who uses it

Film viewers who want something worth watching tonight and trust awards as a
quality signal. Two usage modes:

- **Guest** — browse, filter, search, roll, read film and person pages, use Ask AI
  and the daily pick. No account needed; a session-local history keeps the roll
  from repeating itself.
- **Signed in** — everything above plus a watchlist, custom lists, watch history
  with sentiment, award-completion progress, personalized recommendations, a
  taste-weighted roll, and a notifications feed.

### Main workflows

1. **Browse** — filter the catalog by award body, winner/nominee, category, genre,
   decade, language, country, runtime, rating, and more; results paginate with live
   facet counts so no filter combination dead-ends.
2. **Roll** — "one spin, one film": the app picks a single title from the current
   filtered pool, ranked and sampled rather than uniformly random.
3. **Ask AI** — type a sentence ("a slow 70s thriller") and get four real films.
4. **Recommendations** — signed-in picks with a human-readable reason per card.
5. **Track** — save to watchlist, mark watched with a sentiment, build lists, watch
   award-completion progress fill in.

---

## Features

| Feature | What it does | Where it lives |
|---|---|---|
| **Browse & filter** | ~25 filter dimensions over the catalog, with facet counts computed for the current filter set so dead options can be annotated or disabled | `frontend/src/components/browse/`, `backend/src/routes/filmsRoute/`, `lib/filmFilters/` |
| **Search & autocomplete** | Typo-tolerant film/person/director search using Postgres `pg_trgm` trigram indexes | `backend/src/routes/autocomplete.ts`, `lib/people/` |
| **The Roll** | One film at a time from the filtered pool: hard quality gate, session diversity memory, taste weighting, Thompson-sampled Safe/Gem/Wild lanes, ε-greedy exploration | `backend/src/routes/randomRoute/`, `frontend/src/features/roll/` |
| **Pick of the Day** | One film per calendar day, identical for every user, never repeating within a year, no nightly job | `backend/src/lib/pickOfDay/`, `frontend/src/features/daily-picks/` |
| **Recommendations** | Content-based picks with an explanation per card; returns `NOT_ENOUGH_DATA` rather than faking it | `backend/src/lib/recommender/`, `frontend/src/features/recommendations/` |
| **Ask AI** | Free-text prompt → typed filters → candidates → rerank → 4 films. Gemini translates the prompt, the database decides the results; works without a key on a local fallback | `backend/src/routes/naturalRollRoute/`, `frontend/src/features/describe/` |
| **Film & person pages** | Full award history per film, similar films, person profiles with their films and awards | `frontend/src/features/film-detail/`, `person-detail/` |
| **Watchlist, watched, lists** | Save, mark watched with `love`/`like`/`dislike`, build named lists; every action also becomes a taste signal | `backend/src/routes/userRoute/`, `frontend/src/features/watchlist/`, `watch-history/` |
| **Award progress** | How much of each award body the user has seen | `frontend/src/features/completionist/` |
| **Notifications** | Site-wide announcements ("films added", "awards updated"), written by the pipeline | `frontend/src/features/notifications/` |
| **Stats** | Aggregate catalog stats per award body, decade, genre | `backend/src/routes/statsRoute/`, `frontend/src/features/stats/` |
| **Marathon** | 1–5 themed films in one call with a total runtime | `backend/src/routes/marathon.ts` |
| **Auth & account** | Email + password or Google; password reset by mailed link; data export and account deletion | `frontend/src/auth.ts`, `frontend/src/app/api/auth/` |
| **Analytics spine** | Every meaningful action becomes one typed `Event` row; A/B variant tagged at write time | `backend/src/routes/events.ts`, `lib/events.ts` |

---

## Architecture

CineRoll is a **client-server application with a separate API service**, plus an
offline data pipeline that builds the catalog before anything runs.

### System at a glance

```
 ┌─────────────────────────────────────────────────────────────────────┐
 │  BUILD TIME — data pipeline (offline, run by the owner)             │
 │                                                                     │
 │  award .xlsx (Oscar · Golden Globe · Cannes · Berlinale)            │
 │        │                                                            │
 │        ▼   build-master.ts  ── TMDB + OMDB enrich ──┐               │
 │   entity resolution (match key = TMDB ID)           │               │
 │   merge award bodies into ONE row · dedup           │               │
 │   unmatched → needs-recall.xlsx / master-fails.xlsx │               │
 │        ▼                                            │               │
 │   master.json  ── seed-master.ts ──►  PostgreSQL (Neon)             │
 └─────────────────────────────────────────────────────────────────────┘
                                  │
 ┌────────────────────────────────┼────────────────────────────────────┐
 │  RUN TIME                      ▼                                    │
 │                                                                     │
 │  Browser ──► Next.js 16 (App Router)                                │
 │                ├─ Server Components / pages  (UI, SEO, ISR-ready)   │
 │                ├─ BFF proxy routes  /api/*   (inject JWT, forward)  │
 │                └─ Auth.js v5 session store ─┐                       │
 │                         │ Authorization: Bearer <JWT>               │
 │                         ▼                                           │
 │              Express 5 API  ─────────────────────────────────────┐  │
 │                ├─ routes/    (films, random, recommendations, …) │  │
 │                ├─ lib/       ★ algorithm layer (taste, recommender) │
 │                ├─ middleware (auth, rate-limit, errors, validate)│  │
 │                └─ Prisma ──► PostgreSQL (Neon)  ◄── same DB ─────┘  │
 │                                  ▲                                  │
 │                       Auth.js Prisma adapter writes User/Account/   │
 │                       Session to this same database                 │
 └─────────────────────────────────────────────────────────────────────┘
```

**One-line data flow:** Excel award files → enrich + entity-resolve →
`master.json` → seed → Postgres → Express API → Next.js (BFF + UI) → browser.

### Why this shape

- **A real Express backend, not Next API routes.** The algorithm layer has its own
  middleware pipeline, unit tests, offline eval harness and load check — it
  deserves a lifecycle independent of the frontend.
- **Postgres over a document store.** The data is relational and the product leans
  on two Postgres features directly: `pg_trgm` for typo-tolerant search and GIN
  indexes for genre/array filtering. Schema flexibility is handled *before* the
  database, in the pipeline.
- **One shared types package.** The API contract lives in `packages/types` and
  compiles into both apps; changing the `Film` shape breaks the build, not
  production.
- **One error shape.** Every backend error is `{ "error": "…", "code": "…" }`.
  There is exactly one format for clients to handle.

### Monorepo layout

npm workspaces, three packages:

```
cineroll/
├── frontend/         Next.js 16 app (App Router, React 19, Tailwind v4)
├── backend/          Express 5 API + Prisma + the data pipeline scripts
└── packages/types/   shared TypeScript types (Film, FilterState, …)
```

A monorepo (not split repos) keeps the shared `@cineroll/types` contract honest
across the wire — the same `Film` / `FilterState` shapes compile on both sides.

### Frontend (Next.js 16, App Router)

Three responsibilities, kept distinct:

1. **Presentation** — Server Components render the pages (home, browse, film and
   person detail, picks, ask-ai, stats, profile and its sub-pages — watchlist,
   lists, history, notifications, settings — plus auth and the legal pages).
   Styling is Tailwind v4 + Framer Motion + Radix. **No global CSS** beyond
   variables and resets: every style lives in its own component.
2. **BFF proxy** — `frontend/src/app/api/*` routes are thin forwarders. They read
   the Auth.js session, attach the JWT, and call the Express backend via
   `apiWithAuth`. They hold no catalog logic and never query the catalog tables.
   Example: `POST /api/user/watchlist` just forwards to Express
   `/api/user/watchlist`.
3. **Auth session store** — Auth.js (NextAuth v5) owns sign-in. `src/auth.ts`
   wires the Auth.js Prisma adapter, which persists `User` / `Account` / `Session`
   to the shared database.

**Where the frontend does touch Prisma directly.** Account management is the
deliberate exception to (2): credential sign-up, password change/reset and the
avatar picker are *auth* concerns whose tables Auth.js already owns, so routing
them through Express would mean a second writer to the same rows. They talk to
the database from the Next server: `src/auth.ts`,
`api/auth/{register,change-password,forgot-password,reset-password}/route.ts`,
`api/user/avatar/route.ts`, and `profile/settings/page.tsx`. Everything catalog-
or signal-shaped still goes over the wire to Express.

This is a deliberate **Backend-for-Frontend** split: the browser never holds the
backend JWT or talks to Express directly; the Next server does, over a trusted
boundary.

### Backend (Express 5)

Middleware pipeline — the order matters:

```
/api/backend prefix rebase (Vercel service rewrite; no-op in local dev)
       → helmet → cors(credentials) → compression → morgan → slowRequestLogger
       → express.json → GET /health (probes the DB: 200 db-up / 503 db-down)
       → /api: optionalAuth → globalRateLimit → router
       → Sentry error handler → errorHandler (last)
```

- `optionalAuth` identifies the caller best-effort (sets `req.userId` when a valid
  token is present) so the limiter can enforce a **per-user** budget on top of the
  **per-IP** one; it never rejects. Protected routes keep their own `requireAuth`
  guard.
- `globalRateLimit` — fixed-window per-IP and per-user limits (`rateLimit.ts`).
- `errorHandler` — one place maps errors to consistent shapes:
  `ZodError → 400 VALIDATION_ERROR`, typed `HttpError → status + code`, everything
  else `→ 500 INTERNAL_ERROR { error, code }`.

**Routes vs. lib.** Routes are thin: parse, Zod-validate, delegate. The
interesting code lives in `backend/src/lib/`. Endpoint groups: catalog (`films`,
`autocomplete`, `persons`, `stats`), discovery (`random`, `roll`, `pick-of-day`,
`recommendations`, `natural-roll`), user data (`user` — watchlist, watched, lists,
onboarding, progress, notifications, account — and `feedback`), analytics
(`events`, `metrics`), games (`marathon`).

Add a new endpoint by adding a route file under `routes/` that validates input and
calls into `lib/`; do not put business logic in the route.

### Event flow (analytics spine)

Every meaningful user action becomes one typed `Event` row, and everything
downstream reads from it:

```
user action (roll, click, save, watch, rate, search, rec served/clicked, …)
      │  frontend fires → BFF /api/events → Express /api/events
      ▼
Event row  { type: EventType, userId | anonId, sessionId, filmId?,
             context: Json, variant: "rec_ranker_v1:…" }
      │
      ├──► /api/metrics/*  — funnels per A/B arm (served → CTR / save / watch)
      ├──► signal mutations (watch/rate/save) also flag UserTasteProfile stale
      │      → next read rebuilds the taste vectors
      └──► roll engagement rewards update the Thompson lane bandit (RollLaneBandit)
```

One table, 15 event types, `variant`-tagged at write time — so A/B analysis,
recommender metrics and taste learning share one source of truth instead of three
tracking systems.

---

## Technology Stack

| Layer | Choice | Version | Notes |
|---|---|---|---|
| Runtime | Node.js | ≥ 20 | enforced by `engines` in the root `package.json` |
| Language | TypeScript | 5.x frontend / 6.x backend | strict across all workspaces |
| Frontend framework | Next.js (App Router) | 16.2.4 | Server Components, ISR on film pages |
| UI | React | 19.2.4 | |
| Styling | Tailwind CSS | v4 | plus Framer Motion, Radix UI, lucide-react |
| Auth (frontend) | Auth.js / NextAuth | v5 beta | Credentials + Google, Prisma adapter |
| Backend framework | Express | 5.2 | helmet, cors, compression, morgan |
| ORM | Prisma | 7.8 | `@prisma/adapter-pg` over `pg` 8 |
| Database | PostgreSQL | — | Neon in production; needs `pg_trgm` |
| Validation | Zod | 4.x | every boundary, plus env at boot |
| JWT | jose | 5.x (pinned at root) | see the hoisting note below |
| LLM | Google Gemini (`@google/generative-ai`) | 0.24 | Ask AI only; optional, with a local fallback |
| Email | Resend | 6.x | password reset + feedback notifications |
| Errors | Sentry (`@sentry/node`, `@sentry/nextjs`) | 10.x | gated on a DSN |
| Backend tests | Vitest | 4.x | unit + integration configs |
| E2E tests | Playwright | 1.5x | golden path, home, pool count, accessibility (axe-core) |
| Data pipeline | tsx scripts + `xlsx`, `sharp`, `node-vibrant` | — | TMDB + OMDB enrichment |
| Tooling | ESLint 9, husky, lint-staged, commitlint | — | conventional commits |
| Hosting | Vercel (both services) + Neon | — | |

> **`jose` is pinned in the root `package.json` on purpose.** Vercel bundles the
> backend function from the *root* `node_modules` and drops anything nested under
> `backend/node_modules`. `next-auth` pulls `jose@6` (ESM-only), which would take
> the root slot and force the backend's CommonJS `jose@5` to nest — where Vercel
> silently omits it, producing `Cannot find module jose` on every backend route.
> Do not remove that dependency without running `scripts/check-build-inputs.mjs`.

---

## Project Structure

```
cineroll/
├── frontend/
│   ├── e2e/                      Playwright specs (golden-path, home, pool-count, accessibility)
│   └── src/
│       ├── app/                  App Router: pages, layouts, route handlers
│       │   ├── api/              BFF proxy routes (auth, user, films, events, feedback, og)
│       │   ├── browse/ film/ person/ picks/ ask-ai/ stats/ profile/ auth/ …
│       │   ├── sitemap.ts robots.ts
│       │   └── globals.css       CSS variables + resets ONLY
│       ├── auth.ts               Auth.js config (providers, adapter, callbacks)
│       ├── components/           shared UI (header, browse controls, auth widgets, …)
│       ├── features/             one folder per product surface (roll, recommendations,
│       │                         film-detail, watchlist, watch-history, notifications, …)
│       ├── hooks/                browse filters, film actions, autocomplete, facet counts
│       ├── lib/                  api clients (api.ts, apiWithAuth.ts), analytics, format,
│       │                         prisma.ts, site-url.ts, images, avatars
│       └── types/
│
├── backend/
│   ├── prisma/                   schema.prisma + migrations  (must stay tracked in git)
│   ├── data/scripts/             the Excel → master.json → DB pipeline (see below)
│   ├── test/                     Vitest unit + integration tests
│   └── src/
│       ├── index.mts             production entrypoint (Vercel)
│       ├── localDev.ts           local dev entrypoint
│       ├── httpApp.ts            app assembly + /api/backend prefix rebase
│       ├── config.ts             Zod-validated environment
│       ├── instrument.ts         Sentry init
│       ├── routes/               HTTP endpoints — thin: parse, validate, delegate
│       │   ├── filmsRoute/ randomRoute/ naturalRollRoute/ personsRoute/
│       │   ├── statsRoute/ userRoute/ metricsRoute/
│       │   └── events.ts feedback.ts marathon.ts pickOfDay.ts recommendations.ts roll.ts
│       ├── lib/                  ★ business logic and algorithms
│       │   ├── recommender/      candidates, scoring, MMR ranking, tfidf, reasons
│       │   ├── tasteProfile/     signal aggregation into taste vectors
│       │   ├── pickOfDay/        eligibility pool, prestige scorer, FNV-1a seed
│       │   ├── filmFilters/      the shared filter/query layer
│       │   ├── people/ validateFilters/
│       │   ├── cache.ts experiments.ts events.ts tasteWeights.ts prisma.ts
│       │   └── verifiedDbSsl.ts  refuses to boot on an unverified remote DB
│       ├── middleware/           auth, errorHandler, rateLimit, slowRequestLogger, validate
│       └── scripts/              evalRecommender.ts, loadCheck.ts
│
├── packages/types/               @cineroll/types — the shared API contract
├── scripts/check-build-inputs.mjs  guards that build inputs are not gitignored
├── vercel.json                   two-service topology + /api/backend rewrite
└── DOCUMENTATION.md              this file
```

Rules that keep this structure intact:

- **Frontend: one exported value per file.** App Router files (`page.tsx`,
  `route.ts`, `layout.tsx`) and private in-file helpers are exempt.
- **API calls go through `src/lib/api.ts` / `apiWithAuth.ts`**, never `fetch` from a
  component. Networking stays in one layer so components do not depend on
  transport details.
- **No global CSS.** `globals.css` holds CSS variables and bare resets only.
- **Backend logic lives in `lib/`**, not in `routes/`.
- **Never rename a `backend/src` file to `app.ts`, `index.ts` or `server.ts`** —
  Vercel treats those as entrypoints, and packaging a second one makes every route
  500.

---

## Installation

### Prerequisites

- Node 20+ and npm
- A PostgreSQL database with the `pg_trgm` extension enabled (a free
  [Neon](https://neon.tech) branch works; local Postgres works too)

> **A remote database must carry `?sslmode=verify-full`.** Both apps refuse to
> start without it — `verifiedDbSsl.ts` checks the connection string, because
> weaker modes (`require`, `prefer`, `verify-ca`) are verified only by accident of
> the current `pg` release and stop being verified in `pg` v9. A `localhost`
> database is exempt; there is no certificate to verify. This is the most common
> first-run failure.

### Install and run

```bash
git clone <repo> && cd cineroll
npm install                 # installs all workspaces, generates the Prisma client

cp backend/.env.example backend/.env       # fill in DATABASE_URL at minimum
cp frontend/.env.example frontend/.env.local

npm run dev                 # backend on :4000 + frontend on :3000, concurrently
```

Sanity check: `http://localhost:4000/health` should return `{ ok: true, db: "up" }`.

### Getting film data

The catalog seeds from `backend/data/master.json`:

```bash
cd backend
npx prisma migrate dev       # create the schema
npm run db:seed-master       # load the catalog
```

**The raw data files are private.** Excel award sources, `master.json` and the
recall/export files (`backend/data/`, `backend/film-data/`) are project assets
kept out of git — a fresh clone has an empty catalog until the owner provides
`master.json`.

---

## Environment Configuration

Copy the examples and fill them in; never commit real values.

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env.local
```

### Backend (`backend/.env`)

Everything below is validated at boot by the Zod schema in `src/config.ts` — the
server refuses to start on a bad value, and the error names the offending
variable.

| Var | Required | What |
|---|---|---|
| `DATABASE_URL` | **yes** | Postgres connection string (`?sslmode=verify-full` when remote) |
| `PORT` | no (4000) | |
| `FRONTEND_URL` | no (`http://localhost:3000`) | CORS origin; must include the scheme |
| `DATABASE_POOL_SIZE` | no (25) | |
| `GEMINI_API_KEY` | no | Ask AI natural-language roll. Unset is supported: both stages fall back to their local paths, with lower-quality results |
| `METRICS_TOKEN` | no | bearer token for `/api/metrics/*`; endpoints 503 if unset |
| `TMDB_API_KEY`, `OMDB_API_KEY` | no | data-pipeline enrichment only, never at runtime |
| `RESEND_API_KEY`, `OWNER_EMAIL` | no | feedback email notifications |
| `SENTRY_DSN`, `SENTRY_DEBUG` | no | error tracking; disabled when unset |
| `RATE_LIMIT_WINDOW_MS` / `_MAX_PER_IP` / `_MAX_PER_USER` / `_DISABLED` | no | rate-limit knobs (defaults 60000 / 300 / 600 / false) |
| `SLOW_QUERY_THRESHOLD_MS`, `SLOW_REQUEST_THRESHOLD_MS` | no (100 / 200) | ops logging |

**Read outside the schema** — these are *not* boot-validated, so a mistake
surfaces at request time instead:

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
| `DATABASE_URL` | **yes** | same database — Auth.js stores users/accounts there |
| `AUTH_GOOGLE_ID`, `AUTH_GOOGLE_SECRET` | for Google sign-in | Google OAuth credentials |
| `RESEND_API_KEY`, `EMAIL_FROM` | for password-reset emails | the mailed one-time reset link |
| `NEXT_PUBLIC_SITE_URL` | no | canonical URL for SEO/OG |
| `NEXT_PUBLIC_SENTRY_DSN` | no | error tracking |
| `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION` | no | Search Console ownership token; production only, leave empty locally and on previews |

---

## Development

### Everyday commands

```bash
npm run dev            # backend :4000 + frontend :3000, concurrently
npm run lint           # both apps
npm run type-check     # all workspaces
npm run build          # types → backend → frontend
```

`npm run build` runs `check:build-inputs` first — a guard that fails the build if a
file the deploy needs (the Prisma schema and migrations, chiefly) has been
gitignored. A missing schema on Vercel is a boot crash with no useful error, so it
is caught here instead. The same guard runs as a pre-commit hook.

### Data pipeline commands

All under `backend/`. These are **owner-run**, not part of CI, and several of them
spend external API budget — see [the data pipeline](#1-the-data-pipeline-entity-resolution)
for what they do and in what order.

```bash
npm run build-master      # Excel → TMDB/OMDB enrich → entity-resolve → master.json
npm run check-matches     # audit the TMDB matches before they are trusted
npm run merge-awards      # merge a second award body onto existing rows
npm run dedup-master      # collapse duplicate canonical rows
npm run oscar-cross-check # bidirectional Excel ↔ master audit
npm run recall-find | recall-lookup | recall-apply    # the manual recall queue
npm run omdb-enrich | tag-enrich | enrich-persons     # enrichment passes
npm run db:seed-master    # master.json → Postgres
npm run verify-seed       # post-seed sanity check
npm run announce          # write a site-wide notification row
```

### Coding conventions

- **TypeScript everywhere**, strict. No `any` without a comment saying why.
- **React components** are PascalCase; files are kebab-case; hooks are `useThing`;
  utilities are camelCase.
- **ESLint 9** (flat config in `eslint.config.cjs`) with `@typescript-eslint`
  recommended rules. Unused variables are errors unless prefixed `_`.
  `lint-staged` runs `eslint --max-warnings 0` on staged `.ts`/`.tsx`.
- **Validation at every boundary** with Zod — query params, request bodies, and the
  environment itself.
- **One exported value per file** on the frontend (App Router files exempt).
- **No global CSS.** Styles live with their component.
- **Comments explain why, not what.** The schema and the algorithm files carry the
  reasoning for non-obvious choices; keep that habit when you change them.

### Git workflow

- Trunk-based: `main` is the deploy branch. Work happens on a short-lived branch
  and merges back.
- **Conventional commits are enforced** by commitlint on the `commit-msg` hook:
  `feat:`, `fix:`, `refactor:`, `docs:`, `test:`, `chore:`. One short line.
- Pre-commit runs `lint-staged` plus `check-build-inputs`; a commit that would
  gitignore a build input is blocked.
- Update this file in the same commit whenever the architecture, setup, API,
  dependencies, configuration or deployment change.

---

## API

The reference below covers every endpoint group, the shared filter set, and every
error code. The route files themselves (`backend/src/routes/`) carry the exact Zod
schemas, which are the authority on parameter types.

Base path `/api` (locally `http://localhost:4000/api`). In production the browser
never calls the backend directly: the frontend proxies through
`/api/backend/*`.

### Conventions

Endpoints marked 🔒 need `Authorization: Bearer <JWT>` — the Auth.js session
token, attached by the frontend BFF. Everything else is public.

Every error has the same body:

```json
{ "error": "Film not found", "code": "FILM_NOT_FOUND" }
```

| Status | Code | When |
|---|---|---|
| 400 | `VALIDATION_ERROR` | query/body failed Zod validation |
| 401 | `MISSING_TOKEN` / `INVALID_TOKEN` | 🔒 endpoint without a valid JWT |
| 401 | `INVALID_METRICS_TOKEN` | metrics endpoint with the wrong token |
| 404 | `FILM_NOT_FOUND`, `NO_FILMS_FOUND`, `LIST_NOT_FOUND`, … | the named thing does not exist |
| 409 | `WATCHLIST_ALREADY_EXISTS`, `LIST_ENTRY_ALREADY_EXISTS` | duplicate add |
| 429 | `RATE_LIMITED` | over the per-IP / per-user budget |
| 500 | `INTERNAL_ERROR` | unhandled — logged and Sentry-reported |
| 503 | `METRICS_DISABLED` | metrics endpoint with no token configured |

Plural params are comma-separated (`genre=Drama,Thriller`); booleans are
`true`/`false`.

### Endpoint groups

| Group | Endpoints |
|---|---|
| **Catalog** | `GET /films` (browse, all shared filters) · `GET /films/:slug` · `GET /films/:slug/similar` · facet lists (`/films/genres`, `/categories`, `/award-years`, `/release-years`, `/certificates`, `/languages`, `/countries`, `/tv-types`) · `GET /films/facets` (counts for the current filter set) · `GET /films/people` · `GET /autocomplete` · `GET /persons/autocomplete`, `GET /persons/:slug` · `GET /stats` |
| **Discovery** | `GET /random` (the Roll) · `GET /random/count` · `POST /roll` · `GET /pick-of-day` · 🔒 `GET /recommendations` · `POST /natural-roll` (Ask AI, streams NDJSON) |
| **User** (all 🔒) | `/user/watchlist`, `/user/watched`, `/user/lists` (+ `/films`), `/user/onboarding`, `/user/film-status/:filmId`, `/user/summary`, `/user/progress`, `/user/notifications` (+ `/read`), `DELETE /user/account` |
| **Games** | `GET /marathon?count=3` |
| **Analytics** | `POST /events` (batched, 1–25 per call, 15 types) · `GET /metrics/recommendations`, `GET /metrics/rolls` (metrics token) |
| **Ops** | `GET /health` (no `/api` prefix; probes the DB) |

`GET /films`, `GET /random`, `GET /random/count` and `GET /marathon` share one
filter set: `search`, `person`, `director`, `awardBody`, `winnerOnly`,
`nominatedOnly`, `category`, `awardYear`, `genre`/`genreAll`, `contentType`,
`language`, `country`, `certificate`, `tvType`, `decadeMin`/`decadeMax`,
`imdbRatingMin`/`imdbRatingMax`, `rtScoreMin`, `runtimeMax`, `nominationCount`,
`winsMax`, `femaleDirectorOnly`, `sort`, `sortOrder`, `page`, `limit`.

Example:

```bash
curl "http://localhost:4000/api/films?genre=Drama&awardBody=cannes&winnerOnly=true&decadeMin=1970&decadeMax=1979"
```

`GET /random` additionally takes `personalized`, `excludeIds`, `rerollGenre`,
`rerollType`, `bandit`, `banditFeedback` and `seed` — the session-diversity and
bandit state described under [Algorithms](#algorithms).

**Adding an endpoint:** create the handler in `backend/src/routes/`, validate input
with a Zod schema, delegate to `lib/`, then add the matching BFF forwarder under
`frontend/src/app/api/` if the browser needs it. Update the API section of this
file in the same commit.

---

## Database

PostgreSQL via Prisma. Schema: `backend/prisma/schema.prisma`. 18 models, grouped
by purpose.

```
                 ┌──────────┐         ┌───────────┐
                 │  Person  │         │   User    │──┬── Account, Session,
                 └──────────┘         └───────────┘  │   VerificationToken,
                                            │        └── PasswordResetToken
   ┌──────────┐                             │
   │   Film   │◄────────────────────────────┤ Watchlist
   │ (canonical│◄───────────────────────────┤ WatchedFilm  (+ sentiment)
   │  award    │◄───────────────────────────┤ UserListEntry ──► UserList
   │  row)     │◄───────────────────────────┤ Event   ──► metrics, taste, bandit
   │           │◄───────────────────────────┤ RollEvent
   │           │◄─── PickOfDayHistory       │
   └──────────┘                             ├── UserTasteProfile  (derived, staleAt)
                                            └── RollLaneBandit    (Beta posteriors)
```

| Group | Models | Purpose |
|---|---|---|
| **Catalog** | `Film`, `Person` | one canonical row per film, carrying award arrays and counts for all four bodies |
| **Identity / auth** | `User` (+ `onboardingGenres`, `passwordHash`), `Account`, `Session`, `VerificationToken`, `PasswordResetToken` | Auth.js owns these tables |
| **Raw signals** | `WatchedFilm` (+ `WatchedSentiment`: `love`/`like`/`dislike`), `Watchlist`, `Event` (+ `EventType`), `RollEvent` | everything the taste model learns from |
| **Derived / cached** | `UserTasteProfile` (materialized taste vectors with `staleAt`), `RollLaneBandit` (per-user Beta posteriors per lane), `PickOfDayHistory` (one row/day, auditable and repeat-avoiding) | rebuilt from the raw signals; safe to drop and regenerate |
| **UGC** | `UserList`, `UserListEntry`, `SiteFeedback` | |
| **Announcements** | `Notification` | site-wide, not per-user |

### Fields worth knowing about

Beyond title/year/genres, a `Film` row carries the fields the algorithm layer
reads:

- `imdbRating` **with `imdbVotes`** — a score without its vote count is
  unfalsifiable: 8.5 from 500,000 votes and 8.5 from 40 are the same number.
  `null` votes means OMDB had no count, never "zero votes".
- `rtScore`, `imdbTopMovieRank`, `imdbTopTvRank`.
- `moodTags` and `keywords` — the semantic layer the Ask AI reranker scores
  in-process. Never SQL-filtered, so neither is indexed.
- `types[]` — the browse facets. A 9-minute war documentary is both `documentary`
  and `short`, which the single-valued `contentType` cannot express.
- `originCountries` — where a film is *from*. `countries` lists every co-financier
  and filtering on it is what made the country facet wrong; it is display-only.
- `posterColor`, `watchProviders` (fetched and stored, **not surfaced yet**).

Two schema decisions that trip people up:

- **`tmdbId` is unique only within a media namespace.** The same number can be a
  movie *and* a series (453 = *A Beautiful Mind* the film and *Mister Ed* the
  series), so uniqueness is `@@unique([tmdbId, contentType])`.
- **`Notification` references films by slug, not id**, because `seed-master`
  deletes and re-creates every `Film` row — a stored id would dangle after a
  reseed.

### Indexing

Deliberate, not default:

- GIN `pg_trgm` on `Film.title`, `Film.director` and `Person.name` for
  typo-tolerant search.
- GIN array indexes on `genres`, `countries`, `originCountries`, `types`.
- B-tree on `imdbRating`, `rtScore` (range/sort) and on `contentType`, `language`
  (low-cardinality equality — these enable a bitmap AND with the genres GIN).
- Composite indexes on `Event` for the metrics queries.

### Migrations

```bash
cd backend
npx prisma migrate dev       # local: create + apply a migration
npx prisma migrate deploy    # production: apply pending migrations
npx prisma generate          # regenerate the client (also runs on postinstall)
```

`prisma/schema.prisma` and `prisma/migrations/` **must stay tracked in git**.
Gitignoring them produces a Vercel boot crash with no useful error;
`check-build-inputs` exists to catch exactly that.

---

## Authentication

One identity, two consumers:

```
Browser ──sign in──► Auth.js v5 (Next)  ──Prisma adapter──► User/Account/Session (Neon)
                          │ issues JWT (NEXTAUTH_SECRET)
Browser ──action──► Next BFF route ──Bearer <JWT>──► Express
                                          │ auth middleware verifies JWT (jose + NEXTAUTH_SECRET)
                                          ▼ attaches req.userId → requireAuth guards
```

- **Sign-in methods:** email + password (Auth.js Credentials provider, bcrypt
  hashes in `User.passwordHash`) and Google OAuth. There is no email OTP flow.
- **Password reset** is a mailed one-time link (`PasswordResetToken`, sent via
  Resend).
- An account created through Google has no password hash, and the credential path
  rejects it rather than leaking that distinction.
- Credentials sign-in forces a **JWT session strategy** — a stateless credential
  check has no server session for the adapter to persist.
- Auth.js writes user/account rows to the *same* Neon database the API reads. No
  separate auth store, no duplicated user model.
- Express verifies the JWT itself (`middleware/auth.ts`, `jose`) rather than
  re-implementing sessions, so the backend stays stateless and the shared secret is
  the only coupling.

### Roles and access

There are no admin roles in the product. Access has three levels:

| Level | Can reach |
|---|---|
| Anonymous | catalog, roll, pick of the day, Ask AI, stats, `/health` |
| Signed-in user | everything above plus `/user/*` and `/recommendations` — scoped to their own rows by `req.userId`, never by a client-supplied id |
| Operator | `/api/metrics/*` behind `METRICS_TOKEN`; the data pipeline, run locally against a production `DATABASE_URL` |

`optionalAuth` runs on every `/api` request and never rejects; only `requireAuth`
on a protected route does.

---

## Application Flows

### 1. The data pipeline (entity resolution)

Source data is Excel assembled by Python scripts — one row per nomination — across
Oscar, Golden Globe, Cannes and the Berlinale. The same film recurs under different
titles, in different languages, across bodies, over roughly a hundred years. The
pipeline resolves that into **one canonical row per film**.

```
award .xlsx rows ──group by (title, release year)──► unique-film candidates
        │  build-master.ts:
        │    • TMDB search → match key = TMDB ID   ← the resolution pivot
        │    • OMDB → IMDb/RT ratings
        ▼
  already in master.json?  ── yes ──► MERGE award fields only, 0 API calls (idempotent)
        │ no
        ▼ create full record
  no TMDB match ──► needs-recall.xlsx / master-fails.xlsx  (never silently dropped)
        ▼
  master.json  ──seed-master.ts──►  Postgres
```

Supporting scripts (`check-matches`, `check-merge`, `merge-awards`,
`dedup-master`, `oscar-cross-check`, `move-to-recall`, `recall-*`) audit and
correct the resolution. The invariants:

- **The match key is the TMDB ID** — differently-titled entries across bodies
  collapse to the same row.
- **Idempotent** — re-running a batch already in `master.json` merges award data
  only and makes zero API calls.
- **No silent loss** — unmatched films are routed to a recall queue for manual
  resolution, not dropped or written broken.
- **API budget aware** — OMDB allows 1,000 calls/day, so work happens in batches
  and already-known films cost nothing.


### 2. A roll

```
user hits Roll
  → frontend sends the current filters + session signal
    (excludeIds, recent genres/types, reroll penalties, bandit state)
  → GET /api/random  →  BFF attaches JWT  →  Express /api/random
      ├─ hard eligibility gate (both ratings present, filters, exclusions, metadata)
      ├─ base roll (default):  Thompson bandit picks a lane (Safe / Gem / Wild),
      │                        then a weighted sample within that lane
      ├─ personalized roll (personalized=true + a userId, so signed-in only):
      │                        15% ε-greedy uniform draw, else a softmax-weighted
      │                        sample over taste scores
      └─ log one Event with a draw id
  → the card renders; the draw stays pending in session storage
  → whatever the user does next (open / save / watch / reroll) grades that draw,
    which feeds the decaying session penalties, the bandit reward, and the chain log
```

### 3. A recommendation request

```
🔒 GET /api/recommendations?limit=6
  → is the user's UserTasteProfile stale?  → rebuild it from signals
  → fewer than 3 positive signals?         → cold-start path (onboarding genres)
      → no signals and no onboarding?      → { code: "NOT_ENOUGH_DATA" }
  → candidate generation: exclude watched/watchlisted, keep top-6-genre matches,
    take the top 300 by IMDb rating
  → score each candidate
  → MMR re-rank for diversity
  → build one honest reason per card
  → return { modelVersion, coldStart, variant, recommendations }
  → the frontend fires a `recommendation_served` event tagged with the variant
```

### 4. Ask AI

```
POST /api/natural-roll  { prompt: "a slow 70s thriller" }
  → Stage 1: Gemini extracts typed filters (cached 24h by SHA-1 of the prompt)
             — falls back to a local regex extractor if Gemini is absent or fails
  → stream an `interpreted` event so the UI can show the chips immediately
  → candidate generation from the database; relax the query step by step
    if nothing matches, in a fixed priority order
  → Stage 2: rerank (Gemini, or the deterministic local reranker)
  → stream a `result` event with 4 films
```

The model interprets the prompt and may rerank candidates, but every returned film
comes from the database — the model never invents one. Invalid model output is
dropped rather than trusted.


---

## Algorithms

Where CineRoll uses a named algorithm, what it does, where it lives, and what is
tunable. Historical design notes for the roll engine are kept separately and are
not required to work with the current implementation.

| Algorithm | Feature | Where |
|---|---|---|
| Deterministic weighted scoring + FNV-1a seed | Pick of the Day | `lib/pickOfDay/` |
| Two-stage retrieve-then-rerank + query relaxation | Ask AI | `routes/naturalRollRoute/` |
| TF-IDF + cosine similarity | Film similarity, taste centroid | `lib/recommender/tfidf/` |
| Maximal Marginal Relevance (MMR) | Recommendation diversity | `lib/recommender/ranking.ts` |
| Thompson sampling bandit | Roll lane selection | `routes/randomRoute/bandit/` |
| Softmax + ε-greedy + weighted sampling | Personalized roll | `routes/randomRoute/` |
| Draw chain | Roll outcome measurement | `routes/randomRoute/eventLogger.ts` |

### Pick of the Day

`lib/pickOfDay/{service,scorer,repository,seed}.ts`. One film per calendar day,
the same for every user, no nightly job and no per-user state.

The eligibility pool is films with a poster that are either award winners/nominees
or have **both** `imdbRating ≥ 7` and `rtScore ≥ 70`, excluding anything picked in
the last `noRepeatDays = 365`, capped at the top `poolSize = 800` by prestige.
Prestige is `oscarWins·4 + cannesWins·3 + berlinWins·3 + ggWins·2 + nominations… +
imdbRating + rtScore/10`.

Each day the scorer min–max normalizes prestige within that day's pool, then:

```
score = quality + 0.45·underExposure + 0.50·dailySeed
```

`underExposure = 1 − rollCount/maxRolls` over a `rollWindowDays = 14` window damps
over-shown films. `dailySeed` is an FNV-1a hash of `"YYYY-MM-DD:filmId"` mapped to
[0,1) — a deterministic daily seed, so the pick is reproducible without storing RNG
state. Argmax wins, ties break on the smaller id, and the result is frozen into
`PickOfDayHistory`. The jitter and under-exposure terms can together outvote
quality, which is what keeps the pick rotating through the pool instead of walking
it in prestige order.

### Ask AI — retrieve then rerank

`routes/naturalRollRoute/`. A sentence becomes four real films:

```
prompt → structural extraction → candidate generation (+relaxation) → rerank → 4 films
```

**Stage 1, extraction** (`structuralExtractor.ts`) turns the sentence into typed
filters — language, genre, decade range, award body, winner/nominee. Gemini runs at
temperature 0.1, cached 24h by SHA-1 of the normalized prompt. A regex extractor
(`localStructuralExtractor.ts`) runs instead when there is no API key, and also
backfills every field Gemini omitted (`withLocalBackstop`) — the model's own value
wins where it answered.

**Candidate generation** (`candidateRelaxation.ts`) takes the top 100 by IMDb
rating matching the filters, then samples 50 at random. If nothing matches, it
relaxes constraints in a fixed order: `genresAll → genres → category → language →
awardYear → yearMin → yearMax`. Relaxing `genresAll` first turns require-*all*
genres into require-*any*. `contentType` is deliberately never relaxed — movie vs
series is a hard constraint.

**Stage 2, rerank** (`reranker.ts`) orders candidates and takes the top 4, via
Gemini (temperature 0.2) or the deterministic local reranker.

The route streams the two phases as separate NDJSON events so the UI shows the
interpreted chips before the picks land. Invalid model output is dropped rather
than trusted, and the whole feature works with no `GEMINI_API_KEY` — both stages
have a local path.

### TF-IDF + cosine similarity

`lib/recommender/tfidf/` (`createFilmTokens`, `buildIdf`, `createTfidfVector`,
`calculateCosineSimilarity`, `calculateCentroid`), with `recommender/idf.ts` and
`recommender/similarity.ts`.

Each film is a document and its feature tokens (`genre:*`, `director:*`,
`decade:*`, `award:*`) are terms. Binary TF × IDF, smoothed
`ln((1+N)/(1+df)) + 1` so weights stay positive. Similarity between two films is
the cosine of their sparse vectors; the centroid of a user's liked films is their
taste vector. IDF is computed catalog-wide and memoized for 1 hour, so rarity is
measured against the full library. This is what makes a shared "Film-Noir" count
for more than a shared "Drama".

Used by `GET /films/:slug/similar` and by MMR below.

### MMR — recommendation diversity

`lib/recommender/ranking.ts` (`rankCandidates`). Greedily builds the result set,
each step picking the film that maximizes:

```
MMR = λ · relevance − (1 − λ) · max_similarity_to_already_selected
```

Relevance is the normalized recommender score, similarity is the TF-IDF cosine
above. `λ` is `REC_MMR_LAMBDA`, default 0.70 — 1.0 is pure relevance, 0.0 pure
novelty. Without it the top six are near-identical films.

### Thompson sampling — roll lanes

`routes/randomRoute/bandit/` (`pickLaneWithThompsonSampling`,
`updateLanePosterior`, `PRIOR_POSTERIORS`, `banditRepository.ts`).

Each roll lane (Safe / Hidden Gem / Wild Card) is an arm with a Beta(α, β)
posterior over "does a roll from this lane earn engagement?". Choosing a lane draws
one sample per arm and takes the argmax — no exploration constant to tune. Cold
start priors reproduce the old fixed 70/20/10 split. Engagement updates the
posteriors (open/save/watch = 1, skip = 0) with an arm-strength cap that gives a
sliding memory. Posteriors persist in `RollLaneBandit` for signed-in users and in
localStorage for guests.

### Softmax, ε-greedy, weighted sampling — the roll

`GET /api/random` has two selection paths, chosen in `routes/random.ts:26` by
`personalized === true && userId != null`.

**Base roll** (`sessionRollService.ts`) — the default, and the only path for
guests. Thompson-samples a lane, weights the pool by what that lane rewards
(`laneWeight(scoreBreakdown(film, ctx))`), and draws with `weightedSample`. A
`seed` query short-circuits all of it to a plain deterministic pick, which is what
keeps the daily pick identical for everyone. **No ε-greedy here** — exploration
comes from the bandit.

**Personalized roll** (`personalizedService.ts`) — signed-in and opt-in. Scores a
top-N-by-rating pool with `recommender.scoreFilm`, converts scores to weights with
softmax (`exp((score − max)/T)`), and draws with `weightedSample`, an inverse-CDF
draw over the cumulative sum. With probability `EXPLORATION_EPSILON` it does a
uniform draw instead, tagged `exploration: true` on the event. `shouldExplore()`
is called only on this path.

Either way `weightedSample` falls back to uniform if every weight collapses to
~0, so a heavily-penalized or thin pool self-heals rather than dead-ending.

Tunables in `randomRoute/constants.ts`: `PERSONALIZED_POOL_SIZE = 300`,
`EXPLORATION_EPSILON = 0.15`, `SOFTMAX_TEMPERATURE = 0.5`.

Before scoring, a hard gate applies: a film needs **both** `imdbRating` and
`rtScore`, must match the user's filters, must not be excluded (`doNotSuggest`,
watched, already served this session), and must have title, year, type, genres and
a poster. Session diversity then applies decaying multipliers to recently-rolled
genres (last 3 rolls), content types and decades (last 2), and directors (last 5) —
never hard bans, so a narrow pool self-heals. Dimensions the user explicitly
filtered on are exempt: a pinned filter is a promise, not a preference.

### Draw chain — measuring the roll

`routes/randomRoute/eventLogger.ts`, `lib/filmFilters/queryParams/parentDrawParam.ts`,
`frontend/src/features/roll/`.

A roll writes one event and returns its id as a **draw id**. The client keeps that
draw in session storage as pending and records what the user does with it. The next
roll grades it — `engaged`, `rejected` or `passed` — and sends the verdict up with
the parent draw id and the draw's index in the session. One verdict feeds three
consumers: the decaying session penalties, the bandit reward, and the chain link in
the log.

This turns the event log into a chain rather than a pile, making these single
queries: how many draws before one lands (accept rate by `drawIndex`), which lane
earns engagement (outcome grouped by `lane`), and whether tighter filters produce
longer reroll chains.

Any response carrying a draw id is `private, no-store`. The daily pick is the
exception — same film for everyone, no lane, no draw id, publicly cacheable.

### Recommendations

`lib/recommender.ts` (`recommend()`), model version `content-v1`. Pipeline:
**signals → taste profile → candidates → scoring → MMR → reasons**.

**Signals** (`lib/tasteWeights.ts`) — each action is a signed weight, decayed with a
90-day half-life so current taste wins:

| Signal | Weight |
|---|---|
| Loved | +1.0 |
| Liked (thumbs up) | +1.0 |
| Watchlist add | +0.4 |
| Watched (no thumb) | +0.25 |
| "Not interested" | −0.6 |
| Disliked (thumbs down) | −1.0 |

Only the ratios matter — every vector is normalized by its largest absolute weight,
so scaling the table changes nothing. `love` ships equal to `like` because there is
no love-labelled data yet to fit a higher ratio against; equal-weighted it is a
no-op until there is. Read positives through `POSITIVE_SENTIMENTS`, never by
comparing to `"like"`, or loved films drop out of the set.

**Taste profile** (`lib/tasteProfile/`) folds signals into six vectors: genres,
directors, decades, runtime bands (`under_90` … `over_150`), award affinity
(`oscar_winner`, `cannes_nominee`, …) and rating tiers (`imdb_8`, `rt_90`). Each is
normalized by its largest weight, so a 5-signal and a 500-signal user land on the
same scale. Persisted in `UserTasteProfile` and rebuilt lazily: a new signal marks
it stale, the next read rebuilds it (also after 7 days regardless).

**Candidates** (`recommender/candidateRepository.ts`) — exclude watched and
watchlisted, keep films matching any of the user's top 6 genres, take the top 300
by IMDb rating. One indexed query, and every candidate has some taste relevance
before scoring starts.

**Scoring** (`recommender/scoring.ts`):

```
score = tasteScore + 0.8 · qualityPrior + 0.15 · recencyPrior
```

`tasteScore` is the dot product of the film's features against the user's vectors,
weighted per dimension: genre 1.0, director 0.8, award 0.6, decade 0.4, rating tier
0.4, runtime 0.3. `qualityPrior` is 75% normalized IMDb/RT average + 25% capped
award count, which anchors low-signal profiles to good films. `recencyPrior` scales
release year from 1920 to now — small, so it breaks ties without burying classics.
The two prior weights and `λ` are overridable via `REC_QUALITY_WEIGHT`,
`REC_RECENCY_WEIGHT`, `REC_MMR_LAMBDA` and per A/B variant.

**Reasons** (`recommender/reasonBuilder.ts`) — up to two true phrases built from the
same weights that produced the score: *"Because you liked Chinatown and watch a lot
of Crime."* Cold-start users have no history, so they get pedigree hooks instead
("A Cannes winner in Drama — one of your starting genres"), rotated by card
position.

**Cold start and honest failure** — under 3 positive signals, the onboarding genres
seed the genre vector with descending weight. No signals and no onboarding genres
returns `NOT_ENOUGH_DATA` rather than a guess.

### Evaluation and A/B

`src/scripts/evalRecommender.ts` is read-only and replays the production ranker.
Leave-most-recent-out per user: hold out the most recent
`max(1, min(5, ⌊0.3 · liked⌋))` liked films, rebuild taste from the rest, generate
candidates with the held-out films eligible, then measure recall@k / precision@k /
MRR at k = 5/10/20 over users with at least 5 liked films. Results are stored per
`modelVersion`.

```bash
npx tsx src/scripts/evalRecommender.ts --mmr-lambda=0.70,0.55
npx tsx src/scripts/evalRecommender.ts --love-weight=1,1.25,1.5,2
```

A/B (`lib/experiments.ts`): `assignVariant(actorId)` hashes the userId/anonId with
SHA-256 to a stable arm — same user, same arm, nothing stored. Each variant
overrides `qualityWeight`, `recencyWeight` and `mmrLambda`. Every event carries its
variant, so `GET /api/metrics/recommendations` and `/api/metrics/rolls` give a
per-arm funnel (served → CTR / save / watch).

**Experiment 1 (`rec_ranker_v1`)** tests whether lowering `λ` from 0.70 to 0.55
widens catalog coverage without losing held-out accuracy. It has **no result yet**:
the sweep runs end to end but matches 0 eligible users, because no account has ≥5
rated likes. `MODEL_VERSION` stays `content-v1` until there is data; when a new `λ`
becomes the baseline, bump it so eval records and served events attribute to the
new ranker.

---

## Future Work

Designed but not built. Kept separate from the sections above, which describe
shipped behaviour.

- **BM25 in the local reranker** (`naturalRollRoute/localReranker.ts` + a new
  `bm25.ts`). The local reranker currently scores a candidate by flat token
  overlap — 3 points per matching prompt word regardless of the word — plus an
  `imdbRating/2` prior, synonym expansion, an underrated boost and a gore penalty.
  Flat overlap over-rewards common words and ignores term frequency saturation and
  plot length. Okapi BM25 (`k ≈ 1.5`, `b ≈ 0.75`) adds IDF term weighting, TF
  saturation and length normalization, computed over the ~50 candidates already in
  hand. Only the overlap term would be replaced. Note this cannot reuse
  `recommender/tfidf/`: that module works on structured feature tokens for
  film-to-film similarity, the reranker matches free text against plot and title.
- **Mood tags in the roll.** `Film.moodTags` and `Film.keywords` are populated by
  the pipeline and scored by the Ask AI reranker, but not read by the roll scorer.
- **Graceful relaxation in the roll scorer.** Ask AI relaxes its query when a
  filter set returns nothing; the roll does not.
- **A confidence floor for Ask AI.** It always returns exactly N picks, with no
  reference-film input and no way to say the prompt could not be answered.
- **Per-roll explanation sentence** — requires the roll scorer to expose why a film
  won.

---

## Performance and Caching

- **Caching:** an in-memory LRU (`lib/cache.ts`, per instance — warm instances hit,
  but nothing is shared across them) with a Redis-ready interface, used for the hot
  reads: random pool counts, recommendations (short TTL plus explicit invalidation
  when a signal changes), the daily pick, and film detail. HTTP `Cache-Control` is
  set per endpoint; anything carrying a draw id is `private, no-store`.
- **Rate limiting:** global per-IP and per-user fixed windows, plus stricter
  sub-limits on the expensive or spam-prone paths (natural roll, data export,
  feedback), tunable via env. All of them share one fixed-window primitive held in
  process memory by default.
- **Pagination:** cursor-based on watchlist and watched; page-offset on browse (the
  catalog is small).
- **Database:** connection pooling via `@prisma/adapter-pg`, `DATABASE_POOL_SIZE`
  default 25. Neon should sit in the same region as the Vercel functions — the load
  check showed latency is dominated by app↔DB distance, not by code.
- **Targets** (`npm run load-check`): random and browse under 200 ms p95,
  recommendations under 150 ms warm.

---

## Testing

| Layer | Tool | Location | Command |
|---|---|---|---|
| Backend unit | Vitest | `backend/test/*.test.ts` | `npm test --workspace=backend` |
| Backend integration | Vitest + real Postgres | `backend/test/*.integration.test.ts` | `npm run test:integration --workspace=backend` |
| Frontend E2E | Playwright | `frontend/e2e/*.spec.ts` | `npm run test:e2e --workspace=frontend` |
| Accessibility | Playwright + axe-core | `frontend/e2e/accessibility.spec.ts` | part of `test:e2e` |
| Recommender eval | custom harness | `backend/src/scripts/evalRecommender.ts` | `npm run eval:recommender --workspace=backend` |
| Latency | custom harness | `backend/src/scripts/loadCheck.ts` | `npm run load-check --workspace=backend` |

```bash
npm run lint          # both apps
npm run type-check    # all workspaces

cd backend
npm test                    # unit tests
npm run test:integration    # needs a local test DB (cineroll_test + pg_trgm)
npm run eval:recommender    # offline eval harness, read-only
npm run load-check          # latency check; -- --base=<url> to target a deploy

cd ../frontend
npm run test:e2e            # golden path, home, pool count, accessibility
```

The **algorithm layer is the most heavily tested part of the codebase, on
purpose**: taste weights and aggregation, TF-IDF, MMR, the bandit, roll sampling
and session state, pick-of-day, natural-roll extraction and scoring, recommender
scoring, exclusions, cold start and reason variety, plus the pipeline invariants
(`buildMasterIdempotency`, `buildMasterFailureRouting`, `mergeAwards`,
`dedupeMaster`).

Integration tests need a real Postgres with `pg_trgm`: create a `cineroll_test`
database, enable the extension, and point the test config's connection string at
it. They are skipped, not failed, when no test database is reachable.

There is no enforced coverage threshold. The rule of thumb: **a pure function in
`lib/` that affects what a user sees gets a unit test**, and anything touching the
pipeline's invariants (idempotency, no-silent-loss, merge correctness) gets one
before it ships.

---

## CI/CD

There is **no GitHub Actions pipeline**. Checks run in two places:

**1. Local git hooks (husky).**

| Hook | Runs |
|---|---|
| `pre-commit` | `lint-staged` → `eslint --max-warnings 0` on staged `.ts`/`.tsx`; then `scripts/check-build-inputs.mjs` |
| `commit-msg` | `commitlint` with `@commitlint/config-conventional` |

`check-build-inputs.mjs` blocks the commit if a file the build reads (the Prisma
schema and migrations, chiefly) is gitignored or uncommitted. It catches a
production-only outage before a broken deploy exists.

**2. Vercel on push.** Pushing to a branch produces a preview deployment; merging
to `main` deploys production. The build runs `npm run build`, which runs
`check:build-inputs` first, then builds `packages/types` → `backend` → `frontend`.
A failing type-check or lint fails the build.

If a deploy fails, check in this order: the build log's `check-build-inputs` line;
whether a new dependency landed under `backend/node_modules` instead of the root
(the `jose` trap); and whether any environment variable was added to the code but
not to the Vercel project.

---

## Deployment

Target: **one Vercel project runs both apps**, Neon runs Postgres.

### Topology

```
vercel.json
├── frontend service  →  Next.js app        (all routes)
└── backend service   →  Express (src/index.mts), behind the rewrite
                          /api/backend/*  →  backend service
```

- The rewrite forwards the **full** path; `httpApp.ts` strips the `/api/backend`
  prefix, so route code is identical in local dev and production.
- Nothing else in `backend/src` may be named `app.ts`, `index.ts` or `server.ts` —
  Vercel treats those as entrypoints, and packaging a second one makes every route
  500.
- The browser only ever talks to the frontend origin; the backend is reached
  through the rewrite, same-origin.
- Neon should be in the same region as the Vercel functions.

### Steps

1. **Neon** — create the production database, enable `pg_trgm`, copy the pooled
   connection string.
2. **Vercel** — import the repo; `vercel.json` defines both services, no extra
   config.
3. **Env vars** — set them in the Vercel project; both services read from the same
   project env. `DATABASE_URL` must end in `?sslmode=verify-full` (Neon hands you
   `sslmode=require`, which both apps reject on a remote host). `NEXTAUTH_SECRET`
   must be identical for both apps. Never mark a `NEXT_PUBLIC_*` variable
   Sensitive, and give `FRONTEND_URL` a scheme — a bad value there produces
   `FUNCTION_INVOCATION_FAILED` on every route.
4. **Schema + data** — from a machine that has the private data files:

   ```bash
   cd backend
   npx prisma migrate deploy    # apply migrations to the production DB
   npm run db:seed-master       # seed the catalog from master.json
   ```

5. **Verify**
   - `GET /health` → `{ ok: true, db: "up" }`
   - Sign in both ways (Google, and email + password), roll, save a film
   - `POST /api/backend/natural-roll` returns films whose interpreted filters
     match the prompt — the local fallback answers even without a working
     `GEMINI_API_KEY`, so a returned result alone does not prove the key landed
   - `GET /api/metrics/rolls` with the metrics token
   - A deliberate 500 reaches Sentry (`SENTRY_DEBUG=true` → `/debug-sentry`, then
     unset)

### After deploy

- Re-run the load check co-located:
  `npm run load-check -- --base=<production-url>`.
- Point an uptime monitor at `/health`.

### Reseeding data

Reseeding is an owner-run pipeline step, not part of CI: run
`npm run db:seed-master` against the production `DATABASE_URL`. Film detail pages
are ISR-cached for one hour, so new data appears gradually without a redeploy.

---

## Security

| Area | How it is handled |
|---|---|
| **Passwords** | bcrypt hashes in `User.passwordHash`; never returned by any endpoint. Google accounts have no hash, and the credential path rejects them without leaking that fact. |
| **Sessions** | JWT (Auth.js), signed with `NEXTAUTH_SECRET`. The browser never holds the backend token — the BFF attaches it server-side. |
| **Authorization** | Every `/user/*` query is scoped by `req.userId` from the verified JWT, never by a client-supplied id. |
| **Password reset** | One-time mailed token (`PasswordResetToken`), single use, expiring. |
| **Input validation** | Zod at every boundary: query params, bodies, and the environment at boot. |
| **SQL injection** | Prisma parameterizes everything; the few raw queries use tagged templates. |
| **HTTP headers** | `helmet` on the backend; CORS is restricted to `FRONTEND_URL` with credentials. |
| **Rate limiting** | Global per-IP and per-user fixed windows, plus stricter limits on natural roll (LLM spend), data export and feedback. |
| **Transport / DB** | Remote databases must use `sslmode=verify-full`; `verifiedDbSsl.ts` refuses to boot otherwise. |
| **Secrets** | Only in `.env` files and the Vercel project; `.env.example` files carry names, never values. Nothing secret is ever logged. |
| **Metrics** | `/api/metrics/*` requires `METRICS_TOKEN`; 503 when no token is configured, so the endpoints are closed by default. |
| **Analytics consent** | `consent: "denied"` on an event drops the identifying fields before the row is written. |
| **Dependencies** | Kept current; `npm audit` before a release. |

Do not add an endpoint that trusts a `userId` from the request body, do not log
tokens or emails, and do not move a secret into a `NEXT_PUBLIC_*` variable — that
ships it to the browser.

---

## Error Handling and Logging

- **One error shape.** `errorHandler` (last in the middleware chain) maps
  `ZodError → 400 VALIDATION_ERROR`, typed `HttpError → status + code`, and
  anything else → `500 INTERNAL_ERROR`. Clients only ever parse
  `{ error, code }`.
- **Users see the message, not the stack.** Unexpected errors surface as a generic
  message; the detail goes to the log and to Sentry.
- **Sentry** is wired on both sides (`@sentry/node`, `@sentry/nextjs`) and gated on
  a DSN — unset means disabled, which is the local default.
- **Request logging** — `morgan` for access logs, plus `slowRequestLogger` and slow
  query logging with thresholds from `SLOW_REQUEST_THRESHOLD_MS` /
  `SLOW_QUERY_THRESHOLD_MS` (200 / 100 ms). Slow paths announce themselves instead
  of hiding in an average.
- **Health** — `GET /health` runs `SELECT 1` and returns 503 when the database is
  unreachable, so an unreachable DB fails the probe instead of reporting a false
  healthy 200. Gemini is not probed — Ask AI degrades to its local path rather
  than failing, so there is nothing for a readiness check to report.
- **Product metrics** — `/api/metrics/recommendations` and `/api/metrics/rolls`
  compute recommendation CTR and personalized-vs-random roll engagement from the
  `Event` table, split by A/B arm.

---

## Troubleshooting

**The backend will not start and names an environment variable.**
`config.ts` validates the environment at boot with Zod. Read the variable name in
the error and fix that value in `backend/.env`.

**The backend will not start, complaining about SSL.**
A remote `DATABASE_URL` must end in `?sslmode=verify-full`. `require`, `prefer`
and `verify-ca` are rejected. A `localhost` database is exempt.

**`/health` returns 503 `db: "down"`.**
The database is unreachable: wrong `DATABASE_URL`, the Neon branch is suspended, or
Postgres is not running locally.

**Everything looks healthy but every signed-in request returns 500
`MISSING_SECRET`.**
`NEXTAUTH_SECRET` is missing on the backend, or differs from the frontend's. It is
read straight from `process.env`, not through the Zod schema, so it does not fail
at boot. Verify by signing in, not by `/health`.

**Sign-in works but user data never loads.**
Check `NEXT_PUBLIC_API_URL` and that the BFF route is forwarding — the browser
should be calling `/api/...` on the frontend origin, never the backend directly.

**Ask AI answers, but the results ignore half the prompt.**
`GEMINI_API_KEY` is probably unset or invalid. The route does not fail — Stage 1
falls back to the regex extractor and Stage 2 to the local reranker — so the only
symptom is worse interpretation. Check the backend log for
`Gemini structural extraction failed`.

**The catalog is empty.**
A fresh clone has no `backend/data/master.json` — the raw data files are private.
Seed with `npm run db:seed-master` once the owner provides it.

**Search returns nothing, or a migration fails on an index.**
The `pg_trgm` extension is not enabled on that database:
`CREATE EXTENSION IF NOT EXISTS pg_trgm;`

**Integration tests fail immediately.**
They need a local `cineroll_test` database with `pg_trgm` and a working local
Postgres user.

**Port 3000 or 4000 is already in use.**
Kill the process (`lsof -ti:4000 | xargs kill`) or set `PORT` in `backend/.env`.

**`Cannot find module 'jose'` on a deployed backend route.**
The root-level `jose` pin was removed or shadowed. See the note in [Technology
Stack](#technology-stack) and run `node scripts/check-build-inputs.mjs`.

**Every deployed backend route 500s right after a rename.**
A file in `backend/src` was named `app.ts`, `index.ts` or `server.ts`. Vercel
packaged it as a second entrypoint. Rename it.

**A commit is rejected.**
Either commitlint (use a conventional prefix: `feat:`, `fix:`, `docs:`, …) or
`check-build-inputs` (a build input is gitignored — un-ignore it).

---

## Known Limitations

- **`watchProviders` is dead data.** TMDB streaming availability is fetched and
  stored on every film but never surfaced in the product.
- **`moodTags` and `keywords` are in-process only.** Neither is indexed, so neither
  can be SQL-filtered; only the Ask AI reranker reads them. See
  [Future Work](#future-work).
- **Rate limits and the cache are per instance.** Both live in process memory, so
  on serverless each instance keeps its own counters and the effective budget is N×
  the configured one. Accepted at current scale — a shared store adds a round-trip
  to every request to tighten budgets that exist as defence in depth, and the one
  limiter guarding spend (natural roll → Gemini) guards very little of it. The
  counter is one class with one method, so swapping in Redis stays a single change.
- **The A/B experiment has no result.** Experiment 1 matched 0 eligible users — no
  account has ≥5 rated likes yet. Blocked on signal data, not on code.
- **Ask AI always returns exactly N picks.** It has no equivalent of the
  recommender's `NOT_ENOUGH_DATA`, so a prompt it cannot answer still gets four
  confident-looking films. See [Future Work](#future-work).
- **No dedicated PR CI pipeline.** There is no GitHub Actions workflow enforcing
  tests on pull requests; validation relies on the local git hooks and the Vercel
  build.
- **No uptime monitoring yet.** Planned pre-launch; `/health` is ready for it.
- **The raw award data is private**, so a fresh clone cannot reproduce the catalog
  without the owner's `master.json`.
- **Series award bleed.** Same-titled series from different eras have historically
  merged award histories. `SERIES_ERA_TOL` guards the merge and `fix-series-era.ts`
  / `dedupe-award-rows.ts` repair it, but a couple of cases remain open.

