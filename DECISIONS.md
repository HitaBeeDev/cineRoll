# Engineering Decisions

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
