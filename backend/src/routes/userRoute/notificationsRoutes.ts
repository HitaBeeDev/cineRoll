import { Router } from "express";

import { getValidated, validate } from "../../middleware/validate";
import { getUserId } from "./helpers";
import {
  getNotificationFilms,
  listNotifications,
  markNotificationsRead,
} from "./notificationsRepository";
import { NotificationIdParams, notificationIdParamsSchema } from "./schemas";

export const notificationsRouter = Router();

notificationsRouter.get("/notifications", async (req, res) => {
  res.json(await listNotifications(getUserId(req)));
});

notificationsRouter.post("/notifications/read", async (req, res) => {
  await markNotificationsRead(getUserId(req));
  res.status(204).end();
});

notificationsRouter.get(
  "/notifications/:notificationId",
  validate(notificationIdParamsSchema, "params"),
  async (req, res) => {
    const { notificationId } = getValidated<NotificationIdParams>(req, "params");
    const result = await getNotificationFilms(notificationId);

    if (!result) {
      res.status(404).json({ error: "Not found", code: "NOT_FOUND" });
      return;
    }

    res.json(result);
  },
);
