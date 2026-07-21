import { CandidateFilm } from "./repository";
import {
  Archetype,
  distance,
  filmToVector,
  rankArchetypes,
  TasteAxis,
  TasteVector,
} from "./model";

/** A poster the user chooses between — minimal card payload. */
export interface QuestionOption {
  id: string;
  title: string;
  year: number;
  posterUrl: string | null;
  posterColor: string | null;
}

/**
 * A quiz round. The *kind* decides how the client renders it and how many
 * (chosen, rejected) comparisons a single answer yields — but every kind still
 * resolves to plain pairs the model reads, so the taste engine never changes:
 *   - `pair`   two posters, pick one            → 1 comparison
 *   - `grid`   four posters, pick the one       → 3 comparisons (pick vs each)
 *   - `podium` three posters, rank them 1·2·3   → 3 ordered comparisons
 */
export type QuestionKind = "pair" | "grid" | "podium";

export interface Question {
  id: string;
  kind: QuestionKind;
  /** Round headline shown above the posters. */
  prompt: string;
  /** 2 (pair), 4 (grid) or 3 (podium) posters. */
  options: QuestionOption[];
}

// Content plan — a varied run so no two consecutive rounds look the same. Grids
// and the podium are drawn from movies (deepest bench, most recognizable); the
// pair rounds sprinkle in a series and an animation for texture. Every round is
// like-for-like within itself — we never ask "animation or documentary?".
interface Step {
  kind: QuestionKind;
  type: string;
}
const STEP_PLAN: Step[] = [
  { kind: "pair", type: "movie" },
  { kind: "grid", type: "movie" },
  { kind: "pair", type: "tv-series" },
  { kind: "pair", type: "movie" },
  { kind: "podium", type: "movie" },
  { kind: "pair", type: "animation" },
  { kind: "grid", type: "movie" },
  { kind: "pair", type: "movie" },
];

const PROMPT: Record<QuestionKind, string> = {
  pair: "Which one are you tonight?",
  grid: "Pick the one you'd watch tonight",
  podium: "Rank these — favourite first",
};

// A good round is films from the *same world* — you'd genuinely weigh them
// against each other — so it must be same genre, same era, comparable acclaim,
// same tonal family. The fork is then a subtle one (origin / prestige within
// that genre), never a jarring "war epic vs sitcom".
const MAX_YEAR_DIFF = 10;          // close in time (Oppenheimer ↔ Imitation Game ≈ 9y)
const MAX_RATING_DIFF = 1.0;       // comparable acclaim, no obvious better film
const MIN_GENRE_JACCARD = 0.34;    // real genre overlap, not just a shared "Drama"
const MAX_MOOD_DIFF = 0.5;         // same tonal family (no heavy-vs-light mismatch)

// How close the top two archetypes must be (squared taste distance) for the
// finale "tiebreaker" to fire. Generous, so the payoff round appears often.
const TIEBREAK_GAP = 1.5;

interface Scored {
  film: CandidateFilm;
  vec: TasteVector;
}

interface PairEval {
  primary: TasteAxis;
  primaryGap: number;
  score: number;
}

const toOption = (f: CandidateFilm): QuestionOption => ({
  id: f.id,
  title: f.title,
  year: f.year,
  posterUrl: f.posterUrl,
  posterColor: f.posterColor,
});

/** Fisher–Yates shuffle (returns a new array; input untouched). */
function shuffle<T>(items: T[]): T[] {
  const out = [...items];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j]!, out[i]!];
  }
  return out;
}

/** Genre-set overlap in [0, 1] — how much two films belong to the same world. */
function genreJaccard(a: string[], b: string[]): number {
  if (a.length === 0 || b.length === 0) return 0;
  const setB = new Set(b);
  const shared = a.filter((g) => setB.has(g)).length;
  const union = new Set([...a, ...b]).size;
  return union === 0 ? 0 : shared / union;
}

/**
 * Whether two films are from the same world — the hard filters every displayed
 * pair must clear so the choice is a genuine "which of these tonight?", never an
 * obvious winner. Shared by the pair, grid and podium builders so all rounds hold
 * the same comparability bar.
 */
function sameWorld(x: Scored, y: Scored): boolean {
  if (Math.abs(x.film.releaseYear - y.film.releaseYear) > MAX_YEAR_DIFF) return false;
  if (Math.abs((x.film.imdbRating ?? 7) - (y.film.imdbRating ?? 7)) > MAX_RATING_DIFF) return false;
  // Never mix an animated film with a live-action one, even inside the same
  // contentType (some animated features are stored as "movie").
  if (x.film.genres.includes("Animation") !== y.film.genres.includes("Animation")) return false;
  if (genreJaccard(x.film.genres, y.film.genres) < MIN_GENRE_JACCARD) return false;
  if (Math.abs(x.vec.mood - y.vec.mood) > MAX_MOOD_DIFF) return false;
  return true;
}

