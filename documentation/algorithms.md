# CineRoll — Algorithms Catalog

> The single reference for every **named, real algorithm** CineRoll uses (or is
> designed to use), why each one is the right fit for its problem, and where it
> lives in the code. Written to double as **portfolio case-study material** — each
> entry is honest about whether it's shipped or designed, and about where a
> hand-tuned heuristic stands in for a textbook method.
>
> Design principle throughout: **use a famous algorithm only where it earns its
> place** through matching, ranking, recommendation, or optimization — never ML
> for the label. The deep-dive for the flagship roll feature is kept in full as
> **Appendix A**.

**Last updated:** 2026-08-16.

---

## 0. Catalog at a glance

| # | Algorithm | Feature | File(s) | Status |
|---|---|---|---|---|
| 1 | Deterministic weighted scoring + **FNV-1a** seed | Pick of the Day | `backend/src/lib/pickOfDay/` | ✅ shipped |
| 2 | **Two-stage retrieve-then-rerank** (+ query relaxation, LLM ↔ local fallback) | Ask AI (natural-language roll) | `backend/src/routes/naturalRollRoute/` | ✅ shipped |
| 3 | **BM25** term-weighted rerank | Ask AI local reranker | `naturalRollRoute/localReranker.ts` | 🔶 proposed upgrade |
| 4 | **TF-IDF + cosine similarity** | Content-based film similarity / taste centroid | `backend/src/lib/recommender/tfidf/` | ✅ shipped |
| 5 | **Maximal Marginal Relevance (MMR)** | Recommender diversity rerank | `backend/src/lib/recommender/ranking.ts` | ✅ shipped |
| 6 | **Thompson sampling** multi-armed bandit | Roll lane selection (Safe/Gem/Wild) | `backend/src/routes/randomRoute/bandit/` | ✅ shipped |
| 7 | **Softmax weighting + ε-greedy** + weighted sampling | Personalized roll + base lane weighting | `randomRoute/personalizedService.ts`, `weightedSample.ts` | ✅ shipped |
| 8 | **Draw chain** (parent-linked roll log) | Measuring whether any of the above works | `randomRoute/eventLogger.ts`, `frontend/src/features/roll/` | ✅ shipped |

Legend: ✅ shipped · 🔶 designed / proposed.

This file is a reference for what the code does *now*. The build history behind it — what shipped when, in what order, and what was deliberately deferred — lives with the roadmap, not here.

---

## 1. Deterministic weighted Pick-of-the-Day (FNV-1a seed)

**Feature:** the "Tonight's Pick" hero on `/picks`.
**Where:** `backend/src/lib/pickOfDay/{service,scorer,repository,seed}.ts`.

**Problem it solves.** One film per calendar day, identical for every user, reproducible, never repeating within a year, favouring prestige but staying fresh — *without* a nightly job or per-user state.

**How it works.**
1. **Eligibility pool** (`repository.ts`): films with a poster that are either award winners/nominees **or** have **both** `imdbRating ≥ 7` and `rtScore ≥ 70` (updated 2026-07-02 — a hard AND gate so non-award picks are unambiguously quality). Excludes anything picked in the last `noRepeatDays = 365`, and keeps the top `poolSize = 800` by prestige — the day's winner is an argmax over those 800, not over the whole catalog.
2. **Prestige score** per film: `oscarWins·4 + cannesWins·3 + berlinWins·3 + ggWins·2 + nominations… + imdbRating + rtScore/10`.
3. **Daily scoring** (`scorer.ts`): min–max normalize prestige **within today's pool** (so the scale adapts as the pool shrinks over the year), then
   `score = quality + 0.45·underExposure + 0.50·dailySeed`, where `underExposure = 1 − rollCount/maxRolls` over a `rollWindowDays = 14` window (a fairness term damping over-shown films) and `dailySeed` is an **FNV-1a hash** of `"YYYY-MM-DD:filmId"` mapped to [0,1).
4. Argmax wins; ties break on smaller `id`. Jitter (0.5) and under-exposure (0.45) can together outvote quality's implicit 1.0, which is the point — the pick rotates through the deserving pool instead of walking it in prestige order. The result is frozen into `PickOfDayHistory` so it never changes retroactively.

