/**
 * Taste Test model — the pure, DB-free core of the feature.
 *
 * Every film is projected onto four interpretable taste axes (see `AXES`). A
 * user's picks are averaged into a taste profile, which is matched to the
 * nearest archetype and used to rank recommendations. Keeping this layer pure
 * (no Prisma, no Express) makes the scoring deterministic and unit-testable, and
 * lets the repository/route stay thin.
 *
 * Design note: the axis mappings and archetype anchors are curated (they encode
 * domain judgement about award cinema), but the profiling, matching and ranking
 * on top of them are fully algorithmic. That is the intended split — hand-tuned
 * features, computed decisions — and it avoids training/serving an ML model for
 * a problem that a small, legible vector space solves just as well.
 */

export type TasteAxis = "era" | "origin" | "mood" | "lane";

export type TasteVector = Record<TasteAxis, number>;

/** The minimal film shape the model needs to compute a taste vector. */
export interface FilmFeatures {
  releaseYear: number;
  genres: string[];
  language: string | null;
  imdbRating: number | null;
  imdbTopMovieRank: number | null;
  imdbTopTvRank: number | null;
  oscarWins: number;
  ggWins: number;
  cannesWins: number;
  berlinWins: number;
}

/** Human-facing description of each axis, used for the result-screen trait chips. */
export const AXES: Record<
  TasteAxis,
  { low: string; high: string }
> = {
  era:    { low: "Classic era",     high: "Modern era" },
  origin: { low: "World cinema",    high: "Hollywood" },
  mood:   { low: "Heavy & serious", high: "Light & fun" },
  lane:   { low: "Arthouse",        high: "Crowd-pleaser" },
};

// Genre → mood weight in [-1, 1]: heavy/serious is negative, light/fun positive.
// A film's mood is the mean of its genres' weights (unlisted genres are neutral).
const GENRE_MOOD: Record<string, number> = {
  Comedy: 1, Family: 1, Animation: 0.8, Musical: 0.8, Adventure: 0.7,
  Fantasy: 0.6, Music: 0.6, Romance: 0.5, "Science Fiction": 0.3,
  War: -1, Drama: -0.8, Crime: -0.7, Documentary: -0.7, Thriller: -0.6,
  History: -0.6, Biography: -0.5, Mystery: -0.4, Horror: -0.3, Western: -0.3,
};

const clamp = (n: number, lo = -1, hi = 1) => Math.max(lo, Math.min(hi, n));

/** Project a film onto the four taste axes. All outputs are clamped to [-1, 1]. */
export function filmToVector(film: FilmFeatures): TasteVector {
  // Era: pivots at the mid-90s; ~30 years of spread reaches the extremes.
  const era = clamp((film.releaseYear - 1995) / 30);

  // Origin: English-language reads as Hollywood, anything else as world cinema.
  const origin = film.language && film.language !== "en" ? -1 : 1;

  // Mood: mean of the film's genre weights.
  const moodWeights = film.genres
    .map((g) => GENRE_MOOD[g])
    .filter((w): w is number => typeof w === "number");
  const mood = moodWeights.length
    ? clamp(moodWeights.reduce((a, b) => a + b, 0) / moodWeights.length)
    : 0;

  // Lane: crowd-pleaser signals (mainstream awards + IMDb-canon presence) pull
  // positive; festival signals (Cannes/Berlin, non-English) pull negative.
  const inImdbCanon = film.imdbTopMovieRank != null || film.imdbTopTvRank != null;
  const crowd =
    film.oscarWins * 1 +
    film.ggWins * 0.7 +
    (inImdbCanon ? 1.5 : 0) +
    (film.imdbRating != null && film.imdbRating >= 8 ? 0.5 : 0);
  const festival =
    film.cannesWins * 1.5 +
    film.berlinWins * 1.5 +
    (film.language && film.language !== "en" ? 1.2 : 0);
  const lane = clamp((crowd - festival) / 4);

  return { era, origin, mood, lane };
}

