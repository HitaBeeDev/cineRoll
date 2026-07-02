import { z } from "zod";

import { AWARD_BODY_VALUES, AwardBodyValue } from "./constants";

export const queryBooleanSchema = z.preprocess(value => {
  if (typeof value === "string") {
    if (value.toLowerCase() === "true") return true;
    if (value.toLowerCase() === "false") return false;
  }

  return value;
}, z.boolean());

export const queryFlagSchema = z.preprocess(value => {
  if (value === "1" || value === "true") return true;
  if (value === "0" || value === "false") return false;

  return value;
}, z.boolean());

export const csvParam = (max: number) =>
  z
    .preprocess(
      value =>
        typeof value === "string"
          ? value.split(",").map(s => s.trim()).filter(Boolean)
          : value,
      z.array(z.string().min(1).max(max)),
    )
    .optional();

export const awardBodiesParam = z
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

export const excludedFilmIdsParam = z
  .preprocess(
    value =>
      typeof value === "string"
        ? value.split(",").map(id => id.trim()).filter(Boolean)
        : value,
    z.array(z.string().min(1).max(180)).max(100),
  )
  .optional();

// Reroll-learning signal (docs/smart-roll-engine.md §6): a compact JSON map of
// genre/type → accumulated penalty weight, built and decayed client-side and
// sent per roll. Parsed leniently — a malformed value is dropped rather than
// failing the whole roll, since it's an optional adaptive nicety.
export const rerollPenaltyParam = z
  .preprocess(
    value => {
      if (typeof value !== "string") return value;
      try {
        return JSON.parse(value);
      } catch {
        return undefined;
      }
    },
    z
      .record(z.string().min(1).max(80), z.number().min(0).max(20))
      .refine(record => Object.keys(record).length <= 40, "too many penalty keys"),
  )
  .optional();

// Lane-bandit posteriors (docs/smart-roll-engine.md §6b): the Beta(α, β) state
// for the three roll lanes, learned client-side and sent per roll so Thompson
// sampling can adapt the lane split to the user. Parsed leniently — a malformed
// or out-of-range value is dropped and the roll falls back to the cold-start
// priors, exactly like an anonymous first roll.
const betaArmSchema = z.object({
  alpha: z.number().gt(0).max(1000),
  beta: z.number().gt(0).max(1000),
});

export const laneBanditParam = z
  .preprocess(
    value => {
      if (typeof value !== "string") return value;
      try {
        return JSON.parse(value);
      } catch {
        return undefined;
      }
    },
    z.object({
      safe: betaArmSchema,
      gem: betaArmSchema,
      wild: betaArmSchema,
    }),
  )
  .optional();

// Reward for the lane served on the *previous* roll (§6b): which lane, and 1 if
// the user engaged with that pick or 0 if they skipped it. For signed-in users
// the backend folds this into their stored posteriors before drawing the next
// lane. Parsed leniently — a malformed value is dropped.
export const laneBanditFeedbackParam = z
  .preprocess(
    value => {
      if (typeof value !== "string") return value;
      try {
        return JSON.parse(value);
      } catch {
        return undefined;
      }
    },
    z.object({
      lane: z.enum(["safe", "gem", "wild"]),
      reward: z.number().min(0).max(1),
    }),
  )
  .optional();
