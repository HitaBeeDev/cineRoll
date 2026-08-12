import { z } from "zod";

import { listQueryBaseSchema, withYearRange } from "./listQuerySchema";
import { excludedFilmIdsParam } from "./queryParams/excludedFilmIdsParam";
import { laneBanditFeedbackParam } from "./queryParams/laneBanditFeedbackParam";
import { laneBanditParam } from "./queryParams/laneBanditParam";
import { parentDrawParam } from "./queryParams/parentDrawParam";
import { queryFlagSchema } from "./queryParams/queryFlagSchema";
import { rerollPenaltyParam } from "./queryParams/rerollPenaltyParam";

export const randomQueryBaseSchema = listQueryBaseSchema.extend({
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
  // Where this draw sits in the roll session, and what became of the draw before
  // it. Neither steers selection — they are what turns the roll event log into a
  // measurable chain (see parentDrawParam). `drawIndex` counts from 0 at the
  // first draw of a session and is capped well above any real session.
  parentDraw: parentDrawParam,
  drawIndex: z.coerce.number().int().min(0).max(10_000).optional(),
  // When present, selection is deterministic: the same seed + filters always
  // resolves to the same film. Used by daily picks so everyone sees the same
  // curated set for a given day, rolling over when the seed (a date key)
  // changes — instead of a fresh random roll per visitor.
  seed: z.string().trim().min(1).max(80).optional(),
});

export const randomQuerySchema = withYearRange(randomQueryBaseSchema);

export type RandomQuery = z.infer<typeof randomQuerySchema>;
