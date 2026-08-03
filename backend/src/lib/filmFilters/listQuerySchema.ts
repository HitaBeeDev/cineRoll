import { z } from "zod";

import { awardBodiesParam } from "./queryParams/awardBodiesParam";
import { createCsvParamSchema } from "./queryParams/createCsvParamSchema";
import { queryBooleanSchema } from "./queryParams/queryBooleanSchema";
import {
  awardYearRangeError,
  type AwardYearRangeQuery,
  foldAwardYear,
  foldLegacyYearRange,
  type LegacyYearRangeQuery,
  validAwardYearRange,
  validYearRange,
  yearRangeError,
} from "./queryRefinements";

const yearBoundSchema = z.coerce.number().int().min(1800).max(2200).optional();

export const listQueryBaseSchema = z.object({
  search: z.string().trim().min(1).max(120).optional(),
  person: z.string().trim().min(1).max(120).optional(),
  director: z.string().trim().min(1).max(120).optional(),
  femaleDirectorOnly: queryBooleanSchema.optional(),
  awardBody: awardBodiesParam,
  contentType: createCsvParamSchema(60),
  language: createCsvParamSchema(10),
  genre: createCsvParamSchema(80),
  // AND-semantics genre filter: the film must carry EVERY listed genre
  // ("romantic musical drama" → Romance ∧ Music ∧ Drama). `genre` stays OR.
  genreAll: createCsvParamSchema(80),
  country: createCsvParamSchema(80),
  // Inclusive runtime bounds, in minutes. A film with no recorded runtime is out
  // of the set the moment either bound is set — an unknown length cannot satisfy
  // a length constraint.
  runtimeMin: z.coerce.number().int().min(1).max(1000).optional(),
  runtimeMax: z.coerce.number().int().min(1).max(1000).optional(),
  // Inclusive release-year bounds. `decadeMin`/`decadeMax` are the pre-rename
  // names for the same two comparisons, accepted so older links keep resolving
  // and folded away before anything reads the query (see foldLegacyYearRange).
  yearMin: yearBoundSchema,
  yearMax: yearBoundSchema,
  decadeMin: yearBoundSchema,
  decadeMax: yearBoundSchema,
  nominationCount: z.coerce.number().int().min(0).max(1000).optional(),
  // How many of the four ceremonies recognised the film at all (nominated or
  // won). Not a count of anything stored — it is derived from the four
  // nomination counts, so its ceiling is the number of bodies in the catalogue.
  ceremonyCount: z.coerce.number().int().min(1).max(4).optional(),
  // Inclusive ceremony-year bounds. `awardYear` is the single-year form other
  // surfaces still speak (see foldAwardYear); it is folded into these before
  // anything reads the query.
  awardYear: yearBoundSchema,
  awardYearMin: yearBoundSchema,
  awardYearMax: yearBoundSchema,
  imdbRatingMin: z.coerce.number().min(0).max(10).optional(),
  imdbRatingMax: z.coerce.number().min(0).max(10).optional(),
  rtScoreMin: z.coerce.number().int().min(0).max(100).optional(),
  category: createCsvParamSchema(120),
  winnerOnly: queryBooleanSchema.optional(),
  nominatedOnly: queryBooleanSchema.optional(),
  certificate: z.string().trim().min(1).max(20).optional(),
  imdbTopMoviesOnly: queryBooleanSchema.optional(),
  imdbTopTvOnly: queryBooleanSchema.optional(),
  // Obscurity filters (hidden gems): exclude the IMDb Top 250, and cap total
  // major award wins. Mirror of imdbTopMoviesOnly / nominationCount.
  imdbTopExclude: queryBooleanSchema.optional(),
  winsMin: z.coerce.number().int().min(0).max(1000).optional(),
  winsMax: z.coerce.number().int().min(0).max(1000).optional(),
  tvType: z.string().trim().min(1).max(60).optional(),
  sort: z.enum(["newest", "title", "rating", "rt", "awards"]).default("newest"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
  sample: z.enum(["onboarding"]).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(12),
});

/**
 * Seal a query schema's year bounds — release years and ceremony years alike:
 * fold the alternate names in, THEN validate each range. Checking first would
 * wave through `decadeMin=2000&decadeMax=1990`.
 *
 * Applied at the leaves rather than inside the base schema, because a transform
 * returns a pipe and pipes can't be `.extend()`ed — random and marathon both
 * build on the base object and seal it themselves.
 */
export const withYearRange = <O extends LegacyYearRangeQuery & AwardYearRangeQuery>(
  schema: z.ZodType<O>,
) =>
  schema
    .transform(foldLegacyYearRange)
    .refine(validYearRange, yearRangeError)
    .transform(foldAwardYear)
    .refine(validAwardYearRange, awardYearRangeError);

export const listQuerySchema = withYearRange(listQueryBaseSchema);

export type ListQuery = z.infer<typeof listQuerySchema>;