/** Total taste separation between two films — the signal a comparison carries. */
function axisSpread(a: TasteVector, b: TasteVector): number {
  return Math.abs(a.origin - b.origin) + Math.abs(a.lane - b.lane) + Math.abs(a.mood - b.mood);
}

/**
 * Rate a candidate same-type pair as a quiz question. The two films must be from
 * the same world; within that, we prefer pairs that still differ on origin or
 * prestige (lane), because that subtle fork is what the pick actually teaches.
 * `coverage` steers successive questions toward the axis we've tested least.
 */
function evaluatePair(
  x: Scored,
  y: Scored,
  coverage: Record<TasteAxis, number>,
): PairEval | null {
  if (!sameWorld(x, y)) return null;

  const yearDiff = Math.abs(x.film.releaseYear - y.film.releaseYear);
  const ratingDiff = Math.abs((x.film.imdbRating ?? 7) - (y.film.imdbRating ?? 7));
  const jaccard = genreJaccard(x.film.genres, y.film.genres);

  // ── The fork we read: origin (Hollywood vs world) or prestige (lane) ──────
  const originGap = Math.abs(x.vec.origin - y.vec.origin);
  const laneGap = Math.abs(x.vec.lane - y.vec.lane);
  const primary: TasteAxis = originGap >= laneGap ? "origin" : "lane";
  const primaryGap = Math.max(originGap, laneGap);

  // Reward genre kinship and a readable fork; punish a time or acclaim gap;
  // nudge toward the less-tested axis.
  const score =
    1.4 * jaccard +
    (originGap + laneGap) -
    0.6 * (yearDiff / MAX_YEAR_DIFF) -
    0.5 * ratingDiff -
    0.25 * coverage[primary];

  return { primary, primaryGap, score };
}

/** Best comparable same-type pair from `pool`, or null if none clears the bar. */
function bestPair(
  pool: Scored[],
  coverage: Record<TasteAxis, number>,
): { x: Scored; y: Scored; primary: TasteAxis } | null {
  // Cap the pairwise scan for large types (movies) — a strong shortlist by
  // acclaim is plenty and keeps this well under a millisecond.
  const shortlist = pool.length > 90 ? pool.slice(0, 90) : pool;

  const ranked: { x: Scored; y: Scored; primary: TasteAxis; score: number }[] = [];
  for (let i = 0; i < shortlist.length; i++) {
    const x = shortlist[i];
    if (!x) continue;
    for (let j = i + 1; j < shortlist.length; j++) {
      const y = shortlist[j];
      if (!y) continue;
      const evalResult = evaluatePair(x, y, coverage);
      if (evalResult) {
        ranked.push({ x, y, primary: evalResult.primary, score: evalResult.score });
      }
    }
  }
  if (ranked.length === 0) return null;

  // Pick randomly from the top handful so the quiz varies between sessions while
  // staying high quality.
  ranked.sort((a, b) => b.score - a.score);
  const top = ranked.slice(0, Math.min(6, ranked.length));
  return top[Math.floor(Math.random() * top.length)] ?? null;
}

/**
 * A set of `size` same-world films for a grid or podium round. Seeds on each
 * candidate, then greedily grows the set with the film that adds the most taste
 * separation while staying same-world with *every* film already chosen — so all
 * displayed pairs are comparable and the multi-way choice carries real signal.
 * Ranks the sets by total spread and picks from the top few for session variety.
 */
function bestCluster(pool: Scored[], size: number): Scored[] | null {
  const shortlist = pool.length > 60 ? pool.slice(0, 60) : pool;
  const clusters: { films: Scored[]; score: number }[] = [];

  for (const seed of shortlist) {
    const neighbours = shortlist.filter((f) => f !== seed && sameWorld(seed, f));
    if (neighbours.length < size - 1) continue;

    const chosen: Scored[] = [seed];
    const rest = [...neighbours];
    while (chosen.length < size) {
      const eligible = rest.filter((c) => chosen.every((ch) => sameWorld(ch, c)));
      if (eligible.length === 0) break;
      let best = eligible[0]!;
      let bestSpread = -Infinity;
      for (const c of eligible) {
        const spread = chosen.reduce((s, ch) => s + axisSpread(ch.vec, c.vec), 0);
        if (spread > bestSpread) {
          bestSpread = spread;
          best = c;
        }
      }
      chosen.push(best);
      rest.splice(rest.indexOf(best), 1);
    }
    if (chosen.length < size) continue;

    let spread = 0;
    for (let i = 0; i < chosen.length; i++) {
      for (let j = i + 1; j < chosen.length; j++) {
        spread += axisSpread(chosen[i]!.vec, chosen[j]!.vec);
      }
    }
    clusters.push({ films: chosen, score: spread });
  }

  if (clusters.length === 0) return null;
  clusters.sort((a, b) => b.score - a.score);
  const top = clusters.slice(0, Math.min(6, clusters.length));
  return top[Math.floor(Math.random() * top.length)]!.films;
}

