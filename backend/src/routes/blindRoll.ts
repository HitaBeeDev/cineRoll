import { Router } from "express";

import { getValidated, validate } from "../middleware/validate";
import { BlindRollQuery, blindRollQuerySchema } from "./blindRollRoute/schemas";
import { getBlindRound } from "./blindRollRoute/service";

export const blindRollRouter = Router();

// One puzzle round: a hidden target film plus difficulty-tuned decoys. The
// target is random per request, so the response must never be cached.
blindRollRouter.get("/", validate(blindRollQuerySchema), async (req, res) => {
  const query = getValidated<BlindRollQuery>(req, "query");
  const round = await getBlindRound(query);

  if (!round) {
    res.status(404).json({ error: "No blind roll film found" });
    return;
  }

  res.setHeader("Cache-Control", "no-store");
  res.json(round);
});
