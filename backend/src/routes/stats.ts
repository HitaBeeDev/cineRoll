import { Router } from "express";

import { setPublicCache } from "../lib/cache";
import { getStats } from "./statsRoute/service";

export const statsRouter = Router();

statsRouter.get("/", async (_req, res) => {
  setPublicCache(res, 86_400);
  res.json(await getStats());
});
