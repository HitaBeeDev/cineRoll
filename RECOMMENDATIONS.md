# Recommendations

The content-based recommender, how it's tuned, and how changes are measured.

Pipeline: candidate generation → taste scoring → MMR diversity re-rank → reasons.
Code: `backend/src/lib/recommender.ts`. Tunable knobs live in
`backend/src/lib/experiments.ts` (`recommenderParams`), env-overridable and
switchable per A/B variant.

## How experiments work

- **Bucketing** — `assignVariant(actorId)` hashes `userId`/`anonId` (SHA-256) to a
  stable variant. Same user → same arm, no stored assignment.
- **Per-variant params** — each variant overrides the baseline knobs
  (`qualityWeight`, `recencyWeight`, `mmrLambda`).
- **Online** — every event is tagged with its `variant`; funnel rates per arm at
  `GET /api/metrics/recommendations` and `GET /api/metrics/rolls`.
- **Offline** — `src/scripts/evalRecommender.ts` (leave-most-recent-out:
  recall@k / precision@k / MRR) replays the production ranker, read-only.

## Experiment 1 — MMR diversity strength (`rec_ranker_v1`)

**Hypothesis.** The shipped MMR trade-off `λ = 0.7` leans toward pure relevance.
A larger diversity penalty (`λ = 0.55`) spreads the top-N across more
directors/genres. Question: does more diversity cost held-out accuracy?

- **Metric:** the diversity knob `MMR_LAMBDA` (`λ` in `mmr = λ·relevance − (1−λ)·maxSim`).
- **Control:** `λ = 0.70` (shipped baseline).
- **Treatment:** `λ = 0.55` (`rec_ranker_v1:treatment` in `experiments.ts`).
- **Protocol:** offline leave-most-recent-5-out, cold-start gate 3, k = 5/10/20.

**Run it** (read-only; from `backend/`):

```
npx tsx src/scripts/evalRecommender.ts --mmr-lambda=0.70,0.55
```

**Result.** Ran the sweep on the current DB:

| arm        | λ    | users | MRR    | recall@20 | precision@20 |
|------------|------|-------|--------|-----------|--------------|
| control    | 0.70 | 0     | 0.0000 | 0.0000    | 0.0000       |
| treatment  | 0.55 | 0     | 0.0000 | 0.0000    | 0.0000       |

**0 eligible users** — no accounts yet have ≥5 rated likes (the leave-most-recent-out
protocol needs held-out positives). The result is **blocked on user signal data**,
not a code issue: the harness, bucketing, and per-variant params are wired and the
sweep runs end-to-end. Re-run the command above once real users have generated
likes/watches to capture the comparison.

**Decision.** Deferred until there's data. Then: keep `λ = 0.70` if treatment loses
ranking accuracy with no offsetting online lift; otherwise ramp treatment via the
`weight` fields in `ACTIVE_EXPERIMENT` and confirm with the online funnel
(`GET /api/metrics/recommendations`).
