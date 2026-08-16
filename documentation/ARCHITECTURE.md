# Architecture

CineRoll is a film-discovery app built around **award data**: browse, filter, search, and "roll" a random award‑winning film, with a personalized recommendation layer learned from your taste. This document explains how the system is put together and why.

It is a **well‑engineered, algorithm‑driven full‑stack application** — a clean frontend/backend/database separation with one genuinely hard problem solved deeply (award‑data entity resolution) and a real algorithmic layer on top (content‑based recommendation, taste modelling, exploration/exploitation roll).

Companion doc: [`RECOMMENDATIONS.md`](./RECOMMENDATIONS.md) — the taste/recommender writeup + A/B experiments.

---

## 1. System at a glance

```
 ┌─────────────────────────────────────────────────────────────────────┐
 │  BUILD TIME — data pipeline (offline, run by the owner)              │
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
 │  RUN TIME                       ▼                                     │
 │                                                                      │
 │  Browser ──► Next.js 16 (App Router)                                 │
 │                ├─ Server Components / pages  (UI, SEO, ISR-ready)     │
 │                ├─ BFF proxy routes  /api/*   (inject JWT, forward)    │
 │                └─ Auth.js v5 session store ─┐                         │
 │                         │ Authorization: Bearer <JWT>                │
 │                         ▼                                            │
 │              Express 5 API  ──────────────────────────────────────┐ │
 │                ├─ routes/    (films, random, recommendations, …)   │ │
 │                ├─ lib/       ★ algorithm layer (taste, recommender)│ │
 │                ├─ middleware (auth, rate-limit, errors, validate)  │ │
 │                └─ Prisma ──► PostgreSQL (Neon)  ◄── same DB ───────┘ │
 │                                  ▲                                   │
 │                       Auth.js Prisma adapter writes User/Account/   │
 │                       Session to this same database                 │
 └──────────────────────────────────────────────────────────────────────┘
```

**One‑line data flow:** Excel award files → enrich + entity‑resolve → `master.json` → seed → Postgres → Express API → Next.js (BFF + UI) → browser.

---

## 2. Monorepo layout

npm workspaces, three packages:

```
cineroll/
├── frontend/         Next.js 16 app (App Router, React 19, Tailwind v4)
├── backend/          Express 5 API + Prisma + the data pipeline scripts
│   ├── src/
│   │   ├── routes/     HTTP endpoints (thin — parse, validate, delegate)
│   │   ├── lib/        ★ business logic + algorithms (the real engineering)
│   │   ├── middleware/ auth, rate limiting, error handling, validation
│   │   └── scripts/    eval harness, load check
│   ├── data/scripts/   the Excel → master.json → DB pipeline
│   └── prisma/         schema + migrations
└── packages/types/   shared TypeScript types (Film, FilterState, …)
```

A monorepo (not split repos) keeps the shared `@cineroll/types` contract honest across the wire — the same `Film` / `FilterState` shapes compile on both sides.

---

## 3. Frontend (Next.js 16, App Router)

Three responsibilities, kept distinct:

1. **Presentation** — Server Components render the pages (home, browse, film/person detail, picks, ask‑ai, stats, profile and its sub‑pages — watchlist, lists, history, notifications, settings — plus auth and the legal pages). Styling is Tailwind v4 + Framer Motion + Radix; **no global CSS** beyond variables/resets — every style lives in its component.
2. **BFF proxy** — `frontend/src/app/api/*` routes are thin forwarders. They read the Auth.js session, attach the JWT, and call the Express backend via `apiWithAuth`. They hold no catalog logic and never query the catalog tables. Example: `POST /api/user/watchlist` just forwards to Express `/api/user/watchlist`.
3. **Auth session store** — Auth.js (NextAuth v5) owns sign‑in. `src/auth.ts` wires the Auth.js Prisma adapter, which persists `User` / `Account` / `Session` to the shared database.

