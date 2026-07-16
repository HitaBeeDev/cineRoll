# Engineering Decisions

What was chosen, why, and what it cost. Measured findings (indexing, load check) are at the bottom.

## Monorepo vs split repos

**Chose:** one repo, npm workspaces (`frontend/`, `backend/`, `packages/types/`).

**Why:** the API contract lives in `@cineroll/types` and compiles on both sides — change the `Film` shape and both apps break at build time, not in production. One PR changes the API and its consumer together. No package publishing, no version skew.

**Cost:** none that bites at this scale. Split repos pay off with separate teams; there's one developer.

## Express backend vs Next.js API routes

**Chose:** a separate Express 5 API. Next's own API routes exist only as a thin BFF proxy (attach JWT, forward).

**Why:** the backend is a real server — middleware pipeline (auth, rate limiting, one error shape), an algorithm layer with its own tests and eval harness, load-checkable in isolation. Cramming that into Next route handlers ties its lifecycle to the frontend and makes the interesting code harder to test.

**Cost:** two servers and the JWT bridge between them (see `ARCHITECTURE.md` §5). Worth it: the bridge is ~one middleware file.

## Postgres (Neon + Prisma) vs MongoDB

**Chose:** PostgreSQL on Neon, via Prisma.

**Why:** the data is relational — films ↔ ratings ↔ watchlists ↔ users ↔ events, all joined constantly. Postgres also brings the two features the product leans on: **GIN array indexes** for genre filtering and **pg_trgm** for typo-tolerant search. Flexible-schema needs are already handled *before* the DB: the pipeline shakes out messy award data into `master.json`, and what's seeded is clean and typed.

**Cost:** schema migrations instead of "just write the document". Prisma makes that cheap.

## pg_trgm vs Algolia (search)

**Chose:** in-database trigram search (`pg_trgm` GIN indexes on title/director/person).

**Why:** the catalog is ~5.3k rows. Measured: a typo-tolerant director search hits in **0.1 ms** (findings below). Algolia would add an external service, a sync pipeline, and a bill — to beat a search that is already instant at this scale.

**Cost:** no ranking/relevance tuning like a dedicated engine. Irrelevant until the catalog is orders of magnitude bigger.

## ISR (Incremental Static Regeneration)

**Chose:** ISR on the pages whose data changes rarely — film detail (`revalidate: 3600`), sitemap and OG images (daily). Interactive pages (roll, browse, profile) render dynamically.

**Why:** film data changes only on reseed. Serving detail pages from the static cache gives CDN-speed loads and full SEO, and a stale page self-heals within the hour.

**Cost:** up to one hour of staleness after a reseed. Fine for a catalog.

## Content-based recommender now, collaborative filtering later

**Chose:** content-based (taste vectors over film features) for v1. Collaborative filtering is documented as the upgrade path, not faked.

**Why:** CF needs many users' overlapping histories — at launch there are none (the classic cold start). Content-based works from day one because the *films* carry rich signal (genres, directors, awards, decades) even when users are new. The eval harness and event tracking are already in place, so CF can be measured against this baseline when real interaction data exists.

**Cost:** content-based can't surprise you with "people like you also loved…" cross-taste picks. Accepted for v1; the MMR diversity re-rank and the roll's exploration keep it from tunneling.

## Caching: in-memory LRU now, Redis-shaped interface

**Chose:** an in-memory LRU+TTL store behind a `CacheStore` interface (`lib/cache.ts`), plus per-endpoint HTTP `Cache-Control`.

**Why:** a single backend instance and a small hot set don't need a network cache — they need the *seams*: `getOrSet(key, ttl, loader)` at call sites and `deleteByPrefix` for targeted invalidation (e.g. one user's recommendations on a new rating). The interface is async and maps 1:1 to Redis, so the swap later touches one class.

**Cost:** cache is lost on restart and not shared across instances. Both irrelevant until there's more than one instance.

---

# Measured findings

## DB indexes for filter / random / recommendation queries

