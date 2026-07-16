# Case Study — CineRoll

A film‑discovery app for award‑winning cinema: browse and filter by every dimension the award data provides, "roll" a random film from any filtered set, and get personalized recommendations learned from your taste. This writeup leads with the hardest engineering — resolving the same film across five award bodies and a century of ceremonies into one canonical record — then covers the recommendation system and the rest.

> **TL;DR for reviewers.** The genuinely hard part isn't the UI or CRUD — it's the **entity resolution** that turns thousands of messy, differently‑titled award‑nomination rows into one clean catalog of ~8,600 films, and the **content‑based recommendation system** built on the signals collected on top of it. Architecture details: [`ARCHITECTURE.md`](./ARCHITECTURE.md).

---

## The headline problem — one film, five award bodies, a hundred years

Award data is deceptively messy. The source is Excel assembled by Python scripts — **one row per nomination** — across the Oscars, Golden Globes, Cannes, the Berlinale, and the IMDB Top 250. A single film shows up many times:

- under **different titles** across bodies and languages (`The Lives of Others` / *Das Leben der Anderen*; "and" vs "&"; articles moved to the end),
- across **different ceremony years** (a 1972 film nominated at the 1973 Oscars and the 1973 Golden Globes),
- with **different category vocabularies** per body,
- spread over **~100 years** of inconsistent formatting.

Store these naively and you get a catalog where *The Godfather* appears three times with partial award data on each row — useless for filtering ("show me films that won at both Cannes and the Oscars") and poisonous for a recommender.

**The requirement:** collapse every appearance of a film into **one canonical row** carrying its complete award history across all bodies — without dropping films, double‑counting wins, or creating duplicates.

### The solution — TMDB ID as the resolution pivot

The insight is to resolve identity against an **external authority** rather than fuzzy‑matching titles against each other. The pipeline (`backend/data/scripts/build-master.ts`):

1. Groups raw award rows by `(title, release year)` into candidate films.
2. Searches **TMDB** for each candidate and adopts the **TMDB ID as the match key**. Two differently‑titled rows that resolve to the same TMDB ID are the same film, full stop.
3. **Merges** award fields onto the existing record (per‑body nomination/win counts summed, category arrays concatenated) and overlays OMDB ratings + IMDB Top 250 data.
4. Routes anything with **no confident TMDB match** to a `needs-recall.xlsx` queue for manual resolution — never silently dropped, never written half‑broken.

Three invariants make it trustworthy:

- **Idempotent.** Re‑running a batch already in `master.json` merges award data only and makes **zero** API calls — so the build is resumable across days (the OMDB free tier is 1,000 calls/day) and can't double‑count.
- **No silent loss.** Unmatched films surface in a recall queue; a human resolves them. Failures are visible, not invisible.
- **Auditable.** A suite of companion scripts (`check-matches`, `check-merge`, `merge-awards`, `dedup-master`, `oscar-cross-check`, `move-to-recall`) verify and correct the resolution before it ever reaches the database.

The output is `master.json` — one row per film, all award bodies merged — seeded into Postgres. **That clean catalog is the foundation everything else stands on.**

---

## The second hard problem — a real recommendation system

With clean signals possible, the app earns the "algorithm‑driven" label with a content‑based recommender — not "match a few fields and sort," but a proper pipeline. Full detail in [`RECOMMENDATIONS.md`](./RECOMMENDATIONS.md); the shape:

**Taste modelling** (`lib/tasteProfile.ts`) — every user signal (watched, 👍/👎 sentiment, numeric rating, watchlist add, "not interested") becomes a weighted contribution to preference **vectors** across genre, director, decade, runtime band, award affinity, and rating tier. Two design choices matter:

- **Recency decay** (90‑day half‑life) so current taste outweighs old signals.
- **Max‑abs normalization** so a user with 5 signals and one with 500 are directly comparable.

Cold‑start seeds the genre vector from onboarding taste cards, and recompute is **lazy + debounced** — mutations only flag the profile stale; the rebuild coalesces on the next read.

