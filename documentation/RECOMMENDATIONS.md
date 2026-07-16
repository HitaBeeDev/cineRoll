# Recommendations

How CineRoll's content-based recommender works, end to end: what it learns from,
how it scores films, how it stays diverse and explainable, and how changes are
measured.

Pipeline: **signals → taste profile → candidates → scoring → MMR re-rank → reasons**.
Entry point: `backend/src/lib/recommender.ts` (`recommend()`).
Current model: `content-v1`.

## 1. Signals — what we learn from

Every user action maps to a signed weight (`backend/src/lib/tasteWeights.ts`).
Positive pulls taste toward a film's features, negative pushes away.

| Signal | Weight |
|---|---|
| Numeric rating 7–10 | +1.0 → +1.5 (linear) |
| Liked (thumbs up) | +1.0 |
| Rating 4–7 (neutral zone) | −0.25 → +0.25 |
| Watchlist add | +0.4 |
| Watched, no rating | +0.25 |
| "Not interested" | −0.6 |
| Disliked (thumbs down) | −1.0 |
| Numeric rating 1–4 | −1.0 → −1.5 (linear) |

Deliberate ordering: an explicit numeric rating beats a thumb, a thumb beats
merely watching, and saving to the watchlist is intent, not a verdict.

Signals decay with a **90-day half-life** (`recencyDecay`): a like from six
months ago counts ~25% of a like today, so current taste wins.

## 2. Taste profile — one vector set per user

`backend/src/lib/tasteProfile/` folds all signals into six weight vectors:

- **genres**, **directors**, **decades** (`1970s`), **runtime bands**
  (`under_90` … `over_150`), **award affinity** (`oscar_winner`,
  `cannes_nominee`, …), **rating tiers** (`imdb_8`, `rt_90`).

Each signal adds its decayed weight to every feature of that film; each vector
is then L2-normalized. The profile is persisted and rebuilt lazily — any new
signal marks it stale, the next read rebuilds it (also after 7 days regardless).

**Cold start:** with fewer than 3 positive signals, the genres picked at
onboarding are seeded into the genre vector with descending weight, so a brand
new user still gets ranked (not random) picks. No signals *and* no onboarding
genres → the API returns `NOT_ENOUGH_DATA` instead of guessing.

## 3. Candidate generation

`recommender/candidateRepository.ts`. Instead of scoring the whole catalog:

1. Exclude everything the user has watched or watchlisted.
2. Keep films matching any of the user's **top 6 genres**.
3. Take the top **300** by IMDb rating.

Cheap (one indexed query), and the genre filter guarantees every candidate has
at least some taste relevance before scoring starts.

## 4. Scoring

`recommender/scoring.ts`. Each candidate gets:

```
score = tasteScore + 0.8 · qualityPrior + 0.15 · recencyPrior
```

- **tasteScore** — dot product of the film's features against the user's
  vectors, with per-dimension importance: genre 1.0, director 0.8, award 0.6,
  decade 0.4, rating tier 0.4, runtime 0.3.
- **qualityPrior** — 75% normalized IMDb/RT average + 25% award count
  (wins + 0.25·nominations, capped). Keeps low-signal profiles anchored to
  good films.
- **recencyPrior** — release year scaled from 1920 to now. Small on purpose;
  it breaks ties, it doesn't bury classics.

The two prior weights and the MMR λ below are env-overridable
(`REC_QUALITY_WEIGHT`, `REC_RECENCY_WEIGHT`, `REC_MMR_LAMBDA`) and switchable
per A/B variant.

## 5. Diversity — MMR over TF-IDF similarity

Pure score-ordering returns six near-identical films. `recommender/ranking.ts`
re-ranks with **Maximal Marginal Relevance**: greedily pick the film maximizing

```
mmr = λ · relevance − (1 − λ) · maxSimilarityToAlreadyPicked      (λ = 0.70)
```

Similarity is **TF-IDF cosine** (`recommender/tfidf.ts`): each film is a bag of
feature tokens (genres, director, decade, awards) weighted by rarity across the
catalog. Sharing "Film-Noir" or a director means a lot; sharing "Drama" means
almost nothing. The IDF table is built catalog-wide and cached.

## 6. Explainability — reasons

`recommender/reasonBuilder.ts` builds a human reason per card from the same
weights that produced the score — up to two strongest true phrases:
*"Because you liked Chinatown and watch a lot of Crime."*

