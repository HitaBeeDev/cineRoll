import { Router } from "express";

import { getUserId } from "./helpers";
import {
  listNotifications,
  markNotificationsRead,
} from "./notificationsRepository";

export const notificationsRouter = Router();

notificationsRouter.get("/notifications", async (req, res) => {
  res.json(await listNotifications(getUserId(req)));
});

notificationsRouter.post("/notifications/read", async (req, res) => {
  await markNotificationsRead(getUserId(req));
  res.status(204).end();
});