**Why these algorithms.** FNV-1a is a real, fast, well-distributed non-cryptographic hash — the right tool for a deterministic per-day pseudo-random seed (reproducible, cacheable, no RNG state). The `underExposure` term is a lightweight **exploration/fairness** heuristic (same intuition as bandit exploration, not the formal formula — stated honestly).

---

## 2. Natural-language roll — two-stage retrieve-then-rerank

**Feature:** "Ask AI" (`/ask-ai`) — free text → four rolled films.
**Where:** `backend/src/routes/naturalRollRoute/`.

**Problem it solves.** Turn an arbitrary sentence ("a dark French thriller from the 80s") into a good, diverse set of real films, in any language, reliably even when an LLM is unavailable.

**Architecture — the canonical modern search/recsys pattern:**

```
prompt → Stage 1: structural extraction → candidate generation (+relaxation) → Stage 2: rerank → 4 films
```

- **Stage 1 — structural extraction / slot-filling** (`structuralExtractor.ts`): sentence → typed filters (language, genre, decade range, award body, winner/nominee, …). **Gemini** path (temp 0.1, cached 24h by **SHA-1** of the normalized prompt) with a **pure regex extractor** fallback (`localStructuralExtractor.ts`) used when there's no API key or Gemini fails.
- **Candidate generation + query relaxation** (`candidateRelaxation.ts`): top-100-by-IMDb matching the filters, then `ORDER BY RANDOM()` sample of 50 (quality-gated, then randomized). If empty, **progressively relax** constraints in a fixed priority order — `genresAll → genres → category → language → awardYear → yearMin → yearMax` — until films are found. `genresAll` relaxing first turns require-*all*-genres into require-*any* before any genre is dropped outright. `contentType` is deliberately **absent from that list**: movie vs series is a hard constraint, and relaxing it would answer a question the user didn't ask. This is the classic IR technique of **query broadening / graceful degradation**, so the user never dead-ends.
- **Stage 2 — rerank** (`reranker.ts`): order candidates by relevance, take top 4. **Gemini rerank** (temp 0.2) with a deterministic **local reranker** fallback (see §3).

The route streams the two phases separately so the UI shows the interpreted chips (`FRENCH · THRILLER · 1980S`) before the picks land.

**Why this architecture.** Retrieve-then-rerank + query relaxation are textbook IR/recsys; the LLM-with-deterministic-fallback design keeps the feature correct and testable offline.

---

## 3. BM25 term-weighted rerank (proposed upgrade)

**Status:** 🔶 proposed. **Where it would live:** `naturalRollRoute/localReranker.ts` (+ a new `bm25.ts`).

**The gap.** The current local reranker scores a candidate by **flat token overlap** — 3 points per matching prompt word regardless of the word — plus an `imdbRating/2` quality prior, a synonym-expansion boost, an "underrated" boost and a gore penalty. Flat overlap over-rewards common words, ignores term frequency saturation, and doesn't normalize for plot length.

**The named fix — Okapi BM25** (the ranking function behind Lucene/Elasticsearch):

```
score(doc) = Σ_{q ∈ query}  IDF(q) · [ tf(q,doc)·(k+1) ] / [ tf(q,doc) + k·(1 − b + b·|doc|/avgdl) ]
```

with `k ≈ 1.5`, `b ≈ 0.75`. It adds the three things flat overlap lacks: **IDF term weighting** (rare words like "noir" dominate generic ones like "film"), **TF saturation**, and **length normalization**. IDF is computed over the ~50 candidates already in hand (local corpus — self-contained, no DB, no global state). The existing `imdbRating/2` prior, underrated boost and gore penalty stay; only the flat overlap term is replaced.

**Why not reuse the existing TF-IDF module (§4)?** Different vocabulary and corpus: `recommender/tfidf/` operates on **structured feature tokens** (`genre:Film-Noir`, `director:Kubrick`) for *film-to-film* similarity, whereas the reranker matches **free-text words** against plot/title text. They don't share a vocabulary — forcing the reuse would be a square peg. BM25 over the text corpus is the correct, distinct tool.

