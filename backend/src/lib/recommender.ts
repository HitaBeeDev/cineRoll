import { Prisma } from "@prisma/client";
import { prisma } from "./prisma";
import {
  filmFeatureKeys,
  getTasteProfile,
  type FilmFeatures,
  type TasteProfileVectors,
} from "./tasteProfile";

/** Bump when the recommender's logic changes so evaluation can compare runs. */
export const MODEL_VERSION = "content-v1";

/** How many of the user's strongest taste genres to pre-filter the pool by. */
const TOP_GENRES = 6;
/** Cap on the candidate pool — keeps scoring cheap on a large catalog. */
const POOL_SIZE = 300;
/** Default number of recommendations returned. */
const DEFAULT_LIMIT = 6;
/** Below this many signals, recommendations are cold-start (or not enough data). */
const COLD_START_MIN = 3;

/** Per-dimension weights for the taste-similarity term. */
const DIM = {
  genre: 1.0,
  director: 0.8,
  decade: 0.4,
  runtime: 0.3,
  award: 0.6,
  rating: 0.4,
} as const;
/** How much the quality prior and recency contribute on top of taste similarity. */
const QUALITY_WEIGHT = 0.8;
const RECENCY_WEIGHT = 0.15;
/** MMR trade-off: 1 = pure score, 0 = pure diversity. */
const MMR_LAMBDA = 0.7;
const RECENCY_BASE_YEAR = 1920;

const candidateSelect = {
  id: true,
  slug: true,
  title: true,
  releaseYear: true,
  runtime: true,
  genres: true,
  director: true,
  posterUrl: true,
  imdbRating: true,
  rtScore: true,
  imdbTopMovieRank: true,
  imdbTopTvRank: true,
  oscarWins: true,
  oscarNominations: true,
  ggWins: true,
  ggNominations: true,
  cannesWins: true,
  cannesNominations: true,
  berlinWins: true,
  berlinNominations: true,
} satisfies Prisma.FilmSelect;

export type CandidateFilm = Prisma.FilmGetPayload<{ select: typeof candidateSelect }>;

/** Film ids the user has already watched, hidden, or saved — never recommend these. */
async function getExcludedFilmIds(userId: string): Promise<string[]> {
  const [watched, watchlist] = await Promise.all([
    prisma.watchedFilm.findMany({ where: { userId }, select: { filmId: true } }),
    prisma.watchlist.findMany({ where: { userId }, select: { filmId: true } }),
  ]);
  return [
    ...new Set([
      ...watched.map((w) => w.filmId),
      ...watchlist.map((w) => w.filmId),
    ]),
  ];
}

/** The user's strongest positively-weighted genres, most-preferred first. */
function topGenres(taste: TasteProfileVectors): string[] {
  return Object.entries(taste.genreWeights)
    .filter(([, weight]) => weight > 0)
    .sort((a, b) => b[1] - a[1])
    .slice(0, TOP_GENRES)
    .map(([genre]) => genre);
}

/**
 * Candidate generation: the pool the scorer ranks. Excludes everything the user
 * has already watched, hidden (`doNotSuggest`), or saved, then pre-filters to
 * the user's top taste genres so we score a few hundred relevant films instead
 * of the whole catalog. Falls back to a broad quality pool when taste is sparse
 * (brand-new user) so there's always something to rank.
 */
export async function generateCandidates(
  userId: string,
  taste: TasteProfileVectors,
): Promise<CandidateFilm[]> {
  const [excludedIds, genres] = [await getExcludedFilmIds(userId), topGenres(taste)];

  const where: Prisma.FilmWhereInput = {
    ...(excludedIds.length > 0 ? { id: { notIn: excludedIds } } : {}),
    ...(genres.length > 0 ? { genres: { hasSome: genres } } : {}),
  };

  return prisma.film.findMany({
    where,
    select: candidateSelect,
    // Quality prior on the pool; the taste-aware scoring happens downstream.
    orderBy: [{ imdbRating: { sort: "desc", nulls: "last" } }],
    take: POOL_SIZE,
  });
}

// ── Scoring ──────────────────────────────────────────────────────────────────

/** Weighted similarity between a candidate's features and the taste profile.
 *  Positive where the user likes those features, negative where they dislike. */
function tasteScore(film: FilmFeatures, taste: TasteProfileVectors): number {
  const f = filmFeatureKeys(film);
  let s = 0;
  for (const g of f.genres) s += DIM.genre * (taste.genreWeights[g] ?? 0);
  if (f.director) s += DIM.director * (taste.directorWeights[f.director] ?? 0);
  if (f.decade) s += DIM.decade * (taste.decadeWeights[f.decade] ?? 0);
  if (f.runtimeBand) s += DIM.runtime * (taste.runtimeBandWeights[f.runtimeBand] ?? 0);
  for (const a of f.awards) s += DIM.award * (taste.awardAffinity[a] ?? 0);
  for (const t of f.ratingTiers) s += DIM.rating * (taste.ratingTier[t] ?? 0);
  return s;
}