**Where the frontend does touch Prisma directly.** Account management is the deliberate exception to (2): credential sign‑up, password change/reset and the avatar picker are *auth* concerns that Auth.js already owns the tables for, so routing them through Express would mean a second writer to the same rows. They talk to the DB from the Next server: `src/auth.ts`, `api/auth/{register,change-password,forgot-password,reset-password}/route.ts`, `api/user/avatar/route.ts`, and `profile/settings/page.tsx`. Everything catalog‑ or signal‑shaped still goes over the wire to Express.

This is a deliberate **Backend‑for‑Frontend** split: the browser never holds the backend JWT or talks to Express directly; the Next server does, over a trusted boundary.

---

## 4. Backend (Express 5)

### Middleware pipeline (order matters)

```
/api/backend prefix rebase (Vercel service rewrite; no-op in local dev)
       → helmet → cors(credentials) → compression → morgan → slowRequestLogger
       → express.json → GET /health (probes the DB: 200 db-up / 503 db-down)
       → /api: optionalAuth → globalRateLimit → router
       → Sentry error handler → errorHandler (last)
```

- `optionalAuth` identifies the caller best‑effort (sets `req.userId` when a valid token is present) so the limiter can enforce a **per‑user** budget on top of the **per‑IP** one; it never rejects. Protected routes keep their own `requireAuth` guard.
- `globalRateLimit` — fixed‑window per‑IP and per‑user limits (`rateLimit.ts`).
- `errorHandler` — one place maps errors to consistent shapes: `ZodError → 400 VALIDATION_ERROR`, typed `HttpError → status + code`, everything else `→ 500 INTERNAL_ERROR { error, code }`.

### Routes vs. lib

Routes are thin: parse + Zod‑validate, then delegate to `lib/`. The interesting code lives in **`lib/`** (§6). Endpoint groups: catalog (`films`, `autocomplete`, `persons`, `stats`), discovery (`random`, `roll`, `pick-of-day`, `recommendations`, `natural-roll`), user data (`user` — watchlist, watched, lists, onboarding, progress, notifications, account — and `feedback`), analytics (`events`, `metrics`), games (`marathon`).

---

## 5. Authentication & the JWT bridge

The tricky part of a Next‑frontend / Express‑backend split is auth. CineRoll uses **one identity, two consumers**:

```
Browser ──sign in──► Auth.js v5 (Next)  ──Prisma adapter──► User/Account/Session (Neon)
                          │ issues JWT (NEXTAUTH_SECRET)
Browser ──action──► Next BFF route ──Bearer <JWT>──► Express
                                          │ auth middleware verifies JWT (jose + NEXTAUTH_SECRET)
                                          ▼ attaches req.userId → requireAuth guards
```

- Sign‑in methods: **email + password** (Auth.js Credentials provider, bcrypt hashes in `User.passwordHash`) and **Google OAuth**. Forgotten passwords are reset over a mailed one‑time link (`PasswordResetToken`, sent via Resend). An account created through Google has no password hash, and the credential path rejects it rather than leaking that distinction.
- Credentials sign‑in forces a **JWT session strategy** — a stateless credential check has no server session for the adapter to persist.
- Auth.js writes user/account rows to the *same* Neon database the API reads — no separate auth store, no duplicated user model.
- Express verifies the JWT itself (`middleware/auth.ts`, `jose`) rather than re‑implementing sessions, so the backend stays stateless and the secret is the only shared dependency.

---

## 6. ★ The algorithmic layer (`backend/src/lib/`)

This is what makes CineRoll algorithm‑driven rather than CRUD. One line each — the math and the reasoning live in [`RECOMMENDATIONS.md`](./RECOMMENDATIONS.md) and [`algorithms.md`](./algorithms.md):

