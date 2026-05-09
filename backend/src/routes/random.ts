import { Prisma } from "@prisma/client";
import { Router } from "express";
import { buildWhereClause, RandomQuery, randomQuerySchema } from "../lib/filmFilters";
import { setPublicCache } from "../lib/cache";
import { prisma } from "../lib/prisma";
import { HttpError } from "../middleware/errorHandler";
import { getValidated, validate } from "../middleware/validate";

export const randomRouter = Router();

type RandomFilmRow = {
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
  "Film"."cannesWins"
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

randomRouter.get("/", validate(randomQuerySchema), async (req, res) => {
  const query = getValidated<RandomQuery>(req, "query");
  const additionalConditions: Prisma.Sql[] = [];

  if (query.userId) {
    const excludedFilmIds = await getDoNotSuggestFilmIds(query.userId);
    if (excludedFilmIds.length > 0) {
      additionalConditions.push(Prisma.sql`"Film"."id" NOT IN (${Prisma.join(excludedFilmIds)})`);
    }
  }

  const whereSql = buildWhereClause(query, additionalConditions);

  const [films, countRows] = await Promise.all([
    prisma.$queryRaw<RandomFilmRow[]>`
      SELECT ${randomSelect}
      FROM "Film"
      ${whereSql}
      ORDER BY RANDOM()
      LIMIT 1
    `,
    prisma.$queryRaw<{ count: bigint }[]>`
      SELECT COUNT(*)::BIGINT AS count
      FROM "Film"
      ${whereSql}
    `,
  ]);

  const film = films[0];
  const total = Number(countRows[0]?.count ?? 0);

  if (!film) {
    throw new HttpError(404, "No films match the given filters", "NO_FILMS_FOUND");
  }

  setPublicCache(res, 60);
  res.json({ film, total });
});
