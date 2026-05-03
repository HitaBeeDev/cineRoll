import { Router } from "express";
import { prisma } from "../lib/prisma";
import { HttpError } from "../middleware/errorHandler";

export const pickOfDayRouter = Router();

pickOfDayRouter.get("/", async (_req, res) => {
  const start = new Date();
  start.setHours(0, 0, 0, 0);

  const end = new Date(start);
  end.setDate(end.getDate() + 1);

  const film = await prisma.film.findFirst({
    where: {
      OR: [
        { pickOfDayDate: { gte: start, lt: end } },
        { isPickOfDay: true },
      ],
    },
    orderBy: [
      { pickOfDayDate: "desc" },
      { updatedAt: "desc" },
    ],
  });

  if (!film) {
    throw new HttpError(404, "No pick of the day found", "PICK_OF_DAY_NOT_FOUND");
  }

  res.json(film);
});
