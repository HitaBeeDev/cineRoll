import { Router } from "express";

import { getUserId } from "./request";
import { deleteAccount } from "./accountService";

export const accountRouter = Router();

accountRouter.delete("/account", async (req, res) => {
  await deleteAccount(getUserId(req));
  res.status(204).end();
});