**Ranking** (`lib/recommender.ts`) — candidate generation (exclude watched/saved/hidden, pre‑filter to top taste genres for efficiency) → scoring (taste similarity + quality prior + recency) → **MMR diversity re‑rank** so the top six aren't all one director → **explainable reasons** ("Because you liked *Whiplash* and watch a lot of Drama"). Cold‑start is honest: too few signals returns `NOT_ENOUGH_DATA` rather than fabricating picks, and collaborative filtering is documented as a future upgrade, not faked.

**The roll** (`routes/randomRoute/`) — the product's identity stays pure random by default. The opt‑in "Roll from my taste" samples by **softmax over taste score with ε‑greedy exploration**, biasing toward your taste while guaranteeing every film keeps non‑zero probability — an explicit exploration/exploitation tradeoff, not a `WHERE` clause in disguise. The roll's Safe/Gem/Wild lane mix is a small **Thompson‑sampling bandit** that learns from what the user actually engages with.

**Proof, not vibes** — the pure scoring cores are extracted so an **offline eval harness** measures the exact live ranking (recall@k / precision@k / MRR per model version), and an **A/B framework** buckets users deterministically and tags every event with its variant so parameter changes can be compared.

---

## Other engineering challenges

- **Grounding an LLM feature.** "Describe It" (`routes/naturalRollRoute/`) maps free text → filters via Gemini, but the model only *interprets* — the **database decides** which films exist. Model output is validated against DB‑derived allowed values, near‑misses are remapped ("Sci‑Fi" → "Science Fiction"), invalid values dropped, with a relax‑fallback when nothing matches. The LLM never invents a film.
- **Auth across two runtimes.** Next.js owns sign‑in (Auth.js v5: email OTP + Google) and writes sessions to the shared Neon DB via the Prisma adapter; it issues a JWT that the Next BFF layer forwards to Express, which verifies it statelessly (`jose` + a shared secret). One identity, two consumers, no duplicated user model. ([`ARCHITECTURE.md` §5](./ARCHITECTURE.md))
- **Typo‑tolerant search at small scale.** Postgres `pg_trgm` GIN indexes on title/director/person give fuzzy search without standing up Algolia/Elasticsearch — the right tool for a ~few‑thousand‑film catalog. Index choices + `EXPLAIN ANALYZE` findings are in [`DECISIONS.md`](./DECISIONS.md).
- **Clean separation without over‑abstraction.** Frontend = presentation + BFF proxy + auth session store (never touches the catalog DB); Express = business logic + algorithms; routes stay thin and delegate to `lib/`. No microservices, no premature Redis (in‑memory LRU with a Redis‑ready interface), no faked ML — deliberate restraint.

---

## Results

- **One canonical catalog** of award‑winning films with complete cross‑body award history, built by an idempotent, resumable, auditable pipeline.
- **A working recommendation system** with taste modelling, diversity, explainability, and an honest cold‑start — measurable via an offline eval harness and an A/B framework.
- **A clean full‑stack architecture** with correct auth bridging, consistent error/validation contracts, deliberate indexing, and caching/rate‑limiting as engineering rather than afterthoughts.

---

## What I learned

- **Resolve identity against an external authority.** Fuzzy‑matching titles against each other is a tar pit; pivoting every record through a stable external ID (TMDB) turned an open‑ended matching problem into a tractable one.
- **Make data failures loud.** A recall queue for unmatched films beats clever silent heuristics — visible failures get fixed; invisible ones become wrong data nobody notices.
- **Idempotency makes long jobs survivable.** Designing the merge so re‑runs cost zero API calls is what made a multi‑day, rate‑limited build practical and safe to repeat.
- **Extract the pure core to prove the algorithm.** Pulling the scoring math out of the request path made it both unit‑testable and reusable by the eval harness — the difference between "the recommender feels good" and "the recommender's recall@6 is X."
- **Restraint is part of engineering.** Choosing `pg_trgm` over a search service, in‑memory LRU over Redis, and content‑based over faked collaborative filtering kept the system honest and maintainable for its actual scale.

---

*See also: [`ARCHITECTURE.md`](./ARCHITECTURE.md) · [`RECOMMENDATIONS.md`](./RECOMMENDATIONS.md) · [`DECISIONS.md`](./DECISIONS.md)*
