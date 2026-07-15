import { z } from "zod";

// The result request carries the film ids the user picked, one per question.
// Bounded to a sane range so a malformed or malicious payload can't ask us to
// look up thousands of ids.
export const resultBodySchema = z.object({
  choiceFilmIds: z.array(z.string().min(1)).min(1).max(20),
});

export type ResultBody = z.infer<typeof resultBodySchema>;
