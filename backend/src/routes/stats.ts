import { Router } from "express";

import { setPublicCache } from "../lib/cache";
import { prisma } from "../lib/prisma";
import { statsPayload } from "./statsRoute/mapper";
import { getStatsRows } from "./statsRoute/repository";

export const statsRouter = Router();

statsRouter.get("/", async (_req, res) => {
  setPublicCache(res, 86_400);
  res.json(statsPayload(await getStatsRows()));
});

/** When the catalogue last changed: the newest film update. Hub pages show it. */
statsRouter.get("/updated", async (_req, res) => {
  setPublicCache(res, 86_400);
  const latest = await prisma.film.aggregate({ _max: { updatedAt: true } });
  res.json({ updatedAt: latest._max.updatedAt });
});