---

## 4. TF-IDF + cosine similarity (content-based)

**Feature:** film-to-film similarity for the recommender + a per-user "taste centroid".
**Where:** `backend/src/lib/recommender/tfidf/` (`createFilmTokens`, `buildIdf`, `createTfidfVector`, `calculateCosineSimilarity`, `calculateCentroid`), plus `recommender/idf.ts` (`getCatalogIdf`) and `recommender/similarity.ts` (`tfidfSimilarity`).

**Problem it solves.** Raw genre Jaccard treats a shared "Drama" (on a huge share of the catalog) the same as a shared "Film-Noir" (rare, highly informative). That's wrong.

**How it works.** Each film is a **document**; its feature tokens (`genre:*`, `director:*`, `decade:*`, `award:*`) are **terms**. Binary TF (present/absent — standard for short set-like docs) × **IDF** weights each term by rarity across the whole catalog. IDF is smoothed the scikit-learn way, `ln((1+N)/(1+df)) + 1`, so weights stay strictly positive and there's no division by zero. Similarity between two films is the **cosine** of their sparse vectors. The **centroid** (mean vector) of a user's liked films is a "taste vector"; ranking unseen films by cosine to it is content-based recommendation in one line. Catalog IDF is memoized (1h TTL) so rarity is measured against the full library, not a handful of rows.

**Why this algorithm.** TF-IDF + cosine is the canonical content-based-filtering primitive; IDF is exactly the correction the naive Jaccard baseline needs.

---

## 5. Maximal Marginal Relevance (MMR)

**Feature:** diversity rerank so recommendation lists aren't six near-identical films.
**Where:** `backend/src/lib/recommender/ranking.ts` (`rankCandidates`).

**How it works.** Greedily build the result set: at each step pick the film maximizing

```
MMR = λ · relevance − (1 − λ) · max_similarity_to_already_selected
```

Relevance is the normalized recommender score; similarity is the **TF-IDF cosine** from §4. `λ` (`params.mmrLambda`) trades relevance against diversity.

**Why this algorithm.** MMR is *the* classic relevance-vs-diversity reranker (Carbonell & Goldstein, 1998) — a perfect fit for "great picks, but not all the same thing," and it composes cleanly on top of the TF-IDF primitive already in the codebase.

---

## 6. Thompson sampling multi-armed bandit

**Feature:** learns each user's roll-lane mix (Safe / Hidden Gem / Wild Card) instead of a fixed 70/20/10 split.
**Where:** `backend/src/routes/randomRoute/bandit/` — `pickLaneWithThompsonSampling`, `updateLanePosterior`, `PRIOR_POSTERIORS`, and the Beta/Gamma samplers (+ `banditRepository.ts` for DB persistence).

**How it works.** Each lane is an **arm** with a **Beta(α, β)** posterior over "does a roll from this lane earn engagement?" To choose a lane, draw one sample per arm and take the argmax — **Thompson sampling**, explore/exploit with no ε to tune. Cold-start priors reproduce the old Safe-heavy split; engagement (open/save/watch = reward 1, skip = 0) nudges the posteriors; an arm-strength cap gives a sliding memory so it keeps adapting. Posteriors persist server-side for signed-in users (cross-device) and in localStorage for guests.

**Why this algorithm.** Thompson sampling is the textbook Bayesian bandit — the principled successor to the ε-greedy exploration this replaced, with better regret and no exploration constant to hand-tune.

---

## 7. Softmax weighting, ε-greedy, weighted sampling

**Feature:** the personalized roll and the base-roll lane weighting.
**Where:** `randomRoute/personalizedService.ts`, `randomRoute/weightedSample.ts`, `randomRoute/rollScore.ts`.

**How it works.** The personalized roll scores a top-N-by-rating pool with `recommender.scoreFilm`, converts scores to weights via **softmax** (`exp((score − max)/T)`, `T = SOFTMAX_TEMPERATURE`), then draws with **weighted sampling** — with probability `EXPLORATION_EPSILON` it instead does a uniform **ε-greedy** explore draw. `weightedSample(items, weights)` is a standard cumulative-sum inverse-CDF draw. On the base roll, per-lane affinities are sharpened and multiplied by the session-diversity factor, then sampled the same way. (The lane *choice* itself is now the Thompson bandit of §6; ε-greedy survives on the personalized path.)

