import { z } from "zod";

import { parseJsonQueryValue } from "./parseJsonQueryValue";

const laneBanditFeedbackSchema = z.object({
  lane: z.enum(["safe", "gem", "wild"]),
  reward: z.number().min(0).max(1),
});

export const laneBanditFeedbackParam = z
  .preprocess(parseJsonQueryValue, laneBanditFeedbackSchema)
  .optional();
