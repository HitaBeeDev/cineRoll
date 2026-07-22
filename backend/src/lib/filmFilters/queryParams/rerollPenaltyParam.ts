import { z } from "zod";

import { parseJsonQueryValue } from "./parseJsonQueryValue";

const MAX_PENALTY_KEYS = 40;

const rerollPenaltySchema = z
  .record(z.string().min(1).max(80), z.number().min(0).max(20))
  .refine(record => Object.keys(record).length <= MAX_PENALTY_KEYS, "too many penalty keys");

export const rerollPenaltyParam = z
  .preprocess(parseJsonQueryValue, rerollPenaltySchema)
  .optional();