**Why these algorithms.** Softmax turns scores into a temperature-controlled probability distribution (better titles win more often without going deterministic); ε-greedy is the baseline explore/exploit strategy; weighted sampling is the standard mechanism for "ranked but not fixed." All three are small, well-understood, and exactly enough — no ML added for the label.

---

## 8. Draw chain — how we tell whether any of this works

**Feature:** every roll is a named decision that points back at the one before it.
**Where:** `backend/src/routes/randomRoute/eventLogger.ts`, `backend/src/lib/filmFilters/queryParams/parentDrawParam.ts`, `frontend/src/features/roll/`.

**How it works.** A roll writes one event and returns its id as a **draw id**. The client keeps that draw on screen as a *pending roll* (session storage, so it outlives the page you rolled on) and marks what the user does with it — opened, saved, marked seen, or pushed away. The next roll grades it: `engaged`, `rejected`, or `passed`, and sends that verdict up with the parent's draw id and the draw's position in the session. One reading of the verdict feeds three things at once — the decaying genre/type penalty (§A.6b), the lane bandit's reward (§6), and the chain link in the log.

**What it buys.** The event log becomes a chain instead of a pile, so these are single queries and were previously unanswerable:

- How many draws before one lands? (accept rate by `drawIndex`)
- Which lane actually earns engagement? (outcome grouped by `lane`)
- Do tighter filters produce longer reroll chains?

That is the evaluation set any future ranking work needs. Without it, tuning the scorer is guesswork.

**Note on caching.** A draw names one user's decision, so a response carrying a draw id is `private, no-store`. The one exception is the seeded daily pick, which is deliberately the same film for everyone, draws no lane, and stays publicly cacheable — it issues no draw id.

---

# Appendix A — Smart Roll Engine (design spec)

> The design spec for CineRoll's flagship feature — rolling **one** award-winning
> title at a time. Kept in full: the problem, the target architecture, the scoring
> pipeline, the build scope and the deferred items. Sections are numbered `A.n` so
> they never collide with the catalog above, which cross-references them.
>
> Sections are the *design*, not a status report. What actually shipped, and in
> what order, is tracked with the roadmap rather than here — the status line
> below is the summary.

**Status:** design agreed; largely implemented. Shipped: the eligibility gate
(A.5), session diversity and reroll learning (A.6), the weighted-scoring pipeline
and lane blend (A.7), pinned-dimension respect (A.8), and the Thompson bandit
that replaced the fixed lane split (A.6b). Open: graceful relaxation in the
scorer (A.10), and the deferred items in A.11.

**Last updated:** 2026-08-16.

---

## A.1 The one-line pitch (case-study language)

> CineRoll uses a **smart roll algorithm** that combines quality filtering,
> user-selected constraints, session-based diversity, reroll feedback, and
> weighted random selection to surface one title at a time. Instead of picking
> purely at random, the system ranks eligible titles and injects *controlled*
> randomness — keeping the experience surprising while avoiding repetitive or
> low-quality results.

Honest framing: this is a **rule-based, weighted selection algorithm with
lightweight adaptive feedback** — an *algorithmic roll engine*, not an AI/ML
recommendation platform. That distinction is deliberate and correct for this
project's stage. Real algorithmic value lives in **filtering → ranking →
diversity control → feedback adaptation → weighted selection**, applied exactly
where it improves the roll and nowhere it doesn't.

---

## A.2 The problem

The marquee interaction ("One spin. One film. Tonight.") is currently a **uniform
random pick** over a filtered pool. That produces two failure modes:

1. **It doesn't *feel* random.** Immediate repeats, three dramas in a row, three
   '90s films in a row. The current base roll doesn't even exclude the film it
   just showed.
2. **It surfaces incomplete or unvalidated titles.** A film with no IMDb *and*
   no Rotten Tomatoes score feels broken when it lands as tonight's pick.

