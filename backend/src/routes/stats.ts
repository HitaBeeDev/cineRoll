import { Router } from "express";

import { setPublicCache } from "../lib/cache";
import { statsPayload } from "./statsRoute/mapper";
import { getStatsRows } from "./statsRoute/repository";

export const statsRouter = Router();

statsRouter.get("/", async (_req, res) => {
  setPublicCache(res, 86_400);
  res.json(statsPayload(await getStatsRows()));
});
