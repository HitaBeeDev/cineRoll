import { Prisma } from "@prisma/client";
import { z } from "zod";

const queryBooleanSchema = z.preprocess(value => {
  if (typeof value === "string") {
    if (value.toLowerCase() === "true") return true;
    if (value.toLowerCase() === "false") return false;
  }
  return value;
}, z.boolean());

// Like queryBooleanSchema but also accepts the "1"/"0" form used by the
// `?personalized=1` flag on the roll endpoint.
const queryFlagSchema = z.preprocess(value => {
  if (value === "1" || value === "true") return true;
  if (value === "0" || value === "false") return false;
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

const AWARD_BODY_VALUES = ["oscar", "goldenglobe", "cannes", "berlin"] as const;
type AwardBodyValue = (typeof AWARD_BODY_VALUES)[number];

// Multi-select facet param: a comma-separated list (`?genre=Drama,Comedy`) parsed
// into a string array. A single value parses to a 1-element array, so old
// single-value shared links and the natural-roll path keep working unchanged.
// `undefined` (param absent) short-circuits via `.optional()` before the effect runs.
const csvParam = (max: number) =>
  z
    .preprocess(
      value =>
        typeof value === "string"
          ? value.split(",").map(s => s.trim()).filter(Boolean)
          : value,
      z.array(z.string().min(1).max(max)),
    )
    .optional();

// Award bodies are a fixed enum; unknown tokens (and the legacy "all" sentinel)
// are dropped rather than rejected, mirroring the old default-to-all behavior.
const awardBodiesParam = z
  .preprocess(
    value =>
      typeof value === "string"
        ? value
            .split(",")
            .map(s => s.trim().toLowerCase())
            .filter((s): s is AwardBodyValue => (AWARD_BODY_VALUES as readonly string[]).includes(s))
        : value,
    z.array(z.enum(AWARD_BODY_VALUES)),
  )
  .optional();

const listQueryBaseSchema = z.object({
  search: z.string().trim().min(1).max(120).optional(),
  person: z.string().trim().min(1).max(120).optional(),
  director: z.string().trim().min(1).max(120).optional(),
  femaleDirectorOnly: queryBooleanSchema.optional(),
  awardBody: awardBodiesParam,
  contentType: csvParam(60),
  language: csvParam(10),
  genre: csvParam(80),
  country: csvParam(80),
  runtimeMax: z.coerce.number().int().min(1).max(1000).optional(),
  decadeMin: z.coerce.number().int().min(1800).max(2200).optional(),
  decadeMax: z.coerce.number().int().min(1800).max(2200).optional(),
  nominationCount: z.coerce.number().int().min(0).max(1000).optional(),
  awardYear: z.coerce.number().int().min(1800).max(2200).optional(),
  imdbRatingMin: z.coerce.number().min(0).max(10).optional(),
  imdbRatingMax: z.coerce.number().min(0).max(10).optional(),
  rtScoreMin: z.coerce.number().int().min(0).max(100).optional(),
  category: csvParam(120),
  winnerOnly: queryBooleanSchema.optional(),
  nominatedOnly: queryBooleanSchema.optional(),
  certificate: z.string().trim().min(1).max(20).optional(),
  imdbTopMoviesOnly: queryBooleanSchema.optional(),
  imdbTopTvOnly: queryBooleanSchema.optional(),
  tvType: z.string().trim().min(1).max(60).optional(),
  sort: z.enum(["newest", "title", "rating", "rt", "awards"]).default("newest"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
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
  // Opt-in taste-weighted roll (signed-in only). Ignored without a userId.
  personalized: queryFlagSchema.optional(),
  // Client-supplied film IDs to exclude from the roll — e.g. a guest's
  // session-hidden films. Comma-separated; capped so the IN-list stays bounded.
  // `.optional()` sits outside the preprocess (like `personalized` above) so a
  // missing key short-circuits to undefined instead of running the effect.
  excludeIds: z
    .preprocess(
      value =>
        typeof value === "string"
          ? value.split(",").map(id => id.trim()).filter(Boolean)
          : value,
      z.array(z.string().min(1).max(180)).max(100),
    )
    .optional(),
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

// The JSON columns to search for an award match. With no bodies selected (empty
// or undefined) every corpus is searched; otherwise only the chosen ones are,
// unioned with OR by the caller.
export function awardJsonSources(awardBodies: ListQuery["awardBody"]) {
  const byBody: Record<AwardBodyValue, Prisma.Sql> = {
    oscar: Prisma.sql`"Film"."oscarCategories"`,
    goldenglobe: Prisma.sql`"Film"."ggCategories"`,
    cannes: Prisma.sql`"Film"."cannesCategories"`,
    berlin: Prisma.sql`"Film"."berlinCategories"`,
  };
  if (!awardBodies || awardBodies.length === 0) {
    return Object.values(byBody);
  }
  return awardBodies.map(body => byBody[body]);
}

export function awardExists(
  awardBodies: ListQuery["awardBody"],
  awardConditions: Prisma.Sql[] = [],
) {
  const whereSql =
    awardConditions.length > 0
      ? Prisma.sql`WHERE ${Prisma.join(awardConditions, " AND ")}`
      : Prisma.empty;

  const existsClauses = awardJsonSources(awardBodies).map(source => Prisma.sql`
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

  if (query.category && query.category.length > 0) {
    // Multiple categories are OR'd: an award matching any selected category counts.
    const categoryMatches = query.category.map(
      cat => Prisma.sql`award->>'category' ILIKE ${`%${cat}%`}`,
    );
    awardConditions.push(Prisma.sql`(${Prisma.join(categoryMatches, " OR ")})`);
  }

  if (query.winnerOnly === true) {
    awardConditions.push(Prisma.sql`(award->>'won')::BOOLEAN = true`);
  }

  const noBodies = !query.awardBody || query.awardBody.length === 0;
  if (noBodies && query.nominatedOnly !== true && awardConditions.length === 0) {
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

  if (query.contentType && query.contentType.length > 0) {
    where.push(Prisma.sql`"Film"."contentType" = ANY(ARRAY[${Prisma.join(query.contentType)}])`);
  }

  if (query.language && query.language.length > 0) {
    where.push(Prisma.sql`"Film"."language" = ANY(ARRAY[${Prisma.join(query.language)}])`);
  }

  // Array-overlap (`&&`): the film qualifies if it has any of the selected
  // countries/genres — OR within the facet (was single-element containment `@>`).
  if (query.country && query.country.length > 0) {
    where.push(Prisma.sql`"Film"."countries" && ARRAY[${Prisma.join(query.country)}]::TEXT[]`);
  }

  if (query.genre && query.genre.length > 0) {
    where.push(Prisma.sql`"Film"."genres" && ARRAY[${Prisma.join(query.genre)}]::TEXT[]`);
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
    // Treated as a minimum ("at least N total nominations") — the natural,
    // useful reading for a filter, vs. an exact match that almost never hits.
    where.push(Prisma.sql`
      (
        "Film"."oscarNominations"
        + "Film"."ggNominations"
        + "Film"."cannesNominations"
        + "Film"."berlinNominations"
      ) >= ${query.nominationCount}
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