The goal: make the roll feel like it's *thinking* — quality-aware, non-repetitive,
mildly adaptive to what the user just skipped — **without** turning it into a
heavyweight recommender or drowning it in UI.

---

## A.3 Starting point (what we build on, not beside)

The backend as it stood when this spec was written — recorded so the design
extends the existing code rather than duplicating it. Most of it has since been
built on; the roll is no longer uniform. Read this as the baseline, not as
current behaviour.

| Piece | File | What it does today |
|---|---|---|
| Base roll | `backend/src/routes/randomRoute/randomRepository.ts` | Filtered pool → `ORDER BY RANDOM()`. Pure uniform. |
| Exclusions | `.../randomRoute/exclusions.ts` | Excludes `doNotSuggest` films (signed-in) + client `excludeIds`. |
| Personalized roll | `.../randomRoute/personalizedService.ts` | Top-N-by-rating pool → **softmax taste-weighted sampling** with **ε-greedy exploration**. Signed-in only. |
| Weighted sampler | `.../randomRoute/weightedSample.ts` | `weightedSample(items, weights)` + `uniformSample`. Already exists. |
| Taste profile | `backend/src/lib/tasteProfile.ts` | Long-term per-user taste. |
| Recommender scoring | `backend/src/lib/recommender.ts` | `scoreFilm(film, taste, year)`. |
| Tunables | `.../randomRoute/constants.ts` | `PERSONALIZED_POOL_SIZE=300`, `EXPLORATION_EPSILON=0.15`, `SOFTMAX_TEMPERATURE=0.5`. |
| Query contract | `backend/src/lib/filmFilters/randomQuerySchema.ts` | `userId`, `personalized`, `excludeIds`, `seed`, filters. |
| Candidate row | `.../randomRoute/types.ts` (`RandomFilmRow`) | Includes `genres[]`, `year`, `contentType`, `director`, `imdbRating`, `rtScore`, award fields, etc. |
| Event logging | `.../randomRoute/eventLogger.ts` + `routes/events.ts` | Roll events already logged. |

**Two facts that shaped everything:**

- **`excludeIds` was fully wired end-to-end in the backend, but the frontend
  passed `undefined`.** Anti-repeat was *dead-wired* — the cheapest, highest-ROI
  fix, and the first thing built (see the implementation log).
- The **weighted-sampler + ε-greedy pattern already existed** — but only on the
  *personalized* path. The core architectural move was to **promote it to the base roll**.

---

## A.4 The architectural move

**Collapse the fork** between `getRandomFilm` (uniform) and
`getPersonalizedRandomFilm` (weighted) into **one pipeline** with a **composable
penalty/boost stack**. Every rule below becomes one multiplicative (or additive)
factor on a film's weight — not a special case bolted on.

```
pool  →  weight = quality × diversity × taste(=1 if guest) × novelty
      →  ε-greedy explore  OR  weighted sample
      →  one film
```

The anonymous roll is just this pipeline with `taste = 1`. Signed-in "Roll from
my taste" is the same pipeline with the real taste factor switched on. One code
path, one set of tests, trivially extensible (add a factor = add a function).

### Module layout (clean, single-responsibility)

```
RollController          (routes/random.ts — HTTP)
  └─ RollService        orchestrates the pipeline
       ├─ CandidateFilter    hard eligibility rules (removes invalid titles)
       ├─ RollScorer         computes per-title score
       ├─ DiversityEngine    session cooldowns + reroll penalties
       ├─ WeightedRandomPicker  ε-greedy + weighted sample (exists)
       └─ RollHistoryService    records what happened this session
```

Extendable without overengineering: each stage has one job; new rules plug into
`RollScorer`/`DiversityEngine` as pure functions.

---

## A.5 Hard eligibility rules (the "can this even enter the pool?" gate)

Applied **before** scoring, in `CandidateFilter` / the SQL `WHERE`. A title is
eligible only if **all** hold:

