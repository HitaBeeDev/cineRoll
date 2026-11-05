import { Router } from "express";

import { config } from "../config";
import { HttpError } from "../middleware/errorHandler";
import { fetchWatchRegions } from "../lib/watchRefresh/fetchWatchRegions";
import { refreshWatchProviders } from "../lib/watchRefresh/refreshWatchProviders";
import { countRefreshable, findDue, saveWatchProviders } from "../lib/watchRefresh/watchRefreshRepository";
import { requireCronSecret } from "./jobsRoute/requireCronSecret";

export const jobsRouter = Router();

jobsRouter.use(requireCronSecret);

// Daily (vercel.json "crons"): each run re-checks the stalest seventh of the
// catalogue, so every film is refreshed weekly. TMDB allows ~50 req/s; six at a
// time stays far under it. The time budget sits well inside the function limit.
jobsRouter.get("/watch-providers", async (_req, res) => {
  if (!config.tmdbApiKey) {
    throw new HttpError(503, "TMDB_API_KEY is not set", "TMDB_DISABLED");
  }
  res.setHeader("Cache-Control", "no-store");

  const report = await refreshWatchProviders(
    {
      findDue,
      countRefreshable,
      fetchRegions: fetchWatchRegions,
      save: saveWatchProviders,
      now: () => new Date(),
    },
    { cycleRuns: 7, budgetMs: 50_000, concurrency: 6 },
  );

  console.log("Watch providers refreshed:", JSON.stringify(report));
  res.json(report);
});
