import { CandidateFilm } from "./repository";
import { filmToVector, TasteAxis, TasteVector } from "./model";

/** A poster the user chooses between — minimal card payload. */
export interface QuestionOption {
  id: string;
  title: string;
  year: number;
  posterUrl: string | null;
  posterColor: string | null;
}

export interface Question {
  id: string;
  a: QuestionOption;
  b: QuestionOption;
}

// Content type per question — mostly films, with animation and series mixed in
// for variety. Every pair is drawn from a single type, so we never ask
// "animation or documentary?"; it's always like-for-like.
const TYPE_PLAN: string[] = [
  "movie", "animation", "movie", "tv-series", "movie",
  "movie", "animation", "movie", "tv-series", "movie",
];

// A good pair is two films from the *same world* — you'd genuinely weigh them
// against each other — so it must be same genre, same era, comparable acclaim.
// The fork is then a subtle one (origin / prestige within that genre), never a
// jarring "war epic vs sitcom".
const MAX_YEAR_DIFF = 10;          // close in time (Oppenheimer ↔ Imitation Game ≈ 9y)
const MAX_RATING_DIFF = 1.0;       // comparable acclaim, no obvious better film
const MIN_GENRE_JACCARD = 0.34;    // real genre overlap, not just a shared "Drama"
const MAX_MOOD_DIFF = 0.5;         // same tonal family (no heavy-vs-light mismatch)

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

/** Genre-set overlap in [0, 1] — how much two films belong to the same world. */
function genreJaccard(a: string[], b: string[]): number {
  if (a.length === 0 || b.length === 0) return 0;
  const setB = new Set(b);
  const shared = a.filter((g) => setB.has(g)).length;
  const union = new Set([...a, ...b]).size;
  return union === 0 ? 0 : shared / union;
}

/**
 * Rate a candidate same-type pair as a quiz question. The two films must be from
 * the same world — real genre overlap, close in time, comparable acclaim, same
 * tonal family — so the choice is a genuine "which of these tonight?". Within
 * that, we prefer pairs that still differ on origin or prestige (lane), because
 * that subtle fork is what the pick actually teaches; but a near-tie between two
 * kindred films is allowed (it just carries little signal). `coverage` steers
 * successive questions toward the axis we've tested least.
 */
function evaluatePair(
  x: Scored,
  y: Scored,
  coverage: Record<TasteAxis, number>,
): PairEval | null {
  // ── Same-world hard filters ──────────────────────────────────────────────
  const yearDiff = Math.abs(x.film.releaseYear - y.film.releaseYear);
  if (yearDiff > MAX_YEAR_DIFF) return null;

  const ratingDiff = Math.abs((x.film.imdbRating ?? 7) - (y.film.imdbRating ?? 7));
  if (ratingDiff > MAX_RATING_DIFF) return null;

  // Never mix an animated film with a live-action one, even inside the same
  // contentType (some animated features are stored as "movie").
  const xAnim = x.film.genres.includes("Animation");
  const yAnim = y.film.genres.includes("Animation");
  if (xAnim !== yAnim) return null;

  const jaccard = genreJaccard(x.film.genres, y.film.genres);
  if (jaccard < MIN_GENRE_JACCARD) return null;

  const moodGap = Math.abs(x.vec.mood - y.vec.mood);
  if (moodGap > MAX_MOOD_DIFF) return null;

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
 * Ten comparable this-or-that questions. Each question draws a same-type pair
 * that forks cleanly on one taste axis while staying close in acclaim and era —
 * a genuine "stop and think" choice, not an obvious winner. Falls back to any
 * type if a planned type runs dry.
 */
export function buildQuestions(pool: CandidateFilm[]): Question[] {
  const byType = new Map<string, Scored[]>();
  for (const film of pool) {
    if (film.imdbRating == null) continue; // acclaim comparison needs a rating
    const scored: Scored = { film, vec: filmToVector(film) };
    const list = byType.get(film.contentType);
    if (list) list.push(scored);
    else byType.set(film.contentType, [scored]);
  }
  // Highest-acclaim first, so shortlists and pairs favour recognizable films.
  for (const list of byType.values()) {
    list.sort((a, b) => (b.film.imdbRating ?? 0) - (a.film.imdbRating ?? 0));
  }

  const used = new Set<string>();
  const coverage: Record<TasteAxis, number> = { origin: 0, mood: 0, lane: 0 };
  const questions: Question[] = [];

  const availableOfType = (type: string) =>
    (byType.get(type) ?? []).filter((s) => !used.has(s.film.id));

  for (const plannedType of TYPE_PLAN) {
    // Prefer the planned type; fall back to whichever type has the deepest bench
    // if it's exhausted, so we still reach ten questions.
    const types = [plannedType, ...[...byType.keys()].filter((t) => t !== plannedType)];
    let picked: { x: Scored; y: Scored; primary: TasteAxis } | null = null;
    for (const type of types) {
      const avail = availableOfType(type);
      if (avail.length < 4) continue;
      picked = bestPair(avail, coverage);
      if (picked) break;
    }
    if (!picked) break;

    used.add(picked.x.film.id);
    used.add(picked.y.film.id);
    coverage[picked.primary] += 1;

    // Randomise which side each film lands on.
    const [a, b] = Math.random() < 0.5 ? [picked.x, picked.y] : [picked.y, picked.x];
    questions.push({
      id: `q${questions.length + 1}`,
      a: toOption(a.film),
      b: toOption(b.film),
    });
  }

  return questions;
}
