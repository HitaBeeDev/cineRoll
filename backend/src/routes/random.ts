import { Prisma } from "@prisma/client";
import { Router } from "express";
import { buildWhereClause, RandomQuery, randomQuerySchema } from "../lib/filmFilters";
import { setPublicCache } from "../lib/cache";
import { logEvent } from "../lib/events";
import { prisma } from "../lib/prisma";
import { scoreFilm } from "../lib/recommender";
import { getTasteProfile } from "../lib/tasteProfile";
import { HttpError } from "../middleware/errorHandler";
import { getValidated, validate } from "../middleware/validate";

export const randomRouter = Router();

export type RandomFilmRow = {
  id: string;
  slug: string;
  title: string;
  originalTitle: string | null;
  releaseYear: number;
  year: number;
  runtime: number | null;
  genres: string[];
  contentType: string;
  plot: string | null;
  director: string | null;
  posterUrl: string | null;
  posterColor: string | null;
  backdropUrl: string | null;
  imdbRating: number | null;
  rtScore: number | null;
  imdbTopMovieRank: number | null;
  imdbTopTvRank: number | null;
  oscarCategories: Prisma.JsonValue;
  oscarNominations: number;
  oscarWins: number;
  ggCategories: Prisma.JsonValue;
  ggNominations: number;
  ggWins: number;
  cannesCategories: Prisma.JsonValue;
  cannesNominations: number;
  cannesWins: number;
  berlinCategories: Prisma.JsonValue;
  berlinNominations: number;
  berlinWins: number;
};

const randomSelect = Prisma.sql`
  "Film"."id",
  "Film"."slug",
  "Film"."title",
  "Film"."originalTitle",
  "Film"."year" AS "releaseYear",
  "Film"."year",
  "Film"."runtime",
  "Film"."genres",
  "Film"."contentType",
  "Film"."plot",
  "Film"."director",
  "Film"."posterUrl",
  "Film"."posterColor",
  "Film"."backdropUrl",
  "Film"."imdbRating",
  "Film"."rtScore",
  "Film"."imdbTopMovieRank",
  "Film"."imdbTopTvRank",
  "Film"."oscarCategories",
  "Film"."oscarNominations",
  "Film"."oscarWins",
  "Film"."ggCategories",
  "Film"."ggNominations",
  "Film"."ggWins",
  "Film"."cannesCategories",
  "Film"."cannesNominations",
  "Film"."cannesWins",
  "Film"."berlinCategories",
  "Film"."berlinNominations",
  "Film"."berlinWins"
`;

async function getDoNotSuggestFilmIds(userId: string): Promise<string[]> {
  const tableRows = await prisma.$queryRaw<{ exists: boolean }[]>`
    SELECT to_regclass('public."WatchedFilm"') IS NOT NULL AS "exists"
  `;

  if (tableRows[0]?.exists !== true) return [];

  const rows = await prisma.$queryRaw<{ filmId: string }[]>`
    SELECT "filmId"
    FROM "WatchedFilm"
    WHERE "userId" = ${userId}
      AND "doNotSuggest" = true
  `;

  return rows.map(row => row.filmId);
}

export async function getRandomFilm(query: RandomQuery): Promise<{
  film: RandomFilmRow | null;
  total: number;
}> {
  const { films, total } = await getRandomFilms(query, 1);
  return { film: films[0] ?? null, total };
}

export async function getRandomFilms(query: RandomQuery, count: number): Promise<{
  films: RandomFilmRow[];
  total: number;
}> {
  const additionalConditions: Prisma.Sql[] = [];

  if (query.userId) {
    const excludedFilmIds = await getDoNotSuggestFilmIds(query.userId);
    if (excludedFilmIds.length > 0) {
      additionalConditions.push(Prisma.sql`"Film"."id" NOT IN (${Prisma.join(excludedFilmIds)})`);
    }
  }

  const whereSql = buildWhereClause(query, additionalConditions);

  const [films, countRows] = await Promise.all([
    prisma.$queryRaw<RandomFilmRow[]>(
      Prisma.sql`SELECT ${randomSelect} FROM "Film" ${whereSql} ORDER BY RANDOM() LIMIT ${count}`,
    ),
    prisma.$queryRaw<{ count: bigint }[]>`
      SELECT COUNT(*)::BIGINT AS count
      FROM "Film"
      ${whereSql}
    `,
  ]);

  const total = Number(countRows[0]?.count ?? 0);
  return { films, total };
}

// Returns a random sample from the top-rated films matching the query.
// Used for natural-language candidate pools: quality films first, random variety within them.
export async function getQualityCandidates(
  query: RandomQuery,
  topN: number,
  sampleN: number,
): Promise<{ films: RandomFilmRow[]; total: number }> {
  const additionalConditions: Prisma.Sql[] = [];

  if (query.userId) {
    const excludedFilmIds = await getDoNotSuggestFilmIds(query.userId);
    if (excludedFilmIds.length > 0) {
      additionalConditions.push(Prisma.sql`"Film"."id" NOT IN (${Prisma.join(excludedFilmIds)})`);
    }
  }

  const whereSql = buildWhereClause(query, additionalConditions);

  const [films, countRows] = await Promise.all([
    prisma.$queryRaw<RandomFilmRow[]>(
      Prisma.sql`
        SELECT top_films.*
        FROM (
          SELECT ${randomSelect}
          FROM "Film"
          ${whereSql}
          ORDER BY "Film"."imdbRating" DESC NULLS LAST
          LIMIT ${topN}
        ) top_films
        ORDER BY RANDOM()
        LIMIT ${sampleN}
      `,
    ),
    prisma.$queryRaw<{ count: bigint }[]>`
      SELECT COUNT(*)::BIGINT AS count FROM "Film" ${whereSql}
    `,
  ]);

  return { films, total: Number(countRows[0]?.count ?? 0) };
}