/** Group the rated pool by content type, high-acclaim first. */
function scoredByType(pool: CandidateFilm[]): Map<string, Scored[]> {
  const byType = new Map<string, Scored[]>();
  for (const film of pool) {
    if (film.imdbRating == null) continue; // acclaim comparison needs a rating
    const scored: Scored = { film, vec: filmToVector(film) };
    const list = byType.get(film.contentType);
    if (list) list.push(scored);
    else byType.set(film.contentType, [scored]);
  }
  for (const list of byType.values()) {
    list.sort((a, b) => (b.film.imdbRating ?? 0) - (a.film.imdbRating ?? 0));
  }
  return byType;
}

/** Build one round of the requested kind from a single type's available films. */
function buildStep(
  kind: QuestionKind,
  list: Scored[],
  coverage: Record<TasteAxis, number>,
  seq: number,
): Question | null {
  if (kind === "pair") {
    if (list.length < 4) return null;
    const pair = bestPair(list, coverage);
    if (!pair) return null;
    coverage[pair.primary] += 1;
    const options = shuffle([toOption(pair.x.film), toOption(pair.y.film)]);
    return { id: `q${seq}`, kind, prompt: PROMPT.pair, options };
  }

  const size = kind === "grid" ? 4 : 3;
  if (list.length < size + 2) return null;
  const cluster = bestCluster(list, size);
  if (!cluster) return null;
  return { id: `q${seq}`, kind, prompt: PROMPT[kind], options: shuffle(cluster.map((c) => toOption(c.film))) };
}

/**
 * A varied run of this-or-that rounds. Each round draws same-world films that
 * fork cleanly on taste while staying close in acclaim and era — a genuine "stop
 * and think" choice, not an obvious winner. Rounds alternate format (pair / grid
 * / podium) so no two look alike, and any round that can't be built from its
 * planned type falls back to whichever type has the deepest bench, or is skipped.
 */
export function buildQuestions(pool: CandidateFilm[]): Question[] {
  const byType = scoredByType(pool);
  const used = new Set<string>();
  const coverage: Record<TasteAxis, number> = { origin: 0, mood: 0, lane: 0 };
  const questions: Question[] = [];

  const availableOfType = (type: string) =>
    (byType.get(type) ?? []).filter((s) => !used.has(s.film.id));

  for (const step of STEP_PLAN) {
    // Prefer the planned type; fall back to the other types if it's too thin.
    const types = [step.type, ...[...byType.keys()].filter((t) => t !== step.type)];
    let built: Question | null = null;
    for (const type of types) {
      built = buildStep(step.kind, availableOfType(type), coverage, questions.length + 1);
      if (built) break;
    }
    if (!built) continue;
    for (const option of built.options) used.add(option.id);
    questions.push(built);
  }

  return questions;
}

/**
 * The finale "tiebreaker". When the top two archetypes are close (the profile
 * sits between them), returns one extra pair chosen to separate exactly those two
 * — the round whose answer breaks the tie. Returns null when there's already a
 * clear winner, so the finale only appears when it actually decides something.
 */
export function buildTiebreaker(
  profile: TasteVector,
  pool: CandidateFilm[],
  excludeIds: Set<string>,
): Question | null {
  const [first, second] = rankArchetypes(profile) as [Archetype, Archetype];
  if (distance(profile, second.vector) - distance(profile, first.vector) > TIEBREAK_GAP) {
    return null; // clear winner — no tie to break
  }

  // The direction in taste space that separates the two archetypes. We want a
  // pair whose own difference lines up with it, so choosing one film leans toward
  // `first` and the other toward `second`.
  const dir: TasteVector = {
    origin: first.vector.origin - second.vector.origin,
    mood: first.vector.mood - second.vector.mood,
    lane: first.vector.lane - second.vector.lane,
  };

  // Draw the finale from the movie bench — the deepest, most recognizable pool —
  // so the deciding pair is one people actually know (never two obscure docs).
  // Fall back to whichever type has the most candidates if movies run dry.
  const byType = scoredByType(pool);
  const movies = byType.get("movie") ?? [];
  const list = (movies.length >= 4
    ? movies
    : [...byType.values()].sort((a, b) => b.length - a.length)[0] ?? []
  ).filter((s) => !excludeIds.has(s.film.id));

  const shortlist = list.slice(0, 60);
  let best: { x: Scored; y: Scored; align: number } | null = null;
  for (let i = 0; i < shortlist.length; i++) {
    const x = shortlist[i]!;
    for (let j = i + 1; j < shortlist.length; j++) {
      const y = shortlist[j]!;
      if (!sameWorld(x, y)) continue;
      const align = Math.abs(
        (x.vec.origin - y.vec.origin) * dir.origin +
          (x.vec.mood - y.vec.mood) * dir.mood +
          (x.vec.lane - y.vec.lane) * dir.lane,
      );
      if (!best || align > best.align) best = { x, y, align };
    }
  }
  if (!best || best.align <= 0) return null;

  return {
    id: "tiebreak",
    kind: "pair",
    prompt: "One last call decides it",
    options: shuffle([toOption(best.x.film), toOption(best.y.film)]),
  };
}
