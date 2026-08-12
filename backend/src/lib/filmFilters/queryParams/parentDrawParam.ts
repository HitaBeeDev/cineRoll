import { z } from "zod";

import { parseJsonQueryValue } from "./parseJsonQueryValue";

/**
 * What became of the draw this one follows.
 *
 * `engaged` — the user acted on it: opened details, saved it, marked it seen.
 * `rejected` — the user pushed it away ("not interested").
 * `passed`   — neither. They rolled on without touching it.
 *
 * The three are already what the client's reroll learning distinguishes (a
 * strong penalty, a weak one, or none); naming them on the draw is what makes
 * the same distinction readable back out of the event log.
 */
export const rollOutcomeSchema = z.enum(["engaged", "rejected", "passed"]);

export type RollOutcome = z.infer<typeof rollOutcomeSchema>;

const parentDrawSchema = z.object({
  drawId: z.string().trim().min(1).max(60),
  outcome: rollOutcomeSchema,
});

/**
 * The draw that came immediately before this one, and how it ended.
 *
 * Purely observational: nothing in selection reads it. It exists so the roll
 * event log is a chain rather than a pile — with a parent on each link, "how
 * many draws before one landed", "which lane gets rolled past", and "does the
 * third draw do better than the first" are all one query, and without it none
 * of them are answerable at all.
 */
export const parentDrawParam = z
  .preprocess(parseJsonQueryValue, parentDrawSchema)
  .optional();