1. **Has BOTH external ratings:** `imdbRating IS NOT NULL AND rtScore IS NOT NULL`.
   → A film with only one score (IMDb *or* RT, not both) cannot roll. **Updated
   2026-07-01** from the original "at least one" rule at the product owner's
   explicit direction — a single rating reads as incomplete for "tonight's film."
   Trade-off accepted: this removes old winners, award-nominated shorts, and
   documentaries that lack an RT score, and shrinks the reel pool.
2. **Matches the user's selected filters** (award, status, type, genre, decade…).
3. **Not blocked by strong dislikes** — respects existing `doNotSuggest` /
   watched-rejected exclusions.
4. **Has basic metadata:** title, year, type, genres, poster.

**Decision — "at least one" vs "both" rating:** ⚠️ **Superseded 2026-07-01 — the
gate now requires BOTH** (product owner's explicit call; see §A.5 item 1). The
original reasoning below is kept for context on the trade-off that was accepted.

Requiring
both would gut the pool — per our own data pipeline, **shorts, documentaries, and
older films frequently lack RT (sometimes both)**. A "both" gate would make the
Short/Documentary type-rolls nearly empty.

**Quality floor is a *soft weight*, not a hard cut** (see §A.7). We do **not**
hard-require IMDb ≥ 6.5 / RT ≥ 65 globally, because that collapses the low-data
tail (shorts/docs) and produces "the same 50 famous winners." The only hard rating
rule is "must have at least one score." Everything else is weighting.

---

## A.6 Session diversity model (unifies the genre + reroll ideas)

Ideas "genre cooldown" and "rejected-genre penalty" are the **same mechanism with
opposite signs**: *recent-session memory*. Model them once, not twice.

**Session state** — a short rolling window of recent rolls, held client-side
(localStorage for guests; also works signed-in) and sent to the backend as a
compact signal each roll:

```ts
type RolledEntry = {
  filmId: string;
  genres: string[];
  contentType: string;   // movie / short / animation / documentary / tv
  decade: number;        // e.g. 1990
  director: string | null;
  engaged: boolean;      // did the user open details / save / watch it?
};
type SessionSignal = {
  recent: RolledEntry[];         // last N rolls (N ≈ 8)
  excludeIds: string[];          // shuffle-bag: everything served this session
  rerollPenalty: {               // weak-negative feedback, decaying
    genre: Record<string, number>;
    contentType: Record<string, number>;
  };
};
```

### Cooldowns (decaying soft penalties, never hard bans)

Hard-banning a dimension breaks when the filtered pool is mostly that dimension
(e.g. Genre=Drama, or a small Cannes subset → 404 / infinite loop). So each is a
**decaying multiplier**, self-healing when the pool is thin:

| Dimension | Window | Decay example (most-recent → older) |
|---|---|---|
| Genre | last 3 rolls | ×0.15 → ×0.4 → ×0.7 → ×1.0 |
| Content type | last 2 rolls | ×0.3 → ×0.6 → ×1.0 |
| Decade | last 2 rolls | ×0.4 → ×0.7 → ×1.0 |
| Director | last 5 rolls | mild, ×0.5 → … → ×1.0 |

The user's own idea, refined: "stop showing me Drama again" — but the app
*recovers* gracefully instead of dead-ending.

### Reroll learning (weak negative, not a permanent dislike)

A reroll ≠ dislike. Maybe the user just wasn't in the mood. Treat it as a **weak,
decaying** signal, distinguished from real engagement:

| User action | Signal | Effect |
|---|---|---|
| Accepts / saves / watches title | strong positive | boost similar; never penalize |
| Opens details | small positive | mild boost; don't penalize genre |
| **Rerolls without opening** | **weak negative** | temporary penalty on that genre/type this session |
| Manually rejects / "not tonight" | strong negative | stronger, longer session penalty |

Key capability we must add: the app currently **can't tell "rolled → opened" from
"rolled → immediately re-rolled."** That distinction is what makes the roll feel
like it's *listening*. We infer it from whether an `impression`/detail-open event
followed the roll before the next roll fired.

---

## A.7 Weighted scoring (ranking, then controlled randomness)

After hard filters + cooldowns, each candidate gets a score; we then do a
**weighted random pick** (better titles → higher chance, but not deterministic).

### Score formula (v1 — simple, tunable)

```
score =
    ratingScore    * 0.35   // normalized IMDb/RT, combined
  + tasteScore     * 0.25   // recommender.scoreFilm(); = neutral for guests
  + diversityScore * 0.20   // rewards being different from recent rolls
  + noveltyScore   * 0.10   // rewards less-famous picks (anti "always classics")
  + awardScore     * 0.10   // wins/nominations weight

score -= genreCooldownPenalty
score -= typeCooldownPenalty
score -= decadeCooldownPenalty
score -= rerollPenalty
score -= alreadySeenPenalty      // (shuffle-bag usually hard-excludes instead)
```

Weights start as **hand-set constants** (like the existing
`SOFTMAX_TEMPERATURE`/`EXPLORATION_EPSILON`). Only reach for learned weights if
the event logs later justify it — the logging is already in place.

### Anti "too famous every time"

Pure rating weighting keeps surfacing obvious classics. Blend the draw:

```
~70% strong trusted picks
~20% underrated / hidden gems   (good rating, lower popularity)
~10% risky wildcards            (novelty high, taste lower)
```

This is what the existing **ε-greedy exploration** already gives us on the
personalized path — generalize it to the base roll. `noveltyScore` +
`hiddenGemBonus` push against the popularity gravity well.

### Selection

Convert scores → weights (softmax, reusing `SOFTMAX_TEMPERATURE`), then
`weightedSample(pool, weights)`. With probability `EXPLORATION_EPSILON`, do a
uniform `uniformSample` explore draw instead. **Both utilities already exist.**

---

## A.8 Filtered roll vs no-filter roll (critical UX rule)

**User filter > algorithm preference.** The engine behaves differently by intent:

- **No filters →** full intelligence: quality × diversity × taste × novelty.
- **With filters →** respect the user first. If the user selected **Genre =
  Animation**, do **not** apply the animation cooldown — they *asked* for
  animation. Instead diversify *within* the constraint: different decade,
  country, mood, popularity level.

Rule of thumb: cooldowns/penalties only apply to dimensions the user did **not**
pin. A pinned dimension is a promise, not a preference.

---

## A.9 The roll logic (pseudocode)

```
function roll(userId, filters, sessionSignal) {
  const candidates      = getEligibleTitles(filters)          // §A.5 hard gate
  const cleaned         = applyHardRules(candidates, userId)  // dislikes, metadata, excludeIds
  const scored          = cleaned.map(t => ({
                            title: t,
                            score: calculateRollScore(t, userId, sessionSignal, filters)
                          }))
  const balanced        = avoidTooSimilarResults(scored)      // §A.6 cooldowns (respecting §A.8)
  return weightedRandomPick(balanced)                          // §A.7 ε-greedy + weighted
}
```

Order matters: **remove bad candidates → score the rest → choose by score with
controlled randomness.**

---

## A.10 Graceful relaxation (reliability — must-have)

The roll must **never** dead-end on a narrow filter set. When penalties +
exclusions shrink the pool, relax in a **defined order** — soft first, hard never
(unless the user opts into risk):

```
if candidates.length < 20:  reduce cooldown penalties by 50%
if candidates.length < 5:   ignore genre/type/decade cooldowns entirely
last resort:                ignore anti-repeat (shuffle-bag) for this draw
NEVER relaxed automatically: the "has a rating" gate + user's explicit filters
```

Relaxation order (most-expendable → most-protected):
soft penalties → decade spread → type/genre cooldown → anti-repeat →
**[hard floor: rating gate + user filters — never auto-relaxed]**.

---

## A.11 Build scope

### v1 — Smart Roll Engine MVP (build now)

1. Get all titles matching filters.
2. Remove titles with **neither** IMDb nor RT.
3. Remove already-watched / rejected / **already-served-this-session** (shuffle-bag).
4. Penalize genres from last 3 rolls (decaying).
5. Penalize content type from last 2 rolls (decaying).
6. Penalize decade from last 2 rolls (decaying).
7. Apply weak-negative reroll penalties (decaying).
8. Boost strong ratings (soft quality weight).
9. Boost award winners / nominees.
10. Add controlled randomness → **weighted random pick** (ε-greedy).
11. **Graceful relaxation** so it never returns "nothing found."
12. Respect **filter > algorithm** (no cooldown on pinned dimensions).

Plus the two foundation fixes: **wire `excludeIds`** and add the **shuffle-bag**
session window (client localStorage + compact backend signal).

### Later (after users interact — do NOT build now)

Explicitly deferred to avoid overengineering / premature scope. Several of these
are *new features* or *data projects*, not part of "make the roll smart":

- ~~**Mood/tone model**~~ (dark / light / emotional / funny / slow / intense / …).
  Genre is often too broad — a comedy can be dark, a drama comforting — so tone is
  more useful than genre alone. Parked here as its own data project, and since
  **built**: the `tag-enrich` pipeline writes a controlled mood vocabulary to
  `Film.moodTags`, alongside free-vocabulary TMDB `keywords` from `build-master`.
  Both are scored in-process by the Ask AI reranker (§2), never SQL-filtered.
  Still **not** wired into the roll's scoring — that remains open.
- **Roll Modes UI** (Tonight's Best / Hidden Gem / Safe Classic / Risky Pick /
  Short & Easy / Award Mood / Surprise Me). High-value and fun — same engine,
  different weight presets — but it's a **product + UI** effort, not core engine.
- ~~**"Not tonight" / "Already seen" / "Not interested" / "Save for later" buttons.**~~
  **SHIPPED** — see the progress log above. Built on the existing event types /
  backend calls rather than new ones. (Deferred sub-parts: separating
  seen-vs-hidden on revisit, and director/actor/mood penalties on "Not interested".)
- **Per-roll explanation sentence** ("Picked because you haven't had a crime drama
  recently"). Cheap-ish, high perceived intelligence — requires the scorer to
  expose *why*. Strong fast-follow; keep it to **one** sentence.
- **Learned weights / collaborative filtering / full similarity engine.** The
  taste profile already covers personalization; don't duplicate it in the roll.

### Reconciliations (where the brief conflicted with reality)

- **Hard quality floor (IMDb≥6.5 / RT≥65) → rejected** in favor of a **soft
  quality weight** + the single hard "has ≥1 rating" gate. A hard floor guts
  shorts/docs and produces same-classics-every-time. The brief's own item A
  agrees: "use flexible rules… do not hard-code only IMDb."
- **"Later add: taste profile / similarity / collaborative"** — the taste profile,
  `scoreFilm` recommender, softmax and ε-greedy **already exist**. v1 *reuses*
  them, it doesn't build them from scratch.

---

## A.12 Why this is a real algorithm (not "just random")

A naive roll is:

```js
const pick = movies[Math.floor(Math.random() * movies.length)];
```

The Smart Roll instead:

1. Filters out low-quality / incomplete titles (hard gate).
2. Honors user-selected constraints (filter > algorithm).
3. Reads recent session history (diversity memory).
4. Penalizes repeated genres / types / decades (decaying cooldowns).
5. Learns weakly from rerolls (adaptive feedback).
6. Scores each candidate (ranking).
7. Picks one via weighted randomness + ε-greedy exploration.

That is a **rule-based, weighted selection algorithm with lightweight adaptive
feedback** — algorithmic value applied precisely where it improves UX
(filtering, ranking, scoring, diversity control, feedback adaptation, weighted
selection), and **no ML added just to say "AI."** Correct engineering altitude
for this project.

---

## A.13 Open questions / tuning notes

- Session window size `N` (start ≈ 8) and shuffle-bag reset behavior on filter
  change (reset the bag when the filter set changes vs. persist).
- Exact decay curves per dimension — start with the tables in §A.6, tune from logs.
- Should `engaged` inference use the existing `impression` event, or do we need a
  dedicated "roll opened" event? (Prefer reusing existing events first.)
- Where the penalty stack runs: over a top-N candidate pool in-process (mirrors
  `getPersonalizedPool` → `tasteWeightedPick`) vs. pushing weights into SQL.
  Leaning in-process for testability; the pool fetch already exists.
```