/** Quality prior in [0,1] from IMDb / RT and award weight. */
function qualityPrior(film: FilmFeatures): number {
  const parts: number[] = [];
  if (film.imdbRating != null) parts.push(film.imdbRating / 10);
  if (film.rtScore != null) parts.push(film.rtScore / 100);
  const base = parts.length
    ? parts.reduce((a, b) => a + b, 0) / parts.length
    : 0.4;
  const wins =
    film.oscarWins + film.ggWins + film.cannesWins + film.berlinWins;
  const noms =
    film.oscarNominations +
    film.ggNominations +
    film.cannesNominations +
    film.berlinNominations;
  const award = Math.min(1, (wins + noms * 0.25) / 4);
  return 0.75 * base + 0.25 * award;
}

/** Mild recency term in [0,1] — a tiebreaker, not a driver. */
function recencyPrior(film: FilmFeatures, currentYear: number): number {
  const span = currentYear - RECENCY_BASE_YEAR;
  if (span <= 0) return 0.5;
  return Math.min(1, Math.max(0, (film.releaseYear - RECENCY_BASE_YEAR) / span));
}

/**
 * The full ranking score: taste similarity + quality prior + recency. Shared by
 * the recommendation pipeline and the taste-weighted roll (`getPersonalizedRandomFilm`)
 * so both rank films by the same notion of "fit". Operates on bare `FilmFeatures`,
 * so any row carrying those columns can be scored.
 */
export function scoreFilm(
  film: FilmFeatures,
  taste: TasteProfileVectors,
  currentYear: number,
): number {
  return (
    tasteScore(film, taste) +
    QUALITY_WEIGHT * qualityPrior(film) +
    RECENCY_WEIGHT * recencyPrior(film, currentYear)
  );
}

// ── Diversity (MMR) ──────────────────────────────────────────────────────────

/** Content similarity between two films: genre overlap + same director. */
function filmSimilarity(a: CandidateFilm, b: CandidateFilm): number {
  const gb = new Set(b.genres);
  const inter = a.genres.filter((g) => gb.has(g)).length;
  const union = new Set([...a.genres, ...b.genres]).size;
  const genreJaccard = union > 0 ? inter / union : 0;
  const sameDirector = a.director && a.director === b.director ? 1 : 0;
  return 0.7 * genreJaccard + 0.3 * sameDirector;
}

type Scored = { film: CandidateFilm; score: number };

/** Maximal Marginal Relevance: greedily pick high-scoring films while penalizing
 *  similarity to those already chosen, so the top N isn't all one director/genre. */
function mmrRerank(scored: Scored[], limit: number): Scored[] {
  if (scored.length === 0) return [];
  // Min-max normalize scores so relevance and diversity are on the same scale.
  const scores = scored.map((s) => s.score);
  const min = Math.min(...scores);
  const max = Math.max(...scores);
  const range = max - min || 1;
  const norm = new Map(scored.map((s) => [s.film.id, (s.score - min) / range]));

  const pool = [...scored];
  const selected: Scored[] = [];

  while (selected.length < limit && pool.length > 0) {
    let bestIdx = 0;
    let bestMmr = -Infinity;
    for (let i = 0; i < pool.length; i++) {
      const candidate = pool[i]!;
      const relevance = norm.get(candidate.film.id) ?? 0;
      let maxSim = 0;
      for (const sel of selected) {
        maxSim = Math.max(maxSim, filmSimilarity(candidate.film, sel.film));
      }
      const mmr = MMR_LAMBDA * relevance - (1 - MMR_LAMBDA) * maxSim;
      if (mmr > bestMmr) {
        bestMmr = mmr;
        bestIdx = i;
      }
    }
    selected.push(pool.splice(bestIdx, 1)[0]!);
  }
  return selected;
}

// ── Explainability ───────────────────────────────────────────────────────────

const AWARD_PHRASE: Record<string, string> = {
  oscar_winner: "favor Oscar winners",
  oscar_nominee: "follow the Oscars",
  gg_winner: "favor Golden Globe winners",
  gg_nominee: "follow the Golden Globes",
  cannes_winner: "favor Cannes winners",
  cannes_nominee: "follow Cannes",
  berlin_winner: "favor Berlinale winners",
  berlin_nominee: "follow the Berlinale",
};

/** A human-readable reason: anchors on a liked film when one shares the top
 *  genre, then names the strongest matching taste dimensions. */
