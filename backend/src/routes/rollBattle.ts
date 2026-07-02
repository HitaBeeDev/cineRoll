import { Router } from "express";

import { setPublicCache } from "../lib/cache";
import { getValidated, validate } from "../middleware/validate";
import {
  LEADERBOARD_DEFAULT_LIMIT,
  LEADERBOARD_MAX_LIMIT,
} from "./rollBattleRoute/constants";
import { applyBattleResults, getLeaderboard } from "./rollBattleRoute/repository";
import {
  BattleResultsBody,
  battleResultsBodySchema,
  LeaderboardQuery,
  leaderboardQuerySchema,
} from "./rollBattleRoute/schemas";

export const rollBattleRouter = Router();

// Record the pairwise outcomes of one completed bracket. Elo updates apply
// transactionally; the response reports how many valid duels were counted.
rollBattleRouter.post("/results", validate(battleResultsBodySchema, "body"), async (req, res) => {
  const { results, userId } = getValidated<BattleResultsBody>(req, "body");
  const counted = await applyBattleResults(results, userId);

  res.json({ counted });
});

// The head-to-head leaderboard, short-cached since it updates as duels come in.
rollBattleRouter.get("/leaderboard", validate(leaderboardQuerySchema), async (req, res) => {
  const { limit } = getValidated<LeaderboardQuery>(req, "query");
  const capped = Math.min(limit ?? LEADERBOARD_DEFAULT_LIMIT, LEADERBOARD_MAX_LIMIT);

  setPublicCache(res, 60);
  res.json({ films: await getLeaderboard(capped) });
});