/** Mean of a set of taste vectors — a user's profile is the mean of their picks. */
export function averageVectors(vectors: TasteVector[]): TasteVector {
  if (vectors.length === 0) return { era: 0, origin: 0, mood: 0, lane: 0 };
  const sum = vectors.reduce(
    (acc, v) => ({
      era: acc.era + v.era,
      origin: acc.origin + v.origin,
      mood: acc.mood + v.mood,
      lane: acc.lane + v.lane,
    }),
    { era: 0, origin: 0, mood: 0, lane: 0 },
  );
  const n = vectors.length;
  return { era: sum.era / n, origin: sum.origin / n, mood: sum.mood / n, lane: sum.lane / n };
}

/** Squared Euclidean distance between two taste vectors (equal axis weights). */
export function distance(a: TasteVector, b: TasteVector): number {
  return (
    (a.era - b.era) ** 2 +
    (a.origin - b.origin) ** 2 +
    (a.mood - b.mood) ** 2 +
    (a.lane - b.lane) ** 2
  );
}

export interface Archetype {
  key: string;
  label: string;
  emoji: string;
  blurb: string;
  vector: TasteVector;
}

/**
 * The six archetypes as anchor points in taste space. Chosen to spread across
 * the axes so every plausible profile has a clear, distinct nearest neighbour
 * (no dead zones, no two anchors closer to each other than to the corners).
 */
export const ARCHETYPES: Archetype[] = [
  {
    key: "festival-purist",
    label: "Festival Purist",
    emoji: "🎬",
    blurb: "Slow-burn, subtitled, festival darlings — you like a film that makes you work for it.",
    vector: { era: -0.4, origin: -0.9, mood: -0.6, lane: -0.8 },
  },
  {
    key: "awards-regular",
    label: "Awards Season Regular",
    emoji: "🏆",
    blurb: "Prestige Best-Picture dramas — the ones everyone argues about on the night.",
    vector: { era: 0.6, origin: 0.6, mood: -0.7, lane: 0.5 },
  },
  {
    key: "new-hollywood-romantic",
    label: "New Hollywood Romantic",
    emoji: "🎞️",
    blurb: "Character-driven American classics with heart, grain, and a great third act.",
    vector: { era: -0.6, origin: 0.8, mood: -0.2, lane: 0.2 },
  },
  {
    key: "comfort-classicist",
    label: "Comfort Classicist",
    emoji: "🍿",
    blurb: "Timeless crowd-pleasers you could happily rewatch forever.",
    vector: { era: -0.5, origin: 0.6, mood: 0.7, lane: 0.8 },
  },
  {
    key: "global-explorer",
    label: "Global Explorer",
    emoji: "🌍",
    blurb: "Recent world cinema — you'll gladly read subtitles for a story worth telling.",
    vector: { era: 0.7, origin: -0.8, mood: 0.1, lane: -0.3 },
  },
  {
    key: "popcorn-optimist",
    label: "Popcorn Optimist",
    emoji: "✨",
    blurb: "Bright, fun, and broadly loved — cinema should send you home smiling.",
    vector: { era: 0.7, origin: 0.7, mood: 0.9, lane: 0.7 },
  },
];

/** The archetype whose anchor is nearest the profile. */
export function matchArchetype(profile: TasteVector): Archetype {
  return ARCHETYPES.reduce((best, a) =>
    distance(profile, a.vector) < distance(profile, best.vector) ? a : best,
  );
}

/**
 * Short human-readable trait chips for the result screen — only axes the user
 * leans on clearly (|value| ≥ 0.25) are surfaced, strongest first, so the
 * summary reads as a few confident labels rather than four hedged ones.
 */
export function profileTraits(profile: TasteVector): string[] {
  return (Object.keys(AXES) as TasteAxis[])
    .map((axis) => ({ axis, value: profile[axis] }))
    .filter((t) => Math.abs(t.value) >= 0.25)
    .sort((a, b) => Math.abs(b.value) - Math.abs(a.value))
    .map((t) => (t.value < 0 ? AXES[t.axis].low : AXES[t.axis].high));
}
