import { Prisma } from "@prisma/client";
import { prisma } from "./prisma";
import {
  SENTIMENT_WEIGHT,
  SIGNAL_WEIGHT,
  recencyDecay,
  sentimentWeight,
} from "./tasteWeights";

const emptyWeights = {};

export async function markTasteProfileStale(userId: string): Promise<void> {
  const staleAt = new Date();

  await prisma.userTasteProfile.upsert({
    where: { userId },
    create: {
      userId,
      genreWeights: emptyWeights,
      directorWeights: emptyWeights,
      decadeWeights: emptyWeights,
      runtimeBandWeights: emptyWeights,
      awardAffinity: emptyWeights,
      ratingTier: emptyWeights,
      staleAt,
      updatedAt: staleAt,
    },
    update: {
      staleAt,
    },
  });
}

// ── Feature extraction ───────────────────────────────────────────────────────

const filmFeatureSelect = {
  genres: true,
  director: true,
  releaseYear: true,
  runtime: true,
  imdbRating: true,
  rtScore: true,
  oscarWins: true,
  oscarNominations: true,
  ggWins: true,
  ggNominations: true,
  cannesWins: true,
  cannesNominations: true,
  berlinWins: true,
  berlinNominations: true,
} satisfies Prisma.FilmSelect;

type FilmFeatures = Prisma.FilmGetPayload<{ select: typeof filmFeatureSelect }>;

/** A weighted feature vector keyed by feature label. */
type Vector = Record<string, number>;

const DAY_MS = 1000 * 60 * 60 * 24;

/** Below this many positive signals, blend in onboarding genre preferences. */
const COLD_START_THRESHOLD = 3;
/** Base weight for the top onboarding genre seed (descending by rank). */
const COLD_START_SEED = 0.5;

function decadeKey(year: number | null): string | null {
  if (year == null) return null;
  return `${Math.floor(year / 10) * 10}s`;
}

function runtimeBand(runtime: number | null): string | null {
  if (runtime == null || runtime <= 0) return null;
  if (runtime < 90) return "under_90";
  if (runtime < 120) return "90_120";
  if (runtime < 150) return "120_150";
  return "over_150";
}

const AWARD_BODIES = [
  { key: "oscar", wins: "oscarWins", noms: "oscarNominations" },
  { key: "gg", wins: "ggWins", noms: "ggNominations" },
  { key: "cannes", wins: "cannesWins", noms: "cannesNominations" },
  { key: "berlin", wins: "berlinWins", noms: "berlinNominations" },
] as const;

function awardKeys(film: FilmFeatures): string[] {
  const keys: string[] = [];
  for (const body of AWARD_BODIES) {
    if (film[body.wins] > 0) keys.push(`${body.key}_winner`);
    else if (film[body.noms] > 0) keys.push(`${body.key}_nominee`);
  }
  return keys;
}

function ratingTierKeys(film: FilmFeatures): string[] {
  const keys: string[] = [];
  if (film.imdbRating != null) keys.push(`imdb_${Math.floor(film.imdbRating)}`);
  if (film.rtScore != null) keys.push(`rt_${Math.floor(film.rtScore / 10) * 10}`);
  return keys;
}

/** Max-abs normalize so the strongest feature is ±1 — makes users with 5 vs
 *  500 signals directly comparable while preserving relative preference. */
function normalize(vector: Vector): Vector {
  let maxAbs = 0;
  for (const value of Object.values(vector)) {
    maxAbs = Math.max(maxAbs, Math.abs(value));
  }
  if (maxAbs === 0) return vector;
  const out: Vector = {};
  for (const [key, value] of Object.entries(vector)) {
    out[key] = value / maxAbs;
  }
  return out;
}

// ── Builder ──────────────────────────────────────────────────────────────────

export type TasteProfileVectors = {
  genreWeights: Vector;
  directorWeights: Vector;
  decadeWeights: Vector;
  runtimeBandWeights: Vector;
  awardAffinity: Vector;
  ratingTier: Vector;
  positiveCount: number;
  negativeCount: number;
};

type Signal = { film: FilmFeatures; weight: number; at: Date };

/**
 * Aggregate all of a user's raw signals into compact, recency-decayed,
 * normalized preference vectors, persist them to `UserTasteProfile`, and return
 * the result.
 *
 * Signal → base weight (see tasteWeights.ts):
 *   👍 liked watched → strong positive · watched/no-sentiment → mild positive
 *   👎 disliked → strong negative · not-interested → negative
 *   watchlist add → weak positive
 * (numeric ratings feed in once section 14's UserRating model exists.)
 *
 * Each signal is decayed by age (90-day half-life) before it accumulates into
 * the genre / director / decade / runtime-band / award / rating-tier vectors;
 * each vector is then max-abs normalized.
 */
