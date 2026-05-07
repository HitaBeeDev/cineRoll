import { Prisma } from "@prisma/client";
import { Router } from "express";
import { z } from "zod";
import { setPublicCache } from "../lib/cache";
import { buildWhereClause, ListQuery, listQuerySchema } from "../lib/filmFilters";
import { prisma } from "../lib/prisma";
import { HttpError } from "../middleware/errorHandler";
import { getValidated, validate } from "../middleware/validate";

export const filmsRouter = Router();

const filmListSelect = Prisma.sql`
  "Film"."id",
  "Film"."slug",
  "Film"."title",
  "Film"."year" AS "releaseYear",
  "Film"."year",
  "Film"."genres",
  "Film"."posterUrl",
  "Film"."posterColor",
  "Film"."imdbRating",
  "Film"."oscarNominations",
  "Film"."oscarWins",
  "Film"."ggNominations",
  "Film"."ggWins"
`;

const filmDetailSelect = {
  id: true,
  slug: true,
  tmdbId: true,
  imdbId: true,
  title: true,
  releaseYear: true,
  runtime: true,
  genres: true,
  plot: true,
  director: true,
  cast: true,
  language: true,
  posterUrl: true,
  posterColor: true,
  backdropUrl: true,
  trailerUrl: true,
  imdbRating: true,
  rtScore: true,
  oscarNominations: true,
  oscarWins: true,
  oscarCategories: true,
  ggNominations: true,
  ggWins: true,
  ggCategories: true,
  isPickOfDay: true,
  pickOfDayDate: true,
};

const slugParamsSchema = z.object({
  slug: z.string().trim().min(1).max(180),
});

filmsRouter.get("/genres", async (_req, res) => {
  const rows = await prisma.$queryRaw<{ genre: string }[]>`
    SELECT DISTINCT unnest("Film"."genres") AS genre
    FROM "Film"
    WHERE array_length("Film"."genres", 1) > 0
    ORDER BY genre ASC
  `;

  setPublicCache(res, 3600);
  res.json({ genres: rows.map(r => r.genre) });
});

filmsRouter.get("/award-years", async (_req, res) => {
  const rows = await prisma.$queryRaw<{ awardYear: number }[]>`
    SELECT DISTINCT (award->>'awardYear')::INT AS "awardYear"
    FROM "Film", jsonb_array_elements("Film"."oscarCategories") AS award
    WHERE award->>'awardYear' IS NOT NULL
    UNION
    SELECT DISTINCT (award->>'awardYear')::INT AS "awardYear"
    FROM "Film", jsonb_array_elements("Film"."ggCategories") AS award
    WHERE award->>'awardYear' IS NOT NULL
    UNION
    SELECT DISTINCT (award->>'awardYear')::INT AS "awardYear"
    FROM "Film", jsonb_array_elements("Film"."cannesCategories") AS award
    WHERE award->>'awardYear' IS NOT NULL
    ORDER BY "awardYear" ASC
  `;

  setPublicCache(res, 3600);
  res.json({ awardYears: rows.map(r => r.awardYear) });
});

filmsRouter.get("/categories", async (_req, res) => {
  const rows = await prisma.$queryRaw<{ category: string }[]>`
    SELECT DISTINCT award->>'category' AS category
    FROM "Film", jsonb_array_elements("Film"."oscarCategories") AS award
    WHERE award->>'category' IS NOT NULL
    UNION
    SELECT DISTINCT award->>'category' AS category
    FROM "Film", jsonb_array_elements("Film"."ggCategories") AS award
    WHERE award->>'category' IS NOT NULL
    UNION
    SELECT DISTINCT award->>'category' AS category
    FROM "Film", jsonb_array_elements("Film"."cannesCategories") AS award
    WHERE award->>'category' IS NOT NULL
    ORDER BY category ASC
  `;

  setPublicCache(res, 3600);
  res.json({ categories: rows.map(r => r.category) });
});

filmsRouter.get("/", validate(listQuerySchema), async (req, res) => {
  const query = getValidated<ListQuery>(req, "query");
  const whereSql = buildWhereClause(query);
  const offset = (query.page - 1) * query.limit;

  const [films, countRows] = await Promise.all([
    prisma.$queryRaw`
      SELECT ${filmListSelect}
      FROM "Film"
      ${whereSql}
      ORDER BY "Film"."year" DESC, "Film"."title" ASC
      LIMIT ${query.limit}
      OFFSET ${offset}
    `,
    prisma.$queryRaw<{ count: bigint }[]>`
      SELECT COUNT(*)::BIGINT AS count
      FROM "Film"
      ${whereSql}
    `,
  ]);

  const total = Number(countRows[0]?.count ?? 0);

  setPublicCache(res, 300);
  res.json({
    films,
    total,
    page: query.page,
    totalPages: Math.ceil(total / query.limit),
  });
});

filmsRouter.get("/:slug", validate(slugParamsSchema, "params"), async (req, res) => {
  const { slug } = getValidated<z.infer<typeof slugParamsSchema>>(req, "params");
  const film = await prisma.film.findUnique({
    where: { slug },
    select: filmDetailSelect,
  });

  if (!film) {
    throw new HttpError(404, "Film not found", "FILM_NOT_FOUND");
  }

  setPublicCache(res, 86_400);
  res.json({ ...film, year: film.releaseYear });
});
