import { CandidateFilm } from "./repository";
import { AXIS_LIST, filmToVector, TasteAxis, TasteVector } from "./model";

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

// A pair is only a real choice if it forks clearly on ONE axis…
const MIN_PRIMARY_GAP = 0.7;
// …while staying comparable in acclaim (no "obvious better film")…
const MAX_RATING_DIFF = 1.1;
// …and close enough in time that neither is "the old one" (a genuine dilemma is
// two films you'd actually weigh, not 1950 vs 2023).
const MAX_YEAR_DIFF = 18;

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

/**
 * Rate a candidate same-type pair as a quiz question. A good question forks
 * hard on one axis (the "primary") while staying similar on the others, similar
 * in acclaim, and — off the era axis — similar in era. `coverage` gently steers
 * successive questions toward axes we haven't tested yet.
 */
function evaluatePair(
  x: Scored,
  y: Scored,
  coverage: Record<TasteAxis, number>,
): PairEval | null {
  // Time gap is a hard filter, not a fork axis — every pair stays close in era.
  const yearDiff = Math.abs(x.film.releaseYear - y.film.releaseYear);
  if (yearDiff > MAX_YEAR_DIFF) return null;

  const gaps: Record<TasteAxis, number> = {
    origin: Math.abs(x.vec.origin - y.vec.origin),
    mood: Math.abs(x.vec.mood - y.vec.mood),
    lane: Math.abs(x.vec.lane - y.vec.lane),
  };

  let primary: TasteAxis = "mood";
  for (const axis of AXIS_LIST) if (gaps[axis] > gaps[primary]) primary = axis;
  const primaryGap = gaps[primary];
  if (primaryGap < MIN_PRIMARY_GAP) return null;

  const ratingDiff = Math.abs((x.film.imdbRating ?? 7) - (y.film.imdbRating ?? 7));
  if (ratingDiff > MAX_RATING_DIFF) return null;

  const otherDist = AXIS_LIST.reduce((s, a) => (a === primary ? s : s + gaps[a]), 0);
  // Reward a clean fork; punish muddiness (other axes) and an acclaim gap; nudge
  // toward under-tested axes so all three get sampled.
  const score =
    primaryGap -
    0.5 * otherDist -
    0.4 * ratingDiff -
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
