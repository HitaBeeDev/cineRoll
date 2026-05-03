import { Router } from "express";
import { setPublicCache } from "../lib/cache";
import { prisma } from "../lib/prisma";
import { HttpError } from "../middleware/errorHandler";

export const pickOfDayRouter = Router();

const pickOfDaySelect = {
  id: true,
  slug: true,
  title: true,
  releaseYear: true,
  runtime: true,
  genres: true,
  plot: true,
  director: true,
  posterUrl: true,
  backdropUrl: true,
  imdbRating: true,
  rtScore: true,
  oscarNominations: true,
  oscarWins: true,
  pickOfDayDate: true,
};

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
    select: pickOfDaySelect,
  });

  if (!film) {
    throw new HttpError(404, "No pick of the day found", "PICK_OF_DAY_NOT_FOUND");
  }

  setPublicCache(res, 3_600);
  res.json({ ...film, year: film.releaseYear });
});