- **Taste profile** (`tasteProfile/`) — everything you watch, rate, or save becomes a weighted vote on genres, directors, decades, and more. Recent votes count more than old ones.
- **Recommender** (`recommender/`) — picks ~300 plausible films, scores them against your taste, then re‑ranks so the six you see aren't all the same director or genre. Each card says *why* it was picked.
- **Personalized roll** (`randomRoute/`) — the roll leans toward your taste but never locks anything out: every film keeps a real chance, and 15% of rolls are pure exploration.
- **Lane bandit** (`randomRoute/bandit/`) — the roll's Safe/Gem/Wild mix learns from what you actually engage with, instead of a fixed split.
- **Pick of the day** (`pickOfDay/`) — one film per day, same for everyone, chosen for prestige + quality + being under‑seen; never repeats.
- **Ask AI** (`routes/naturalRollRoute/`) — free text ("a slow 70s thriller") goes to Gemini, but the model only *translates* it into filters; the database decides which films actually exist. Invalid model output is dropped, never trusted. A local regex extractor and a local reranker stand in whenever Gemini is absent or fails, so the feature degrades instead of breaking.
- **Honesty rules** — no fake picks: too little signal returns `NOT_ENOUGH_DATA`, cold‑start reasons never claim history you don't have.
- **Measurable** — the scoring cores are pure functions, so an offline eval harness replays the exact live ranking, and an A/B framework (`experiments.ts`) buckets users deterministically and tags every event with its variant.

---

## 7. ★ The data pipeline (entity resolution)

The hardest engineering. Source data is Excel assembled by Python scripts — one row per nomination — across Oscar, Golden Globe, Cannes, and the Berlinale. The same film recurs under different titles, in different languages, across bodies, over ~100 years. The pipeline resolves all of that into **one canonical row per film**.

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

Supporting scripts (`check-matches`, `check-merge`, `merge-awards`, `dedup-master`, `oscar-cross-check`, `move-to-recall`, `recall-*`) audit and correct the resolution. Key invariants:

- **Match key is the TMDB ID** — differently‑titled entries across bodies collapse to the same row.
- **Idempotent** — re‑running a batch already in `master.json` merges award data only and makes zero API calls.
- **No silent loss** — unmatched films are routed to a recall queue for manual resolution, not dropped or written broken.
- **API budget aware** — OMDB allows 1,000 calls/day, so work happens in batches and already-known films cost zero calls.

---

## 8. Event flow (analytics spine)

Every meaningful user action becomes one typed `Event` row, and everything downstream reads from it:

```
user action (roll, click, save, watch, rate, search, rec served/clicked, …)
      │  frontend fires → BFF /api/events → Express /api/events
      ▼
Event row  { type: EventType, userId | anonId, sessionId, filmId?,
             context: Json, variant: "rec_ranker_v1:…" }
      │
      ├──► /api/metrics/*  — funnels per A/B arm (served → CTR / save / watch)
      ├──► signal mutations (watch/rate/save) also flag UserTasteProfile stale
      │      → next read rebuilds the taste vectors (§6)
      └──► roll engagement rewards update the Thompson lane bandit (RollLaneBandit)
```

One table, 15 event types, `variant`‑tagged at write time — so A/B analysis, recommender metrics, and taste learning all share the same source of truth instead of three tracking systems.

---

## 9. Database (PostgreSQL + Prisma)

18 models, grouped by purpose:

- **Catalog:** `Film` (one canonical row; award arrays + counts for all four bodies), `Person`.
- **Identity / auth:** `User` (+ `onboardingGenres` for cold‑start, `passwordHash`), `Account`, `Session`, `VerificationToken`, `PasswordResetToken`.
- **Raw signals:** `WatchedFilm` (+ `WatchedSentiment` enum — `like` / `love` / `dislike`), `Watchlist`, `Event` (+ `EventType` enum — the analytics spine, §8), `RollEvent`.
- **Derived / cached:** `UserTasteProfile` (the materialized taste vectors, with `staleAt`), `RollLaneBandit` (per‑user Beta posteriors for the Safe/Gem/Wild lanes), `PickOfDayHistory` (one row/day, auditable + repeat‑avoiding).
- **UGC:** `UserList` / `UserListEntry` (custom lists), `SiteFeedback`.
- **Announcements:** `Notification` — site‑wide, not per‑user: one row per "films added" / "awards updated" / "announcement", surfaced at `/profile/notifications`. It references films by **slug**, not id, because `seed-master` deletes and re‑creates every `Film` row and any stored id would dangle after a reseed.

