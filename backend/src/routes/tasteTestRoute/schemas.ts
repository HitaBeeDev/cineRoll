import { z } from "zod";

// The result request carries, per answered question, the film the user chose and
// the film they rejected — so the model can read each pick as a vote on the axis
// that actually separated the pair. Bounded so a malformed payload can't ask us
// to look up an unbounded number of ids.
export const resultBodySchema = z.object({
  comparisons: z
    .array(
      z.object({
        chosenId: z.string().min(1),
        otherId: z.string().min(1),
      }),
    )
    .min(1)
    .max(20),
});

export type ResultBody = z.infer<typeof resultBodySchema>;