function buildReason(
  film: CandidateFilm,
  taste: TasteProfileVectors,
  likedByGenre: Map<string, string>,
): string {
  const f = filmFeatureKeys(film);
  const parts: { text: string; weight: number }[] = [];

  // Strongest matching genre.
  let topGenre: string | null = null;
  let topGenreWeight = 0;
  for (const g of f.genres) {
    const w = taste.genreWeights[g] ?? 0;
    if (w > topGenreWeight) {
      topGenreWeight = w;
      topGenre = g;
    }
  }
  if (topGenre) parts.push({ text: `watch a lot of ${topGenre}`, weight: topGenreWeight });

  if (f.director) {
    const w = taste.directorWeights[f.director] ?? 0;
    if (w > 0) parts.push({ text: `like ${f.director}`, weight: DIM.director * w });
  }
  for (const a of f.awards) {
    const w = taste.awardAffinity[a] ?? 0;
    if (w > 0 && AWARD_PHRASE[a]) {
      parts.push({ text: AWARD_PHRASE[a]!, weight: DIM.award * w });
    }
  }
  if (f.decade) {
    const w = taste.decadeWeights[f.decade] ?? 0;
    if (w > 0) parts.push({ text: `enjoy ${f.decade} films`, weight: DIM.decade * w });
  }

  parts.sort((a, b) => b.weight - a.weight);

  // Anchor on a specific liked film sharing the top genre, à la
  // "Because you liked Whiplash and watch a lot of Drama".
  const anchorTitle = topGenre ? likedByGenre.get(topGenre) : undefined;
  const phrases: string[] = [];
  if (anchorTitle) phrases.push(`liked ${anchorTitle}`);
  for (const p of parts) {
    if (phrases.length >= 2) break;
    phrases.push(p.text);
  }

  if (phrases.length === 0) {
    const genre = film.genres[0];
    return genre ? `A highly rated ${genre} pick.` : "A highly rated award pick.";
  }
  return `Because you ${phrases.slice(0, 2).join(" and ")}.`;
}

/** Map each genre to a representative liked-film title, for reason anchoring. */
async function likedFilmsByGenre(userId: string): Promise<Map<string, string>> {
  const liked = await prisma.watchedFilm.findMany({
    where: { userId, sentiment: "like" },
    orderBy: { watchedAt: "desc" },
    select: { film: { select: { title: true, genres: true } } },
  });
  const byGenre = new Map<string, string>();
  for (const { film } of liked) {
    for (const genre of film.genres) {
      if (!byGenre.has(genre)) byGenre.set(genre, film.title);
    }
  }
  return byGenre;
}

// ── Orchestration ────────────────────────────────────────────────────────────

export type Recommendation = {
  id: string;
  slug: string;
  title: string;
  year: number;
  posterUrl: string | null;
  genres: string[];
  director: string | null;
  imdbRating: number | null;
  rtScore: number | null;
  score: number;
  reason: string;
};

export type RecommendationResult =
  | { code: "NOT_ENOUGH_DATA"; modelVersion: string }
  | { modelVersion: string; coldStart: boolean; recommendations: Recommendation[] };

/**
 * Content-based recommendation pipeline:
 * candidate generation → taste-aware scoring (+ quality prior + recency) →
 * MMR diversity re-rank → human-readable reasons.
 *
 * Cold-start: a user below the signal threshold with no onboarding-genre seed
 * gets `NOT_ENOUGH_DATA`; with a seed they get genre + popularity picks flagged
 * `coldStart: true`. (Collaborative filtering is a documented future upgrade —
 * we do not fake it.)
 */
export async function recommend(
  userId: string,
  limit = DEFAULT_LIMIT,
): Promise<RecommendationResult> {
  const taste = await getTasteProfile(userId);
  const totalSignals = taste.positiveCount + taste.negativeCount;
  const hasGenreSignal = Object.keys(taste.genreWeights).length > 0;

  if (totalSignals < COLD_START_MIN && !hasGenreSignal) {
    return { code: "NOT_ENOUGH_DATA", modelVersion: MODEL_VERSION };
  }
  const coldStart = totalSignals < COLD_START_MIN;

  const [candidates, likedByGenre] = await Promise.all([
    generateCandidates(userId, taste),
    coldStart ? Promise.resolve(new Map<string, string>()) : likedFilmsByGenre(userId),
  ]);

  const currentYear = new Date().getFullYear();
  const scored: Scored[] = candidates.map((film) => ({
    film,
    score: scoreFilm(film, taste, currentYear),
  }));
  scored.sort((a, b) => b.score - a.score);

  const top = mmrRerank(scored, limit);

  const recommendations: Recommendation[] = top.map(({ film, score }) => ({
    id: film.id,
    slug: film.slug,
    title: film.title,
    year: film.releaseYear,
    posterUrl: film.posterUrl,
    genres: film.genres,
    director: film.director,
    imdbRating: film.imdbRating,
    rtScore: film.rtScore,
    score: Math.round(score * 1000) / 1000,
    reason: buildReason(film, taste, likedByGenre),
  }));

  return { modelVersion: MODEL_VERSION, coldStart, recommendations };
}