Beyond title/year/genres, a `Film` row carries the fields the algorithm layer reads: `imdbRating` with `imdbVotes` (a score without its vote count is unfalsifiable — 8.5 from 500,000 votes and 8.5 from 40 are the same number), `rtScore`, `imdbTopMovieRank` / `imdbTopTvRank`, `moodTags` and `keywords` (the semantic layer Ask AI's reranker scores in‑process — never SQL‑filtered, so neither is indexed), `types[]` (browse facets; a 9‑minute war documentary is both `documentary` and `short`, which single‑valued `contentType` cannot express), `originCountries` (where a film is *from* — `countries` lists every co‑financier and filtering on it is what made the country facet wrong), and `posterColor`. `watchProviders` is fetched and stored by the pipeline but **not surfaced in the product yet**.

Indexing is deliberate, not default: GIN `pg_trgm` indexes for typo‑tolerant title/director/person search, a GIN array index for genre filtering, B‑tree indexes for quality‑range sorts and low‑cardinality equality filters, and composite indexes on the `Event` table for the metrics queries.

---

## 10. Performance, caching & observability

- **Caching:** in‑memory LRU (`lib/cache.ts`) with a Redis‑ready interface for hot reads (random pool counts, recommendations with short TTL + explicit invalidation on signal change, pick‑of‑day daily, film detail). HTTP `Cache‑Control` per endpoint.
- **Rate limiting:** global per‑IP + per‑user fixed windows; tunable via env.
- **Pagination:** cursor‑based on watchlist/watched; page‑offset on browse (small catalog).
- **Validation:** Zod at every boundary; env itself is Zod‑validated at boot (`config.ts`).
- **Ops:** slow‑request + slow‑query logging; `/api/metrics/*` for recommendation CTR and personalized‑vs‑random roll engagement, computed from the `Event` table. `/health` probes the DB (200 up / 503 down). Sentry is wired on both sides (gated on `SENTRY_DSN`); uptime monitoring is planned pre‑launch.

---

## 11. Configuration & runtime

- **Backend** (`config.ts`, Zod‑validated at module load): `DATABASE_URL`, `PORT` (4000), `FRONTEND_URL`, pool size, slow‑log thresholds, rate‑limit knobs; optional `TMDB_API_KEY`/`OMDB_API_KEY` (enrichment only), `GEMINI_API_KEY` (Ask AI → 503 if unset), `METRICS_TOKEN`, `RESEND_API_KEY`/`OWNER_EMAIL` (feedback email), `SENTRY_DSN`/`SENTRY_DEBUG`. A bad value throws before Express mounts a single route, naming the offending variable.
- **Read outside `config.ts`:** `NEXTAUTH_SECRET` is read straight from `process.env` by `middleware/auth.ts` — it is **not** in the Zod schema, so a missing secret surfaces as a 500 `MISSING_SECRET` on the first authenticated request rather than at boot. The recommender knobs `REC_QUALITY_WEIGHT` / `REC_RECENCY_WEIGHT` / `REC_MMR_LAMBDA` are likewise read directly, in `lib/experiments.ts`, so the ranker can be retuned without a redeploy.
- **Frontend:** `NEXT_PUBLIC_API_URL`, `DATABASE_URL`, Auth.js + Google + Resend vars, `NEXTAUTH_SECRET` (must match the backend's).
- **Local dev:** `npm run dev` runs backend (4000) + frontend (3000) concurrently.

Deployment target is Vercel for **both** apps — the frontend as the main app, the Express backend as a second service (entrypoint `backend/src/index.mts`) behind the `/api/backend/*` rewrite (`vercel.json`; the prefix rebase in `httpApp.ts` makes routes identical in local dev) — with Neon for Postgres. Launch stays parked until the product is finished.