Cold-start users have no history, so "because you watch a lot of X" would be a
lie. They get honest pedigree hooks instead ("#14 on IMDb's Top 250", "A Cannes
winner in Drama — one of your starting genres"), rotated by card position so the
grid doesn't repeat one string.

## 7. Taste-weighted roll + exploration

The roll (`backend/src/routes/randomRoute/`) reuses the same scorer but samples
instead of ranking:

- **ε-greedy:** 15% of signed-in rolls are a uniform draw from the filtered
  pool (pure exploration, tagged `exploration: true` on the event); the other
  85% are a **softmax-weighted sample** over `scoreFilm` scores (temperature
  0.5) — better-fitting films come up more often, nothing is impossible.
- **Lane bandit:** the roll's Safe/Gem/Wild lane split is a **Thompson-sampling
  bandit** (`bandit.ts`) — Beta posterior per lane over "did this lane's roll
  earn engagement", updated by feedback, with capped evidence so it keeps
  adapting. Replaces the old fixed 70/20/10 split.

## 8. Offline evaluation

`backend/src/scripts/evalRecommender.ts` — read-only, replays the production
ranker. Leave-most-recent-out per user:

1. Order the user's liked films by recency; hold out the most recent 5.
2. Rebuild taste from the rest, using the live builder math.
3. Generate candidates with the held-out films left eligible.
4. Measure **recall@k / precision@k / MRR** (k = 5, 10, 20) over users with
   enough signal (cold-start gate 3).

Results are stored per `modelVersion` so runs are comparable across changes.

## 9. A/B experiments

- **Bucketing** — `assignVariant(actorId)` (`experiments.ts`) hashes the
  userId/anonId with SHA-256 to a stable variant. Same user → same arm, no
  stored assignment, no per-request randomness.
- **Per-variant params** — each variant overrides the baseline knobs
  (`qualityWeight`, `recencyWeight`, `mmrLambda`).
- **Online** — every event is tagged with its variant; funnel per arm at
  `GET /api/metrics/recommendations` (`byVariant`: served → CTR / saveRate /
  watchedRate / dislikeRate) and `GET /api/metrics/rolls`.
- **Offline** — the eval harness above sweeps variants with
  `--mmr-lambda=0.70,0.55`.

## Experiment 1 — MMR diversity strength (`rec_ranker_v1`)

**Hypothesis.** Lowering the MMR trade-off from `λ = 0.70` (control) to `λ = 0.55`
(treatment) widens catalog coverage — the top-N spreads across more distinct
directors/genres — **without a meaningful drop** in held-out ranking accuracy
(recall@6 / precision@6 within noise of control). Falsified if treatment loses
accuracy with no offsetting gain in diversity/coverage.

- **Metric:** the diversity knob `MMR_LAMBDA` (`λ` in `mmr = λ·relevance − (1−λ)·maxSim`).
- **Control:** `λ = 0.70` (shipped baseline).
- **Treatment:** `λ = 0.55` (`rec_ranker_v1:treatment` in `experiments.ts`).
- **Protocol:** offline leave-most-recent-5-out, cold-start gate 3, k = 5/10/20.
- **Online cross-check:** `GET /api/metrics/recommendations` → `byVariant` gives
  each arm's real CTR / saveRate / watchedRate from `Event` data — a behavioural
  sanity check on the offline ranking metrics once traffic exists.

**Run it** (read-only; from `backend/`):

```
npx tsx src/scripts/evalRecommender.ts --mmr-lambda=0.70,0.55
```

**Result.** Ran the sweep on the current DB (primary k = 20, the harness default;
the served list is 6, so read recall@6 once the table is non-zero):

| arm        | λ    | users | MRR    | recall@20 | precision@20 |
|------------|------|-------|--------|-----------|--------------|
| control    | 0.70 | 0     | 0.0000 | 0.0000    | 0.0000       |
| treatment  | 0.55 | 0     | 0.0000 | 0.0000    | 0.0000       |

**0 eligible users** — no accounts yet have ≥5 rated likes (the leave-most-recent-out
protocol needs held-out positives). The result is **blocked on user signal data**,
not a code issue: the harness, bucketing, and per-variant params are wired and the
sweep runs end-to-end. Re-run the command above once real users have generated
likes/watches to capture the comparison.

**Decision.** Deferred until there's data — `MODEL_VERSION` stays `content-v1`.
Then: keep `λ = 0.70` if treatment loses ranking accuracy with no offsetting online
lift; otherwise ramp treatment via the `weight` fields in `ACTIVE_EXPERIMENT`,
confirm with the online funnel (`GET /api/metrics/recommendations` → `byVariant`),
and when the winning `λ` becomes the shipped baseline, **bump `MODEL_VERSION`** (e.g.
`content-v2`) so eval records and served events attribute to the new ranker.
