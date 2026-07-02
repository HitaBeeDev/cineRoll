import { z } from "zod";

import { listQueryBaseSchema } from "./listQuerySchema";
import {
  excludedFilmIdsParam,
  laneBanditFeedbackParam,
  laneBanditParam,
  queryFlagSchema,
  rerollPenaltyParam,
} from "./queryParamSchemas";
import { decadeRangeError, validDecadeRange } from "./queryRefinements";

export const randomQuerySchema = listQueryBaseSchema.extend({
  userId: z.string().trim().min(1).max(180).optional(),
  personalized: queryFlagSchema.optional(),
  excludeIds: excludedFilmIdsParam,
  // Reroll-learning signals: accumulated genre / content-type penalties from
  // titles the user skipped this session (see §6). Weak-negative, decaying.
  rerollGenre: rerollPenaltyParam,
  rerollType: rerollPenaltyParam,
  // Lane-bandit posteriors, learned client-side (§6b). When present the base
  // roll draws its lane by Thompson sampling over these instead of the fixed
  // 70/20/10 split; when absent it falls back to the cold-start priors. Used for
  // guests; for signed-in users the DB-stored posteriors take precedence.
  bandit: laneBanditParam,
  // Engagement reward for the previous roll's lane (§6b) — signed-in users only,
  // folded into their stored posteriors before the next lane is drawn.
  banditFeedback: laneBanditFeedbackParam,
  // When present, selection is deterministic: the same seed + filters always
  // resolves to the same film. Used by daily picks so everyone sees the same
  // curated set for a given day, rolling over when the seed (a date key)
  // changes — instead of a fresh random roll per visitor.
  seed: z.string().trim().min(1).max(80).optional(),
}).refine(validDecadeRange, decadeRangeError);

export type RandomQuery = z.infer<typeof randomQuerySchema>;
