import { z } from "zod";

import { MAX_RESULTS_PER_BATTLE } from "./constants";

const matchResultSchema = z.object({
  winnerId: z.string().trim().min(1),
  loserId: z.string().trim().min(1),
});

export const battleResultsBodySchema = z.object({
  results: z.array(matchResultSchema).min(1).max(MAX_RESULTS_PER_BATTLE),
  userId: z.string().trim().min(1).optional(),
});

export const leaderboardQuerySchema = z.object({
  limit: z.coerce.number().int().positive().optional(),
});

export type BattleResultsBody = z.infer<typeof battleResultsBodySchema>;
export type LeaderboardQuery = z.infer<typeof leaderboardQuerySchema>;
export type MatchResult = z.infer<typeof matchResultSchema>;
