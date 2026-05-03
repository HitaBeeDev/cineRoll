import { Prisma } from "@prisma/client";
import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { HttpError } from "../middleware/errorHandler";
import { getValidated, validate } from "../middleware/validate";

export const filmsRouter = Router();

const listQuerySchema = z.object({
  search: z.string().trim().min(1).max(120).optional(),
  genre: z.string().trim().min(1).max(80).optional(),
  decadeMin: z.coerce.number().int().min(1800).max(2200).optional(),
  decadeMax: z.coerce.number().int().min(1800).max(2200).optional(),
  awardYear: z.coerce.number().int().min(1800).max(2200).optional(),
  category: z.string().trim().min(1).max(120).optional(),
  winnerOnly: z.coerce.boolean().optional(),
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

const slugParamsSchema = z.object({
  slug: z.string().trim().min(1).max(180),
});

function awardFilter(query: z.infer<typeof listQuerySchema>) {
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

  if (awardConditions.length === 0) {
    return undefined;
  }

  const joined = Prisma.join(awardConditions, " AND ");

  return Prisma.sql`
    (
      EXISTS (
        SELECT 1
        FROM jsonb_array_elements("Film"."oscarCategories") AS award
        WHERE ${joined}
      )
      OR EXISTS (
        SELECT 1
        FROM jsonb_array_elements("Film"."ggCategories") AS award
        WHERE ${joined}
      )
    )
  `;
}

filmsRouter.get("/", validate(listQuerySchema), async (req, res) => {
  const query = getValidated<z.infer<typeof listQuerySchema>>(req, "query");
  const where: Prisma.Sql[] = [];

  if (query.search) {
    const searchLike = `%${query.search}%`;
    where.push(Prisma.sql`
      (
        "Film"."title" ILIKE ${searchLike}
        OR "Film"."title" % ${query.search}
        OR EXISTS (
          SELECT 1
          FROM jsonb_array_elements("Film"."oscarCategories") AS award
          WHERE award->>'nominee' ILIKE ${searchLike}
        )
        OR EXISTS (
          SELECT 1
          FROM jsonb_array_elements("Film"."ggCategories") AS award
          WHERE award->>'nominee' ILIKE ${searchLike}
        )
      )
    `);
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
      SELECT *
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

  res.json({
    films,
    total,
    page: query.page,
    totalPages: Math.ceil(total / query.limit),
  });
});

filmsRouter.get("/:slug", validate(slugParamsSchema, "params"), async (req, res) => {
  const { slug } = getValidated<z.infer<typeof slugParamsSchema>>(req, "params");
  const film = await prisma.film.findUnique({ where: { slug } });

  if (!film) {
    throw new HttpError(404, "Film not found", "FILM_NOT_FOUND");
  }

  res.json(film);
});
