import { z } from "zod";

import { listQueryBaseSchema } from "./listQuerySchema";
import {
  excludedFilmIdsParam,
  queryFlagSchema,
} from "./queryParamSchemas";
import { decadeRangeError, validDecadeRange } from "./queryRefinements";

export const randomQuerySchema = listQueryBaseSchema.extend({
  userId: z.string().trim().min(1).max(180).optional(),
  personalized: queryFlagSchema.optional(),
  excludeIds: excludedFilmIdsParam,
  // When present, selection is deterministic: the same seed + filters always
  // resolves to the same film. Used by daily picks so everyone sees the same
  // curated set for a given day, rolling over when the seed (a date key)
  // changes — instead of a fresh random roll per visitor.
  seed: z.string().trim().min(1).max(80).optional(),
}).refine(validDecadeRange, decadeRangeError);

export type RandomQuery = z.infer<typeof randomQuerySchema>;