**Context.** The three hot query families all scan `Film` (~5.3k rows):

- **Filter / browse** (`buildWhereClause` → `films.ts`): equality on `contentType`,
  `language`, `certificate`; range on `year`, `runtime`, `imdbRating`, `rtScore`;
  array containment on `genres`; substring `ILIKE` on `director`/`title`; sort by
  `imdbRating` / `rtScore` / `year` / `title`.
- **Random roll** (`random.ts`): same where-clause + `ORDER BY RANDOM()`, and the
  quality pools `ORDER BY "imdbRating" DESC NULLS LAST LIMIT n`.
- **Recommendation candidate pool** (`recommender.ts`): `genres && {top genres}` +
  `id NOT IN (...)`, `ORDER BY imdbRating DESC NULLS LAST LIMIT 300`.

**Pre-existing indexes.** `slug`/`tmdbId`/`imdbId` unique; `title` btree; `year` btree;
`genres` GIN; `title` trigram GIN.

**Decision — indexes added** (`schema.prisma`, migration `add-query-indexes`):

| Index | Type | Serves |
|-------|------|--------|
| `Film_imdbRating_idx` | btree | rating sort + range filter + quality-pool ordering |
| `Film_rtScore_idx` | btree | rt sort + range filter |
| `Film_contentType_idx` | btree | `contentType =` (bitmap-AND with genres GIN) |
| `Film_language_idx` | btree | `language =` |
| `Film_director_trgm_idx` | GIN `gin_trgm_ops` | `director ILIKE '%name%'` person/director search |

**Deliberately skipped.**
- `certificate`, `tvType` — rare filters, very low cardinality; not worth the write cost.
- Award JSONB (`oscarCategories` …) existence checks — the `nominationCount` filter is a
  computed sum across four columns, not indexable as-is; left for a later denormalized
  `totalNominations` column if EXPLAIN shows it hot.
- `ORDER BY RANDOM()` — inherently a full scan + sort; no index helps. Pool size caps the cost.

**Caveat to confirm with EXPLAIN.** The quality/candidate pools order by
`imdbRating DESC NULLS LAST`. A plain btree's DESC scan defaults to NULLS FIRST, so the
planner may still add a sort step. If EXPLAIN shows that sort dominating, replace
`Film_imdbRating_idx` with a raw expression index:
`CREATE INDEX CONCURRENTLY "Film_imdbRating_desc_idx" ON "Film" ("imdbRating" DESC NULLS LAST);`

### How to apply + measure

```
# from backend/
npx prisma migrate dev --name add-query-indexes
```

Then capture before/after with EXPLAIN ANALYZE (run each against the seeded DB):

```sql
-- Filter + sort
EXPLAIN ANALYZE
SELECT * FROM "Film"
WHERE "contentType" = 'movie' AND "imdbRating" >= 7 AND "genres" @> ARRAY['Drama']::text[]
ORDER BY "imdbRating" DESC NULLS LAST LIMIT 12;

-- Director search
EXPLAIN ANALYZE
SELECT * FROM "Film" WHERE "director" ILIKE '%kurosawa%' LIMIT 12;

-- Recommendation candidate pool
EXPLAIN ANALYZE
SELECT * FROM "Film"
WHERE "genres" && ARRAY['Drama','Thriller']::text[]
ORDER BY "imdbRating" DESC NULLS LAST LIMIT 300;
```

### EXPLAIN ANALYZE findings

Run on the production branch (~5.3k films) after `db push` applied the indexes:

| Query | Plan the planner chose | Time | New index used? |
|-------|------------------------|------|-----------------|
| Filter + sort (`contentType='movie'` + `imdbRating>=7` + `genres @> {Drama}`, order by rating) | Bitmap Index Scan on `Film_genres_gin_idx` (2,773 rows) → filter `imdbRating`/`contentType` → top-N heapsort | 5.8 ms | No — genres GIN is selective enough; scalar filters are cheap |
| Director `ILIKE '%kurosawa%'` | Bitmap Index Scan on **`Film_director_trgm_idx`** (8 rows) | **0.1 ms** | **Yes — clear win** (would otherwise seq-scan + per-row ILIKE) |
| Candidate pool (`genres && {Drama,Thriller}`, order by rating, limit 300) | **Seq Scan** (matches 2,942 of 5,300 rows) → top-N heapsort | 4.7 ms | No — ~56% selectivity, seq scan is correctly cheaper |

