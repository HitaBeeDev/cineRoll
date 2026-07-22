import { z } from "zod";

import { parseJsonQueryValue } from "./parseJsonQueryValue";

const betaArmSchema = z.object({
  alpha: z.number().gt(0).max(1000),
  beta: z.number().gt(0).max(1000),
});

const laneBanditSchema = z.object({
  safe: betaArmSchema,
  gem: betaArmSchema,
  wild: betaArmSchema,
});

export const laneBanditParam = z
  .preprocess(parseJsonQueryValue, laneBanditSchema)
  .optional();
