import { Prisma } from "@prisma/client";
import { Router } from "express";
import { z } from "zod";
import { setPublicCache } from "../lib/cache";
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

const listQuerySchema = z.object({
  search: z.string().trim().min(1).max(120).optional(),
  person: z.string().trim().min(1).max(120).optional(),
  director: z.string().trim().min(1).max(120).optional(),
  awardBody: z.enum(["oscar", "goldenglobe", "both"]).default("both"),
  genre: z.string().trim().min(1).max(80).optional(),
  decadeMin: z.coerce.number().int().min(1800).max(2200).optional(),
  decadeMax: z.coerce.number().int().min(1800).max(2200).optional(),
  awardYear: z.coerce.number().int().min(1800).max(2200).optional(),
  category: z.string().trim().min(1).max(120).optional(),
  winnerOnly: z.coerce.boolean().optional(),
  nominatedOnly: z.coerce.boolean().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(12),
}).refine(
  query =>
    query.decadeMin === undefined ||
    query.decadeMax === undefined ||
    query.decadeMin <= query.decadeMax,
  {
    message: "decadeMin must be less than or equal to decadeMax",
    path: ["decadeMin"],
  },
);

type ListQuery = z.infer<typeof listQuerySchema>;

const slugParamsSchema = z.object({
  slug: z.string().trim().min(1).max(180),
});

function awardJsonSources(awardBody: ListQuery["awardBody"]) {
  if (awardBody === "oscar") {
    return [Prisma.sql`"Film"."oscarCategories"`];
  }

  if (awardBody === "goldenglobe") {
    return [Prisma.sql`"Film"."ggCategories"`];
  }

  return [
    Prisma.sql`"Film"."oscarCategories"`,
    Prisma.sql`"Film"."ggCategories"`,
  ];
}

function awardExists(
  awardBody: ListQuery["awardBody"],
  awardConditions: Prisma.Sql[] = [],
) {
  const whereSql =
    awardConditions.length > 0
      ? Prisma.sql`WHERE ${Prisma.join(awardConditions, " AND ")}`
      : Prisma.empty;

  const existsClauses = awardJsonSources(awardBody).map(source => Prisma.sql`
    EXISTS (
      SELECT 1
      FROM jsonb_array_elements(${source}) AS award
      ${whereSql}
    )
  `);

  return Prisma.sql`(${Prisma.join(existsClauses, " OR ")})`;
}

function awardFilter(query: ListQuery) {
  const awardConditions: Prisma.Sql[] = [];

  if (query.awardYear !== undefined) {
    awardConditions.push(Prisma.sql`(award->>'awardYear')::INT = ${query.awardYear}`);
  }

  if (query.category) {
    awardConditions.push(Prisma.sql`award->>'category' ILIKE ${`%${query.category}%`}`);
  }

  if (query.winnerOnly === true) {
    awardConditions.push(Prisma.sql`(award->>'won')::BOOLEAN = true`);
  }

  if (
    query.awardBody === "both" &&
    query.nominatedOnly !== true &&
    awardConditions.length === 0
  ) {
    return undefined;
  }

  return awardExists(query.awardBody, awardConditions);
}

filmsRouter.get("/", validate(listQuerySchema), async (req, res) => {
  const query = getValidated<ListQuery>(req, "query");
  const where: Prisma.Sql[] = [];

  if (query.search) {
    const searchLike = `%${query.search}%`;
    where.push(Prisma.sql`
      (
        "Film"."title" ILIKE ${searchLike}
        OR "Film"."title" % ${query.search}
      )
    `);
  }

  if (query.person) {
    const personLike = `%${query.person}%`;
    where.push(awardExists(query.awardBody, [
      Prisma.sql`award->>'nominee' ILIKE ${personLike}`,
    ]));
  }

  if (query.director) {
    where.push(Prisma.sql`"Film"."director" ILIKE ${`%${query.director}%`}`);
  }

  if (query.genre) {
    where.push(Prisma.sql`"Film"."genres" @> ARRAY[${query.genre}]::TEXT[]`);
  }

  if (query.decadeMin !== undefined) {
    where.push(Prisma.sql`"Film"."year" >= ${query.decadeMin}`);
  }

  if (query.decadeMax !== undefined) {
    where.push(Prisma.sql`"Film"."year" <= ${query.decadeMax}`);
  }

  const awards = awardFilter(query);
  if (awards) {
    where.push(awards);
  }

  const whereSql = where.length > 0 ? Prisma.sql`WHERE ${Prisma.join(where, " AND ")}` : Prisma.empty;
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

filmsRouter.get("/award-years", async (_req, res) => {
  const rows = await prisma.$queryRaw<{ awardYear: number }[]>`
    SELECT DISTINCT (award->>'awardYear')::INT AS "awardYear"
    FROM "Film", jsonb_array_elements("Film"."oscarCategories") AS award
    WHERE award->>'awardYear' IS NOT NULL
    UNION
    SELECT DISTINCT (award->>'awardYear')::INT AS "awardYear"
    FROM "Film", jsonb_array_elements("Film"."ggCategories") AS award
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
    ORDER BY category ASC
  `;

  setPublicCache(res, 3600);
  res.json({ categories: rows.map(r => r.category) });
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