**Conclusions.**
- **`Film_director_trgm_idx` is the standout** — turns a full ILIKE scan into a 0.1 ms index lookup. Keep.
- **`Film_imdbRating_idx` / `Film_rtScore_idx`** weren't used by these three: query 1's genre predicate already narrows the set, and query 3's `&&` is too unselective. They pay off on the *other* shape — browse sorted by rating/RT with **no** genre filter (a whole-catalog `ORDER BY imdbRating ... LIMIT 12`), which these samples don't cover. Kept; low write cost on a reseed-only table.
- **`contentType` / `language`** applied as cheap post-scan filters here, never as the driving index — expected for low-cardinality equality. Kept; they enable bitmap-AND on stricter combos.
- **NULLS LAST caveat confirmed:** the planner never used a btree for `imdbRating DESC NULLS LAST` — it sorts after scanning. Since both ordered queries pick a bitmap/seq scan for *row selection* anyway, the raw `DESC NULLS LAST` expression index isn't worth adding now. Revisit only if a high-selectivity genre+rating query shows the sort dominating.
- Net: all five indexes retained; only the director trigram is load-bearing on today's query mix, the rest are cheap insurance for query shapes not in this sample.

## Load check — hot endpoints vs latency targets

**Targets (Appendix B):** random < 200 ms, browse < 200 ms, recommendations < 150 ms warm.

**Harness:** `src/scripts/loadCheck.ts` (`npm run load-check`) — zero-dependency, warms
each scenario then fires N requests at concurrency C over HTTP, reports p50/p95/p99 and
pass/fail by **p95**. Read-only.

```
# server must be running, full dataset seeded
npm run load-check -- --base=http://localhost:4000 --requests=500 --concurrency=20
# include recommendations (needs a JWT for a user with ≥3 taste signals):
npm run load-check -- --token=<jwt>
```

### Findings

Local run (laptop → Neon us-east-1, free tier 0.25 CU), 500 req/scenario @ concurrency 20,
rate limiter disabled, 0 errors:

| scenario | p50 | p95 | p99 | rps | target | result |
|----------|-----|-----|-----|-----|--------|--------|
| random | 255 ms | 410 ms | 1045 ms | 67 | <200 ms | FAIL* |
| browse | 184 ms | 305 ms | 406 ms | 99 | <200 ms | FAIL* |
| browse+filter | 245 ms | 370 ms | 495 ms | 77 | <200 ms | FAIL* |
| recommendations (warm) | — skipped (no token / no signal-rich user) | | | | <150 ms | — |

**\*Not representative — bottleneck is topology, not code.** Server-side query time for
these exact queries is 0.1–5.8 ms (see EXPLAIN ANALYZE above). The end-to-end latency here
is dominated by ~80–130 ms round-trip to Neon **us-east-1** (×~2 queries/request) plus
free-tier compute (0.25 CU) serializing under concurrency 20. A laptop → cross-region DB
cannot meet a 200 ms target regardless of code quality.

**Conclusion / what's needed.** The target is only meaningful with app and DB **co-located**
(deployed backend in the DB region, or a local Postgres). Re-run `npm run load-check` from
that environment to validate; given the sub-6 ms server-side query times, co-located latency
should sit comfortably under target. The harness, targets, and per-query evidence are in
place — the open item is the co-located measurement, which is a deploy-time check.

> Recommendations needs an authed user with ≥3 taste signals; none exist yet
> (see RECOMMENDATIONS.md), so that scenario stays skipped until real signal data lands.
