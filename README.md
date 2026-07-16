# CineRoll

A film-discovery engine for award-winning cinema. It resolves a century of messy award data — Oscars, Golden Globes, Cannes, the Berlinale — into one clean catalog of ~8,600 films, and puts a real algorithmic layer on top: content-based recommendations, taste modelling, and bandit-driven film rolls.

**Live:** [cineroll.de](https://cineroll.de/)

## The problem this project actually solves

The interesting part of CineRoll is not the UI. It is the data.

Award data arrives as Excel workbooks assembled by Python scripts, one row per _nomination_, spread across five award bodies and roughly a hundred years of inconsistent formatting. The same film appears under different titles (_The Lives of Others_ vs _Das Leben der Anderen_), in different ceremony years, with a different category vocabulary per body. Stored naively, _The Godfather_ exists three times, each row carrying a fragment of its award history — useless for a query like "films that won at both Cannes and the Oscars", and poisonous as input to a recommender.

The pipeline solves this with entity resolution against an external authority: candidate films are matched to TMDB, and the TMDB ID becomes the identity key. Rows that resolve to the same ID are the same film, whatever they are titled. Award records merge onto one canonical row; anything without a confident match goes to a manual recall queue rather than being silently dropped or written half-broken. The result is a catalog where every film carries its complete award history — the foundation everything else stands on.

The full writeup is in [`documentation/CASE_STUDY.md`](./documentation/CASE_STUDY.md).

## The algorithm layer

Algorithms appear only where they earn their place — matching, ranking, recommendation, optimization — never as decoration. The shipped core:

| Algorithm                                     | Where it works                                                                                       |
| --------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| TF-IDF + cosine similarity                    | Film similarity and the user's taste centroid, learned from weighted signals with a 90-day half-life |
| Maximal Marginal Relevance (MMR)              | Re-ranks recommendations for diversity, so ten near-identical suggestions never ship together        |
| Thompson sampling (multi-armed bandit)        | Chooses between Safe / Gem / Wild roll lanes per user, learning from accept/reject feedback          |
| Softmax weighting + ε-greedy                  | Personalizes the roll itself: exploitation of known taste with a floor of exploration                |
| Two-stage retrieve-then-rerank                | "Describe It" natural-language search, with query relaxation and an LLM ↔ local fallback             |
| Deterministic weighted scoring, FNV-1a seeded | Pick of the Day — same film for everyone, all day, no state                                          |

Each one is documented — what problem it solves, why that method, where it lives in the code, and honest shipped/designed status — in [`documentation/algorithms.md`](./documentation/algorithms.md). The recommender has its own end-to-end writeup in [`documentation/RECOMMENDATIONS.md`](./documentation/RECOMMENDATIONS.md), including how changes are measured with A/B experiments.

## What it looks like in the product

Browse and filter the catalog by any dimension the award data provides; roll a random film from any filtered set; get recommendations with human-readable reasons; try the Blind Roll, Roll Battle, Snob Test (stratified ballot sampling, IRT-scored), and taste test; ask for a film in plain language ("something slow and melancholic from the 70s"). Every feature sits on the same clean catalog.

## Architecture

```
build time   award .xlsx ──► build-master.ts ──► master.json ──► PostgreSQL (Neon)
             (entity resolution, TMDB + OMDB enrichment, recall queue)

run time     Next.js 16 frontend ──► BFF proxy (attach JWT) ──► Express 5 API ──► Postgres
             React 19, Auth.js        same-origin rewrite        Prisma 7, Zod,     pg_trgm search,
                                                                 algorithm layer    GIN array indexes
```

A few deliberate choices, each recorded with its cost in [`documentation/DECISIONS.md`](./documentation/DECISIONS.md):

- **A real Express backend, not Next API routes.** The algorithm layer has its own middleware pipeline, unit tests, eval harness (`npm run eval:recommender`), and load check — it deserves a lifecycle independent of the frontend.
- **Postgres over a document store.** The data is relational and the product leans on two Postgres features directly: `pg_trgm` for typo-tolerant search and GIN indexes for genre filtering. Schema flexibility is handled _before_ the database, in the pipeline.
- **One shared types package.** The API contract lives in `packages/types` and compiles into both apps; changing the `Film` shape breaks the build, not production.
- **One error shape.** Every backend error is `{ "error": "…", "code": "…" }`. There is exactly one format to handle.

Full detail: [`documentation/ARCHITECTURE.md`](./documentation/ARCHITECTURE.md).

## Repository overview

```
frontend/        Next.js 16 app (React 19, Auth.js, Tailwind)
backend/         Express 5 API — routes, algorithm layer (src/lib), Prisma schema
backend/data/    pipeline scripts + working data (raw award files are private, gitignored)
packages/types/  @cineroll/types — the shared API contract
documentation/   case study, architecture, algorithms, recommender writeup, decisions, setup
```

## Running it locally

Prerequisites: Node 20+, a PostgreSQL database with the `pg_trgm` extension (a free Neon branch works).

```bash
git clone <repo> && cd cineroll
npm install                              # all workspaces + Prisma client
cp backend/.env.example backend/.env     # fill in DATABASE_URL at minimum
cp frontend/.env.example frontend/.env.local
npm run dev                              # backend :4000 + frontend :3000
```

Sanity check: `http://localhost:4000/health` returns `{ ok: true, db: "up" }`. Every environment variable is validated at boot — the server refuses to start on a bad value. The full table is in [`documentation/SETUP.md`](./documentation/SETUP.md).

Note on data: the raw award Excel files are private project assets and are not in the repository. A fresh clone runs against whatever your database is seeded with.

## Testing

```bash
npm run test              --workspace=backend   # unit tests (Vitest)
npm run test:integration  --workspace=backend   # against a real Postgres
npm run eval:recommender  --workspace=backend   # offline eval harness for the recommender
```

The algorithm layer is the most heavily tested part of the codebase, on purpose.

## Documentation

[`documentation/DOCUMENTATION.md`](./documentation/DOCUMENTATION.md) is the map of everything — which document to read first depending on whether you are reviewing the engineering or joining the codebase.

## License

MIT — see [`LICENSE`](./LICENSE). Note that the raw award data files are private assets and are not covered; only the code is licensed.

## Contact

Anahita Amiri — [github.com/HitaBeeDev](https://github.com/HitaBeeDev)
