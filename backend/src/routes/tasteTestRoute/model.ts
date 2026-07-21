/**
 * Taste Test model — the pure, DB-free core of the feature.
 *
 * Every film is projected onto three interpretable taste axes (origin, mood,
 * lane — see `filmToVector`). A user answers ten *comparable* this-or-that pairs
 * (same content type, similar acclaim, close in time); each pick is read as a
 * vote on whichever axis actually separated the two films
 * (`profileFromComparisons`), which is matched to the nearest archetype and used
 * to rank recommendations.
 *
 * Why no "era" axis: forking on era forces a big time gap between the two
 * posters (1950 vs 2023), which reads as an unfair, obvious choice rather than a
 * taste dilemma. Time-of-release is "when", not "what kind" — so we keep pairs
 * close in era and profile people on style instead. Easy to add back later if we
 * want an explicit "classic vs modern" dimension.
 *
 * Design note: axis mappings and archetype anchors are curated (they encode
 * domain judgement about award cinema); the profiling, matching and ranking on
 * top are fully algorithmic. No ML model — a small, legible vector space is
 * reliable, testable, and easy to extend.
 */

export type TasteAxis = "origin" | "mood" | "lane";

export const AXIS_LIST: TasteAxis[] = ["origin", "mood", "lane"];

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

// Genre → mood weight in [-1, 1]: heavy/serious is negative, light/fun positive.
// A film's mood is the mean of its genres' weights (unlisted genres are neutral).
const GENRE_MOOD: Record<string, number> = {
  Comedy: 1, Family: 1, Animation: 0.8, Musical: 0.8, Adventure: 0.7,
  Fantasy: 0.6, Music: 0.6, Romance: 0.5, "Science Fiction": 0.3,
  War: -1, Drama: -0.8, Crime: -0.7, Documentary: -0.7, Thriller: -0.6,
  History: -0.6, Biography: -0.5, Mystery: -0.4, Horror: -0.3, Western: -0.3,
};

const clamp = (n: number, lo = -1, hi = 1) => Math.max(lo, Math.min(hi, n));

/** Project a film onto the three taste axes. All outputs are clamped to [-1, 1]. */
export function filmToVector(film: FilmFeatures): TasteVector {
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

  return { origin, mood, lane };
}

/** Squared Euclidean distance between two taste vectors (equal axis weights). */
export function distance(a: TasteVector, b: TasteVector): number {
  return (
    (a.origin - b.origin) ** 2 +
    (a.mood - b.mood) ** 2 +
    (a.lane - b.lane) ** 2
  );
}

/** One answered question: the vector of the film chosen, and of the one rejected. */
export interface Comparison {
  chosen: TasteVector;
  other: TasteVector;
}

/**
 * Turn the answered pairs into a taste profile by *differentiation-weighted
 * voting*: on each axis, average the chosen films' values, but weight each vote
 * by how far apart the two films were on that axis. A question that forked on
 * mood barely moves your `origin` score, so the axis a pair actually tested is
 * the one it teaches — the result reflects the real choices, not incidental
 * similarities. Axes no pair separated stay at 0 (neutral).
 */
export function profileFromComparisons(comparisons: Comparison[]): TasteVector {
  const profile: TasteVector = { origin: 0, mood: 0, lane: 0 };
  for (const axis of AXIS_LIST) {
    let weighted = 0;
    let weight = 0;
    for (const { chosen, other } of comparisons) {
      const w = Math.abs(chosen[axis] - other[axis]);
      weighted += chosen[axis] * w;
      weight += w;
    }
    profile[axis] = weight > 0 ? clamp(weighted / weight) : 0;
  }
  return profile;
}

export interface Archetype {
  key: string;
  label: string;
  emoji: string;
  blurb: string;
  /** Curated tags shown as chips — always coherent with the label. */
  tags: string[];
  /** Accent hex the result screen themes itself with — a per-archetype identity. */
  accent: string;
  vector: TasteVector;
}

