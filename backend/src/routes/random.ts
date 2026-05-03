import { Prisma } from "@prisma/client";
import { Router } from "express";
import { buildWhereClause, ListQuery, listQuerySchema } from "../lib/filmFilters";
import { setPublicCache } from "../lib/cache";
import { prisma } from "../lib/prisma";
import { HttpError } from "../middleware/errorHandler";
import { getValidated, validate } from "../middleware/validate";

export const randomRouter = Router();

type RandomFilmRow = {
  id: string;
  slug: string;
  title: string;
  releaseYear: number;
  year: number;
  runtime: number | null;
  genres: string[];
  plot: string | null;
  director: string | null;
  posterUrl: string | null;
  imdbRating: number | null;
  oscarNominations: number;
  oscarWins: number;
  ggNominations: number;
  ggWins: number;
};

const randomSelect = Prisma.sql`
  "Film"."id",
  "Film"."slug",
  "Film"."title",
  "Film"."year" AS "releaseYear",
  "Film"."year",
  "Film"."runtime",
  "Film"."genres",
  "Film"."plot",
  "Film"."director",
  "Film"."posterUrl",
  "Film"."imdbRating",
  "Film"."oscarNominations",
  "Film"."oscarWins",
  "Film"."ggNominations",
  "Film"."ggWins"
`;

randomRouter.get("/", validate(listQuerySchema), async (req, res) => {
  const query = getValidated<ListQuery>(req, "query");
  const whereSql = buildWhereClause(query);

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
