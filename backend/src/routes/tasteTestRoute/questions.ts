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

// Ten questions spread over the four axes (era ×3, mood ×3, origin ×2, lane ×2),
// interleaved so consecutive questions probe different axes and the quiz doesn't
// feel like it's asking the same thing twice in a row.
const AXIS_PLAN: TasteAxis[] = [
  "era", "origin", "mood", "lane",
  "mood", "origin", "era", "lane",
  "mood", "era",
];

// A pair only teaches us something if the two films clearly disagree on the
// target axis; below this gap the choice is noise.
const MIN_AXIS_GAP = 0.6;
// Draw each side from the extreme ends of the axis so the contrast is legible.
const EXTREME_FRACTION = 0.28;

const toOption = (f: CandidateFilm): QuestionOption => ({
  id: f.id,
  title: f.title,
  year: f.year,
  posterUrl: f.posterUrl,
  posterColor: f.posterColor,
});

function pickFrom<T>(list: T[]): T | undefined {
  return list[Math.floor(Math.random() * list.length)];
}

/**
 * Build one question for `axis`: a film high on that axis versus one low on it,
 * both drawn from the extreme ends so the contrast is obvious, neither already
 * used, and with a real gap between them. Returns null if no valid pair remains.
 */
function buildPair(
  scored: { film: CandidateFilm; vec: TasteVector }[],
  axis: TasteAxis,
  used: Set<string>,
): Question | null {
  const avail = scored.filter((s) => !used.has(s.film.id));
  if (avail.length < 4) return null;

  const byAxis = [...avail].sort((x, y) => y.vec[axis] - x.vec[axis]);
  const window = Math.max(1, Math.floor(byAxis.length * EXTREME_FRACTION));
  const highs = byAxis.slice(0, window);
  const lows = byAxis.slice(-window);

  // A few attempts to find a high/low draw that clears the gap and isn't the
  // same film (possible when the window is small).
  for (let attempt = 0; attempt < 8; attempt++) {
    const high = pickFrom(highs);
    const low = pickFrom(lows);
    if (!high || !low || high.film.id === low.film.id) continue;
    if (high.vec[axis] - low.vec[axis] < MIN_AXIS_GAP) continue;

    // Randomise which side each lands on so the "high" answer isn't always left.
    const [a, b] = Math.random() < 0.5 ? [high, low] : [low, high];
    return { id: `q-${axis}-${used.size}`, a: toOption(a.film), b: toOption(b.film) };
  }
  return null;
}

/**
 * Ten this-or-that questions from the candidate pool. Restricts to the most
 * recognizable content types for the quiz (shorts are great recommendations but
 * poor quiz posters); falls back to the whole pool if that subset is thin.
 */
export function buildQuestions(pool: CandidateFilm[]): Question[] {
  const recognizable = pool.filter((f) =>
    ["movie", "tv-series", "animation"].includes(f.contentType),
  );
  const base = recognizable.length >= 40 ? recognizable : pool;
  const scored = base.map((film) => ({ film, vec: filmToVector(film) }));

  const allAxes: TasteAxis[] = ["era", "origin", "mood", "lane"];
  const used = new Set<string>();
  const questions: Question[] = [];

  for (const planned of AXIS_PLAN) {
    // Try the planned axis first; if no clean pair remains for it, fall back to
    // any other axis so we still get a full ten questions.
    const order = [planned, ...allAxes.filter((a) => a !== planned)];
    let q: Question | null = null;
    for (const axis of order) {
      q = buildPair(scored, axis, used);
      if (q) break;
    }
    if (!q) break; // pool genuinely exhausted — stop rather than loop forever.
    used.add(q.a.id);
    used.add(q.b.id);
    questions.push(q);
  }
  return questions;
}
