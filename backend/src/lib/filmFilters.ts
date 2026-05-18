import { Prisma } from "@prisma/client";
import { z } from "zod";

const queryBooleanSchema = z.preprocess(value => {
  if (typeof value === "string") {
    if (value.toLowerCase() === "true") return true;
    if (value.toLowerCase() === "false") return false;
  }
  return value;
}, z.boolean());

const FEMALE_DIRECTORS = [
  "Agnès Varda",
  "Alice Rohrwacher",
  "Andrea Arnold",
  "Ava DuVernay",
  "Barbra Streisand",
  "Céline Sciamma",
  "Chloé Zhao",
  "Claire Denis",
  "Dee Rees",
  "Emerald Fennell",
  "Greta Gerwig",
  "Jane Campion",
  "Justine Triet",
  "Kathryn Bigelow",
  "Kelly Reichardt",
  "Lina Wertmüller",
  "Lucrecia Martel",
  "Mira Nair",
  "Nancy Meyers",
  "Nora Ephron",
  "Patty Jenkins",
  "Penny Marshall",
  "Sarah Polley",
  "Sofia Coppola",
  "Susanne Bier",
];

const listQueryBaseSchema = z.object({
  search: z.string().trim().min(1).max(120).optional(),
  person: z.string().trim().min(1).max(120).optional(),
  director: z.string().trim().min(1).max(120).optional(),
  femaleDirectorOnly: queryBooleanSchema.optional(),
  awardBody: z.enum(["oscar", "goldenglobe", "cannes", "all"]).default("all"),
  contentType: z.string().trim().min(1).max(60).optional(),
  language: z.string().trim().min(1).max(10).optional(),
  genre: z.string().trim().min(1).max(80).optional(),
  runtimeMax: z.coerce.number().int().min(1).max(1000).optional(),
  decadeMin: z.coerce.number().int().min(1800).max(2200).optional(),
  decadeMax: z.coerce.number().int().min(1800).max(2200).optional(),
  nominationCount: z.coerce.number().int().min(0).max(1000).optional(),
  awardYear: z.coerce.number().int().min(1800).max(2200).optional(),
  imdbRatingMin: z.coerce.number().min(0).max(10).optional(),
  imdbRatingMax: z.coerce.number().min(0).max(10).optional(),
  rtScoreMin: z.coerce.number().int().min(0).max(100).optional(),
  category: z.string().trim().min(1).max(120).optional(),
  winnerOnly: queryBooleanSchema.optional(),
  nominatedOnly: queryBooleanSchema.optional(),
  certificate: z.string().trim().min(1).max(20).optional(),
  imdbTopMoviesOnly: queryBooleanSchema.optional(),
  imdbTopTvOnly: queryBooleanSchema.optional(),
  tvType: z.string().trim().min(1).max(60).optional(),
  sort: z.enum(["newest", "title", "rating", "awards"]).default("newest"),
  sample: z.enum(["onboarding"]).optional(),
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
          FROM jsonb_array_elements("Film"."cast") AS "castMember"
          WHERE "castMember"->>'name' ILIKE ${personLike}
        )
        OR ${awardExists(query.awardBody, [
          Prisma.sql`(
            award->>'nominee' ILIKE ${personLike}
          )`,
        ])}
      )
    `);
  }

  if (query.director) {
    where.push(Prisma.sql`"Film"."director" ILIKE ${`%${query.director}%`}`);
  }

  if (query.femaleDirectorOnly === true) {
    where.push(Prisma.sql`(
      ${Prisma.join(
        FEMALE_DIRECTORS.map(name => Prisma.sql`"Film"."director" ILIKE ${`%${name}%`}`),
        " OR ",
      )}
    )`);
  }

  if (query.contentType) {
    where.push(Prisma.sql`"Film"."contentType" = ${query.contentType}`);
  }

  if (query.language) {
    where.push(Prisma.sql`"Film"."language" = ${query.language}`);
  }

  if (query.genre) {
    where.push(Prisma.sql`"Film"."genres" @> ARRAY[${query.genre}]::TEXT[]`);
  }

  if (query.runtimeMax !== undefined) {
    where.push(Prisma.sql`"Film"."runtime" IS NOT NULL`);
    where.push(Prisma.sql`"Film"."runtime" <= ${query.runtimeMax}`);
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

  if (query.imdbRatingMax !== undefined) {
    where.push(Prisma.sql`"Film"."imdbRating" IS NOT NULL`);
    where.push(Prisma.sql`"Film"."imdbRating" <= ${query.imdbRatingMax}`);
  }

  if (query.rtScoreMin !== undefined) {
    where.push(Prisma.sql`"Film"."rtScore" IS NOT NULL`);
    where.push(Prisma.sql`"Film"."rtScore" >= ${query.rtScoreMin}`);
  }

  if (query.nominationCount !== undefined) {
    where.push(Prisma.sql`
      (
        "Film"."oscarNominations"
        + "Film"."ggNominations"
        + "Film"."cannesNominations"
      ) = ${query.nominationCount}
    `);
  }

  if (query.certificate) {
    where.push(Prisma.sql`"Film"."certificate" = ${query.certificate}`);
  }

  if (query.imdbTopMoviesOnly === true) {
    where.push(Prisma.sql`"Film"."imdbTopMovieRank" IS NOT NULL`);
  }

  if (query.imdbTopTvOnly === true) {
    where.push(Prisma.sql`"Film"."imdbTopTvRank" IS NOT NULL`);
  }

  if (query.tvType) {
    where.push(Prisma.sql`"Film"."tvType" ILIKE ${`%${query.tvType}%`}`);
  }

  const awards = awardFilter(query);
  if (awards) {
    where.push(awards);
  }

  return where.length > 0
    ? Prisma.sql`WHERE ${Prisma.join(where, " AND ")}`
    : Prisma.empty;
}