export async function buildTasteProfile(
  userId: string,
): Promise<TasteProfileVectors> {
  const [watched, watchlist, user] = await Promise.all([
    prisma.watchedFilm.findMany({
      where: { userId },
      select: {
        sentiment: true,
        doNotSuggest: true,
        watchedAt: true,
        film: { select: filmFeatureSelect },
      },
    }),
    prisma.watchlist.findMany({
      where: { userId },
      select: { addedAt: true, film: { select: filmFeatureSelect } },
    }),
    prisma.user.findUnique({
      where: { id: userId },
      select: { onboardingGenres: true },
    }),
  ]);

  const signals: Signal[] = [];

  for (const w of watched) {
    // Not Interested is a hidden/negative signal; otherwise use sentiment
    // (which maps null → mild positive for "they chose to watch it").
    const weight = w.doNotSuggest
      ? SIGNAL_WEIGHT.notInterested
      : sentimentWeight(w.sentiment);
    signals.push({ film: w.film, weight, at: w.watchedAt });
  }

  for (const entry of watchlist) {
    signals.push({
      film: entry.film,
      weight: SIGNAL_WEIGHT.watchlistAdd,
      at: entry.addedAt,
    });
  }

  const now = Date.now();
  const genreWeights: Vector = {};
  const directorWeights: Vector = {};
  const decadeWeights: Vector = {};
  const runtimeBandWeights: Vector = {};
  const awardAffinity: Vector = {};
  const ratingTier: Vector = {};
  let positiveCount = 0;
  let negativeCount = 0;

  const add = (vec: Vector, key: string | null, value: number) => {
    if (key == null) return;
    vec[key] = (vec[key] ?? 0) + value;
  };

  for (const { film, weight, at } of signals) {
    if (weight > 0) positiveCount++;
    else if (weight < 0) negativeCount++;

    const ageDays = (now - at.getTime()) / DAY_MS;
    const w = weight * recencyDecay(ageDays);

    for (const genre of film.genres) add(genreWeights, genre, w);
    add(directorWeights, film.director, w);
    add(decadeWeights, decadeKey(film.releaseYear), w);
    add(runtimeBandWeights, runtimeBand(film.runtime), w);
    for (const key of awardKeys(film)) add(awardAffinity, key, w);
    for (const key of ratingTierKeys(film)) add(ratingTier, key, w);
  }

  // Cold-start: a user with too few real signals gets their onboarding taste
  // cards' genres blended into the genre vector (ranked most-preferred first),
  // so recommendations have something to stand on from day one.
  const onboardingGenres = user?.onboardingGenres ?? [];
  if (positiveCount < COLD_START_THRESHOLD && onboardingGenres.length > 0) {
    const n = onboardingGenres.length;
    onboardingGenres.forEach((genre, i) => {
      add(genreWeights, genre, COLD_START_SEED * (1 - i / n));
    });
  }

  const result: TasteProfileVectors = {
    genreWeights: normalize(genreWeights),
    directorWeights: normalize(directorWeights),
    decadeWeights: normalize(decadeWeights),
    runtimeBandWeights: normalize(runtimeBandWeights),
    awardAffinity: normalize(awardAffinity),
    ratingTier: normalize(ratingTier),
    positiveCount,
    negativeCount,
  };

  const updatedAt = new Date();
  await prisma.userTasteProfile.upsert({
    where: { userId },
    create: { userId, ...result, staleAt: null, updatedAt },
    update: { ...result, staleAt: null, updatedAt },
  });

  return result;
}

/**
 * Defensive recompute ceiling: even if nothing flagged the profile stale,
 * rebuild it on read once it is older than this, so it never drifts far from
 * the underlying signals.
 */
const STALE_MAX_AGE_MS = 7 * DAY_MS;

/**
 * Lazy, debounced recompute. Signal mutations only flag the profile stale
 * (cheap); the actual rebuild happens here on the next read — so a burst of
 * signal changes coalesces into a single recompute. Rebuilds when the row is
 * missing, explicitly stale (`staleAt` set), or past the max-age ceiling.
 */
export async function refreshTasteProfileIfStale(userId: string): Promise<void> {
  const row = await prisma.userTasteProfile.findUnique({
    where: { userId },
    select: { staleAt: true, updatedAt: true },
  });

  const needsBuild =
    row === null ||
    row.staleAt !== null ||
    Date.now() - row.updatedAt.getTime() > STALE_MAX_AGE_MS;

  if (needsBuild) await buildTasteProfile(userId);
}

const asVector = (value: Prisma.JsonValue | null | undefined): Vector =>
  value && typeof value === "object" && !Array.isArray(value)
    ? (value as Vector)
    : {};

/**
 * Consumer-facing read used by the recommender and the personalized roll.
 * Ensures the profile is fresh (lazy rebuild on stale), then returns the typed
 * preference vectors. Always returns a profile — empty vectors for a brand-new
 * user with no signals.
 */
export async function getTasteProfile(
  userId: string,
): Promise<TasteProfileVectors> {
  await refreshTasteProfileIfStale(userId);

  const row = await prisma.userTasteProfile.findUnique({ where: { userId } });
  if (row === null) {
    return {
      genreWeights: {},
      directorWeights: {},
      decadeWeights: {},
      runtimeBandWeights: {},
      awardAffinity: {},
      ratingTier: {},
      positiveCount: 0,
      negativeCount: 0,
    };
  }

  return {
    genreWeights: asVector(row.genreWeights),
    directorWeights: asVector(row.directorWeights),
    decadeWeights: asVector(row.decadeWeights),
    runtimeBandWeights: asVector(row.runtimeBandWeights),
    awardAffinity: asVector(row.awardAffinity),
    ratingTier: asVector(row.ratingTier),
    positiveCount: row.positiveCount,
    negativeCount: row.negativeCount,
  };
}

// Keep SENTIMENT_WEIGHT re-exported for callers that report the scale.
export { SENTIMENT_WEIGHT };