// ── Personalized roll (taste-weighted, ε-greedy) ─────────────────────────────

/** Size of the quality candidate pool the taste scorer ranks. Matches the
 *  recommender's pool size so both surfaces draw from the same shape of pool. */
const PERSONALIZED_POOL_SIZE = 300;
/** Exploration factor: with probability ε the roll picks uniformly from the pool
 *  instead of by taste, so it never tunnels into a filter bubble. Tuned for a
 *  visible balance of "on-taste" vs "surprise" (≈1-in-6 rolls explore). */
const EXPLORATION_EPSILON = 0.15;
/** Softmax temperature over taste scores. Lower = sharper bias toward the
 *  highest-scoring films; higher = flatter, closer to uniform. */
const SOFTMAX_TEMPERATURE = 0.5;

/** Pick one item by weight (roulette-wheel). Falls back to uniform if all
 *  weights are zero/degenerate. */
function weightedSample<T>(items: T[], weights: number[]): T {
  let total = 0;
  for (const w of weights) total += w;
  if (!(total > 0)) return items[Math.floor(Math.random() * items.length)]!;

  let r = Math.random() * total;
  for (let i = 0; i < items.length; i++) {
    r -= weights[i]!;
    if (r <= 0) return items[i]!;
  }
  return items[items.length - 1]!;
}

/**
 * Taste-weighted roll. Builds the same quality candidate pool the normal roll
 * filters against (respecting `doNotSuggest`), then applies ε-greedy selection:
 * with probability ε it picks uniformly (exploration / serendipity), otherwise
 * it samples by softmax over each film's taste score (exploitation). Cold-start
 * users — empty taste profile — score purely on the quality/recency prior, so
 * the weighted draw degrades gracefully to a quality-biased random pick.
 *
 * Empty/edge handling matches the normal roll: returns `null` when nothing
 * matches the filters.
 */
export async function getPersonalizedRandomFilm(query: RandomQuery): Promise<{
  film: RandomFilmRow | null;
  total: number;
  exploration: boolean;
}> {
  const { userId } = query;
  if (!userId) {
    const { film, total } = await getRandomFilm(query);
    return { film, total, exploration: false };
  }

  const additionalConditions: Prisma.Sql[] = [];
  const excludedFilmIds = await getDoNotSuggestFilmIds(userId);
  if (excludedFilmIds.length > 0) {
    additionalConditions.push(Prisma.sql`"Film"."id" NOT IN (${Prisma.join(excludedFilmIds)})`);
  }

  const whereSql = buildWhereClause(query, additionalConditions);

  const [pool, countRows] = await Promise.all([
    prisma.$queryRaw<RandomFilmRow[]>(
      Prisma.sql`
        SELECT ${randomSelect}
        FROM "Film"
        ${whereSql}
        ORDER BY "Film"."imdbRating" DESC NULLS LAST
        LIMIT ${PERSONALIZED_POOL_SIZE}
      `,
    ),
    prisma.$queryRaw<{ count: bigint }[]>`
      SELECT COUNT(*)::BIGINT AS count FROM "Film" ${whereSql}
    `,
  ]);

  const total = Number(countRows[0]?.count ?? 0);
  if (pool.length === 0) return { film: null, total, exploration: false };

  // ε-greedy explore: pick uniformly so the roll keeps surprising the user.
  if (Math.random() < EXPLORATION_EPSILON) {
    return {
      film: pool[Math.floor(Math.random() * pool.length)]!,
      total,
      exploration: true,
    };
  }

  // Exploit: weighted-random by taste score via a (numerically stable) softmax.
  const taste = await getTasteProfile(userId);
  const currentYear = new Date().getFullYear();
  const scores = pool.map(film => scoreFilm(film, taste, currentYear));
  const maxScore = Math.max(...scores);
  const weights = scores.map(s => Math.exp((s - maxScore) / SOFTMAX_TEMPERATURE));

  return { film: weightedSample(pool, weights), total, exploration: false };
}

randomRouter.get("/", validate(randomQuerySchema), async (req, res) => {
  const query = getValidated<RandomQuery>(req, "query");
  const { userId, personalized, ...loggedFilters } = query;
  const usePersonalized = personalized === true && userId != null;

  const { film, total, exploration } = usePersonalized
    ? await getPersonalizedRandomFilm(query)
    : { ...(await getRandomFilm(query)), exploration: false };

  if (!film) {
    throw new HttpError(404, "No films match the given filters", "NO_FILMS_FOUND");
  }

  await logEvent({
    type: usePersonalized ? "roll_personalized" : "roll",
    userId: userId ?? null,
    filmId: film.id,
    context: {
      source: "random_endpoint",
      personalized: usePersonalized,
      ...(usePersonalized ? { exploration } : {}),
      total,
      filters: loggedFilters,
    },
  });

  // Personalized rolls are per-user and stochastic — never shared-cache them.
  if (usePersonalized) {
    res.set("Cache-Control", "private, no-store");
    res.json({ film, total, personalized: true, exploration });
    return;
  }

  setPublicCache(res, 60);
  res.json({ film, total });
});
