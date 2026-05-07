import { Prisma } from "@prisma/client";
import { z } from "zod";

const queryBooleanSchema = z.preprocess(value => {
  if (typeof value === "string") {
    if (value.toLowerCase() === "true") return true;
    if (value.toLowerCase() === "false") return false;
  }
  return value;
}, z.boolean());

const listQueryBaseSchema = z.object({
  search: z.string().trim().min(1).max(120).optional(),
  person: z.string().trim().min(1).max(120).optional(),
  director: z.string().trim().min(1).max(120).optional(),
  awardBody: z.enum(["oscar", "goldenglobe", "cannes", "all"]).default("all"),
  contentType: z.string().trim().min(1).max(60).optional(),
  genre: z.string().trim().min(1).max(80).optional(),
  decadeMin: z.coerce.number().int().min(1800).max(2200).optional(),
  decadeMax: z.coerce.number().int().min(1800).max(2200).optional(),
  awardYear: z.coerce.number().int().min(1800).max(2200).optional(),
  imdbRatingMin: z.coerce.number().min(0).max(10).optional(),
  rtScoreMin: z.coerce.number().int().min(0).max(100).optional(),
  category: z.string().trim().min(1).max(120).optional(),
  winnerOnly: queryBooleanSchema.optional(),
  nominatedOnly: queryBooleanSchema.optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(12),
});

export const listQuerySchema = listQueryBaseSchema.refine(
  query =>
    query.decadeMin === undefined ||
    query.decadeMax === undefined ||
    query.decadeMin <= query.decadeMax,
  {
    message: "decadeMin must be less than or equal to decadeMax",
    path: ["decadeMin"],
  },
);

export const randomQuerySchema = listQueryBaseSchema.extend({
  userId: z.string().trim().min(1).max(180).optional(),
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

export type ListQuery = z.infer<typeof listQuerySchema>;
export type RandomQuery = z.infer<typeof randomQuerySchema>;

export function awardJsonSources(awardBody: ListQuery["awardBody"]) {
  if (awardBody === "oscar") {
    return [Prisma.sql`"Film"."oscarCategories"`];
  }
  if (awardBody === "goldenglobe") {
    return [Prisma.sql`"Film"."ggCategories"`];
  }
  if (awardBody === "cannes") {
    return [Prisma.sql`"Film"."cannesCategories"`];
  }
  return [
    Prisma.sql`"Film"."oscarCategories"`,
    Prisma.sql`"Film"."ggCategories"`,
    Prisma.sql`"Film"."cannesCategories"`,
  ];
}

export function awardExists(
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
    query.awardBody === "all" &&
    query.nominatedOnly !== true &&
    awardConditions.length === 0
  ) {
    return undefined;
  }

  return awardExists(query.awardBody, awardConditions);
}

export function buildWhereClause(
  query: ListQuery,
  additionalConditions: Prisma.Sql[] = [],
): Prisma.Sql {
  const where: Prisma.Sql[] = [...additionalConditions];

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
    where.push(Prisma.sql`
      (
        "Film"."director" ILIKE ${personLike}
        OR EXISTS (
          SELECT 1
          FROM jsonb_array_elements_text("Film"."cast") AS "castName"
          WHERE "castName" ILIKE ${personLike}
        )
        OR ${awardExists(query.awardBody, [
          Prisma.sql`(
            award->>'nominee' ILIKE ${personLike}
            OR award->>'winner' ILIKE ${personLike}
          )`,
        ])}
      )
    `);
  }

  if (query.director) {
    where.push(Prisma.sql`"Film"."director" ILIKE ${`%${query.director}%`}`);
  }

  if (query.contentType) {
    where.push(Prisma.sql`"Film"."contentType" = ${query.contentType}`);
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

  if (query.imdbRatingMin !== undefined) {
    where.push(Prisma.sql`"Film"."imdbRating" IS NOT NULL`);
    where.push(Prisma.sql`"Film"."imdbRating" >= ${query.imdbRatingMin}`);
  }

  if (query.rtScoreMin !== undefined) {
    where.push(Prisma.sql`"Film"."rtScore" IS NOT NULL`);
    where.push(Prisma.sql`"Film"."rtScore" >= ${query.rtScoreMin}`);
  }

  const awards = awardFilter(query);
  if (awards) {
    where.push(awards);
  }

  return where.length > 0
    ? Prisma.sql`WHERE ${Prisma.join(where, " AND ")}`
    : Prisma.empty;
}
