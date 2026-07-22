import { z } from "zod";

import { awardBodiesParam } from "./queryParams/awardBodiesParam";
import { createCsvParamSchema } from "./queryParams/createCsvParamSchema";
import { queryBooleanSchema } from "./queryParams/queryBooleanSchema";
import { decadeRangeError, validDecadeRange } from "./queryRefinements";

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
  runtimeMax: z.coerce.number().int().min(1).max(1000).optional(),
  decadeMin: z.coerce.number().int().min(1800).max(2200).optional(),
  decadeMax: z.coerce.number().int().min(1800).max(2200).optional(),
  nominationCount: z.coerce.number().int().min(0).max(1000).optional(),
  awardYear: z.coerce.number().int().min(1800).max(2200).optional(),
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
  winsMax: z.coerce.number().int().min(0).max(1000).optional(),
  tvType: z.string().trim().min(1).max(60).optional(),
  sort: z.enum(["newest", "title", "rating", "rt", "awards"]).default("newest"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
  sample: z.enum(["onboarding"]).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(12),
});

export const listQuerySchema = listQueryBaseSchema.refine(validDecadeRange, decadeRangeError);

export type ListQuery = z.infer<typeof listQuerySchema>;
