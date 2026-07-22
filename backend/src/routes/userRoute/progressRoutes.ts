import { Router } from "express";

import { getUserId } from "./helpers";
import { getUserProgress } from "./progressRepository";

export const progressRouter = Router();

progressRouter.get("/progress", async (req, res) => {
  res.json(await getUserProgress(getUserId(req)));
});
