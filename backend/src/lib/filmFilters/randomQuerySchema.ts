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
}).refine(validDecadeRange, decadeRangeError);

export type RandomQuery = z.infer<typeof randomQuerySchema>;
