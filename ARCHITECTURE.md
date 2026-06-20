# Architecture

CineRoll is a film-discovery app built around **award data**: browse, filter, search, and "roll" a random award‑winning film, with a personalized recommendation layer learned from your taste. This document explains how the system is put together and why.

It is a **well‑engineered, algorithm‑driven full‑stack application** — a clean frontend/backend/database separation with one genuinely hard problem solved deeply (award‑data entity resolution) and a real algorithmic layer on top (content‑based recommendation, taste modelling, exploration/exploitation roll).

Companion docs: [`DECISIONS.md`](./DECISIONS.md) (indexing + load‑check findings), [`RECOMMENDATIONS.md`](./RECOMMENDATIONS.md) (the taste/recommender writeup + A/B experiments), [`docs/CHECKLIST.md`](./docs/CHECKLIST.md) (build plan + status), [`docs/DATA-WORKFLOW.md`](./docs/DATA-WORKFLOW.md) (the operator runbook for the pipeline).

---

## 1. System at a glance

```
 ┌─────────────────────────────────────────────────────────────────────┐
 │  BUILD TIME — data pipeline (offline, run by the owner)              │
 │                                                                     │
 │  award .xlsx (Oscar · Golden Globe · Cannes · Berlinale)            │
 │  + IMDB Top 250 (.xlsx)                                             │
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

A monorepo (not split repos) keeps the shared `@cineroll/types` contract honest across the wire — the same `Film` / `FilterState` shapes compile on both sides. Rationale and the Express‑vs‑Next‑API‑routes call are in [`DECISIONS.md`](./DECISIONS.md).

---

## 3. Frontend (Next.js 16, App Router)

Three responsibilities, kept distinct:

1. **Presentation** — Server Components render pages (`/`, `/browse`, `/film/[slug]`, `/person/[slug]`, `/picks`, `/describe`, `/snob-test`, `/roll-battle`, `/blind-roll`, `/stats`, `/profile/*`). Styling is Tailwind v4 + Framer Motion + Radix; **no global CSS** beyond variables/resets — every style lives in its component.
2. **BFF proxy** — `frontend/src/app/api/*` routes are thin forwarders. They read the Auth.js session, attach the JWT, and call the Express backend via `apiWithAuth`. They contain no business logic and never touch the catalog database. Example: `POST /api/user/ratings` just forwards to Express `/api/user/ratings`.
3. **Auth session store** — Auth.js (NextAuth v5) owns sign‑in. The **only** place the frontend uses Prisma is `src/auth.ts`, where the Auth.js Prisma adapter persists `User` / `Account` / `Session` to the shared database.

This is a deliberate **Backend‑for‑Frontend** split: the browser never holds the backend JWT or talks to Express directly; the Next server does, over a trusted boundary.

---

## 4. Backend (Express 5)

### Middleware pipeline (order matters)

```
helmet → cors(credentials) → compression → morgan → slowRequestLogger
       → express.json → GET /health
       → /api: optionalAuth → globalRateLimit → router
       → errorHandler (last)
```

- `optionalAuth` identifies the caller best‑effort (sets `req.userId` when a valid token is present) so the limiter can enforce a **per‑user** budget on top of the **per‑IP** one; it never rejects. Protected routes keep their own `requireAuth` guard.
- `globalRateLimit` — fixed‑window per‑IP and per‑user limits (`rateLimit.ts`).
- `errorHandler` — one place maps errors to consistent shapes: `ZodError → 400 VALIDATION_ERROR`, typed `HttpError → status + code`, everything else `→ 500 INTERNAL_ERROR { error, code }`.

### Routes vs. lib

Routes are thin: parse + Zod‑validate, then delegate to `lib/`. The interesting code lives in **`lib/`** (§6). Endpoint groups: catalog (`films`, `autocomplete`, `persons`, `stats`), discovery (`random`, `roll`, `pickOfDay`, `recommendations`, `naturalRoll`), user data (`user`, `feedback`), analytics (`events`, `metrics`), games (`snobTest`, `marathon`).

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

- Sign‑in methods: **email 6‑digit OTP** (via Resend) and **Google OAuth**.
- Auth.js writes session/account rows to the *same* Neon database the API reads — no separate auth store, no duplicated user model.
- Express verifies the JWT itself (`middleware/auth.ts`, `jose`) rather than re‑implementing sessions, so the backend stays stateless and the secret is the only shared dependency.

---

## 6. ★ The algorithmic layer (`backend/src/lib/`)

This is what makes CineRoll algorithm‑driven rather than CRUD. Full writeup in [`RECOMMENDATIONS.md`](./RECOMMENDATIONS.md); the shape:

- **`tasteProfile.ts`** — turns a user's raw signals (watched, 👍/👎 sentiment, numeric ratings, watchlist adds, "not interested") into compact preference **vectors** across genre / director / decade / runtime‑band / award / rating‑tier. Signals are **recency‑decayed** (90‑day half‑life) and **max‑abs normalized** so a 5‑signal and a 500‑signal user are comparable. Cold‑start seeds genre weights from onboarding taste cards. Recompute is **lazy + debounced**: mutations only flag the profile stale; the rebuild happens on next read.
- **`recommender.ts`** — content‑based pipeline: candidate generation (exclude watched/saved/hidden, pre‑filter to top taste genres) → scoring (taste similarity + quality prior + recency) → **MMR diversity re‑rank** (so the top N isn't all one director/genre) → human‑readable **reasons**. Honest cold‑start (`NOT_ENOUGH_DATA`); collaborative filtering is documented as a future upgrade, not faked.
- **`random.ts`** — the roll. Default is pure `ORDER BY RANDOM()`. The opt‑in personalized roll samples by **softmax over taste score with ε‑greedy exploration**, so it leans toward your taste while guaranteeing every film keeps non‑zero probability (no filter bubble).
- **`pickOfDay.ts`** — deterministic daily pick scored by prestige + rating + **under‑exposure**, history‑locked against repeats; same film for everyone that day.
- **`naturalRoll.ts`** — "Describe It" maps free text → filters via Gemini, but the model only *interprets*; the **database decides** which films exist. Model output is validated against DB‑derived allowed values, near‑misses remapped, invalids dropped, with a relax‑fallback when zero match.
- **Testability:** the pure cores (`aggregateTasteVectors`, `scoreFilm`, `rankCandidates`) are extracted so the **offline eval harness** (`scripts/evalRecommender.ts`) measures the exact live ranking, and so unit tests can exercise them with no DB.
- **A/B framework:** `experiments.ts` deterministically buckets users by hash and supplies per‑variant recommender params; every event is tagged with its `variant` (see `RECOMMENDATIONS.md`).

---

## 7. ★ The data pipeline (entity resolution)

The hardest engineering. Source data is hand‑curated Excel — one row per nomination — across Oscar, Golden Globe, Cannes, Berlinale, plus the IMDB Top 250. The same film recurs under different titles, in different languages, across bodies, over ~100 years. The pipeline resolves all of that into **one canonical row per film**.

```
award .xlsx rows ──group by (title, release year)──► unique-film candidates
        │  build-master.ts:
        │    • TMDB search → match key = TMDB ID   ← the resolution pivot
        │    • OMDB → IMDb/RT ratings
        │    • IMDB Top 250 overlay (rank, certificate, runtime)
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
- **OMDB free tier (1,000/day)** shapes the batch workflow; existing films cost 0 calls. Operator runbook: [`docs/DATA-WORKFLOW.md`](./docs/DATA-WORKFLOW.md).

---

## 8. Database (PostgreSQL + Prisma)

~16 models, grouped by purpose:

- **Catalog:** `Film` (one canonical row; award arrays + counts for all four bodies, IMDB Top 250 fields, `posterColor`, `watchProviders`), `Person`.
- **Identity / auth:** `User` (+ `onboardingGenres` for cold‑start), `Account`, `Session`, `VerificationToken`.
- **Raw signals:** `WatchedFilm` (+ `WatchedSentiment` enum), `Watchlist`, `UserRating`, `Event` (+ `EventType` enum — the analytics spine), `RollEvent`.
- **Derived / cached:** `UserTasteProfile` (the materialized taste vectors, with `staleAt`), `PickOfDayHistory` (one row/day, auditable + repeat‑avoiding).
- **UGC:** `FilmComment`, `SiteFeedback`.

Indexing is deliberate, not default: GIN `pg_trgm` indexes for typo‑tolerant title/director/person search, a GIN array index for genre filtering, B‑tree indexes for quality‑range sorts and low‑cardinality equality filters, and composite indexes on the `Event` table for the metrics queries. `EXPLAIN ANALYZE` findings are recorded in [`DECISIONS.md`](./DECISIONS.md).

---

## 9. Performance, caching & observability

- **Caching:** in‑memory LRU (`lib/cache.ts`) with a Redis‑ready interface for hot reads (random pool counts, recommendations with short TTL + explicit invalidation on signal change, pick‑of‑day daily, film detail). HTTP `Cache‑Control` per endpoint.
- **Rate limiting:** global per‑IP + per‑user fixed windows; tunable via env.
- **Pagination:** cursor‑based on watchlist/watched; page‑offset on browse (small catalog).
- **Validation:** Zod at every boundary; env itself is Zod‑validated at boot (`config.ts`).
- **Ops:** slow‑request + slow‑query logging; `/api/metrics/*` for recommendation CTR and personalized‑vs‑random roll engagement, computed from the `Event` table. `/health` exists (a DB‑probe upgrade is tracked in the checklist). Sentry + uptime monitoring are planned pre‑launch.

---

## 10. Configuration & runtime

- **Backend** (`config.ts`, Zod‑validated): `DATABASE_URL`, `PORT` (4000), `FRONTEND_URL`, `NEXTAUTH_SECRET` (JWT verify), pool size, rate‑limit knobs; optional `TMDB_API_KEY`/`OMDB_API_KEY` (enrichment only), `GEMINI_API_KEY` (NL roll → 503 if unset), `METRICS_TOKEN`, `RESEND_API_KEY`/`OWNER_EMAIL` (feedback email).
- **Frontend:** `NEXT_PUBLIC_API_URL`, Auth.js + Google + Resend vars, `NEXTAUTH_SECRET` (must match the backend's).
- **Local dev:** `npm run dev` runs backend (4000) + frontend (3000) concurrently.

Deployment target is Vercel (frontend) + Railway (backend) + Neon (Postgres); it stays parked until the product is finished (see checklist).