/**
 * Six archetypes as anchor points in (origin, mood, lane) space, spread so every
 * plausible profile has a distinct nearest neighbour. Tags are hand-written to
 * match each label's voice; the accent gives each result its own visual identity.
 */
export const ARCHETYPES: Archetype[] = [
  {
    key: "festival-purist",
    label: "Festival Purist",
    emoji: "🎬",
    blurb: "Slow-burn, subtitled festival darlings — you like a film that makes you work for it.",
    tags: ["Subtitles-friendly", "Auteur cinema", "Slow-burn"],
    accent: "#7c6cf0",
    vector: { origin: -0.9, mood: -0.5, lane: -0.9 },
  },
  {
    key: "world-wanderer",
    label: "World Wanderer",
    emoji: "🌍",
    blurb: "Global stories you'll gladly read subtitles for — but you like one with a pulse.",
    tags: ["World cinema", "Story-first", "Adventurous"],
    accent: "#2dd4bf",
    vector: { origin: -0.8, mood: 0.4, lane: 0.1 },
  },
  {
    key: "indie-soul",
    label: "Indie Soul",
    emoji: "🎭",
    blurb: "Small, aching, character-first — the quiet ones that sneak up on you.",
    tags: ["Indie", "Character-driven", "Understated"],
    accent: "#d98ca6",
    vector: { origin: 0.4, mood: -0.4, lane: -0.7 },
  },
  {
    key: "prestige-seeker",
    label: "Prestige Seeker",
    emoji: "🏆",
    blurb: "Heavyweight, awards-night dramas — the ones everyone argues about on the night.",
    tags: ["Best Picture bait", "Heavyweight drama", "Prestige"],
    accent: "#e5b567",
    vector: { origin: 0.7, mood: -0.8, lane: 0.5 },
  },
  {
    key: "feel-good-fan",
    label: "Feel-Good Fan",
    emoji: "🍿",
    blurb: "Warm, funny, endlessly rewatchable — cinema should send you home smiling.",
    tags: ["Feel-good", "Warm & funny", "Rewatchable"],
    accent: "#f59e42",
    vector: { origin: 0.7, mood: 0.9, lane: 0.7 },
  },
  {
    key: "blockbuster-heart",
    label: "Blockbuster Heart",
    emoji: "✨",
    blurb: "Big, beloved, made-for-the-big-screen — the crowd-pleasers everyone's seen.",
    tags: ["Broadly loved", "Big-screen", "Spectacle"],
    accent: "#f0b429",
    vector: { origin: 0.5, mood: 0.2, lane: 0.95 },
  },
];

/**
 * Archetypes ordered nearest-first to the profile. The first is the match; the
 * second is the "secondary archetype" the result screen shows as a leaning.
 */
export function rankArchetypes(profile: TasteVector): Archetype[] {
  return [...ARCHETYPES].sort(
    (a, b) => distance(profile, a.vector) - distance(profile, b.vector),
  );
}

/** The archetype whose anchor is nearest the profile. */
export function matchArchetype(profile: TasteVector): Archetype {
  return rankArchetypes(profile)[0] as Archetype; // ARCHETYPES is never empty
}

// The widest a squared distance can get in this cube: two profiles at opposite
// corners on all three axes = (2² × 3). Used to turn a distance into a 0–100
// "match" that means the same thing everywhere it's shown.
const MAX_DISTANCE = 12;

/**
 * A distance in taste space → an honest 0–100 match score. Uses the root so the
 * scale is linear in "how far off" rather than in squared error, and never
 * bottoms out at 0 for a real (already on-taste) recommendation.
 */
export function matchPercent(dist: number): number {
  const closeness = 1 - Math.sqrt(Math.max(0, dist) / MAX_DISTANCE);
  return Math.round(clamp(closeness, 0, 1) * 100);
}
