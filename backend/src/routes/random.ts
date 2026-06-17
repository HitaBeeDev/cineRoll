import { Prisma } from "@prisma/client";
import { Router } from "express";
import { buildWhereClause, RandomQuery, randomQuerySchema } from "../lib/filmFilters";
import { setPublicCache } from "../lib/cache";
import { logEvent } from "../lib/events";
import { prisma } from "../lib/prisma";
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

randomRouter.get("/", validate(randomQuerySchema), async (req, res) => {
  const query = getValidated<RandomQuery>(req, "query");
  const { film, total } = await getRandomFilm(query);
  const { userId, ...loggedFilters } = query;

  if (!film) {
    throw new HttpError(404, "No films match the given filters", "NO_FILMS_FOUND");
  }

  await logEvent({
    type: userId ? "roll_personalized" : "roll",
    userId: userId ?? null,
    filmId: film.id,
    context: {
      source: "random_endpoint",
      total,
      filters: loggedFilters,
    },
  });

  setPublicCache(res, 60);
  res.json({ film, total });
});
