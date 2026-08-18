import { Router } from "express";

import { getUserId } from "./helpers";
import { deleteAccount } from "./accountService";
import { assertWithinExportRateLimit } from "./exportRateLimit";
import { buildAccountExport } from "./exportService";

export const accountRouter = Router();

accountRouter.get("/account/export", async (req, res) => {
  const userId = getUserId(req);
  assertWithinExportRateLimit(userId);
  res.json(await buildAccountExport(userId));
});

accountRouter.delete("/account", async (req, res) => {
  await deleteAccount(getUserId(req));
  res.status(204).end();
});
