import { z } from "zod";

export const blindRollQuerySchema = z.object({
  difficulty: z.enum(["easy", "medium", "hard"]).default("medium"),
  // Optional target slug — lets a shared/challenge link fix the answer while the
  // decoys are still chosen for the requested difficulty.
  film: z.string().trim().min(1).optional(),
});

export type BlindRollQuery = z.infer<typeof blindRollQuerySchema>;
