import { Router } from "express";
import { setPublicCache } from "../lib/cache";
import { prisma } from "../lib/prisma";
import { HttpError } from "../middleware/errorHandler";

export const randomRouter = Router();

const randomFilmSelect = {
  id: true,
  slug: true,
  title: true,
  year: true,
  runtime: true,
  genres: true,
  plot: true,
  director: true,
  posterUrl: true,
  imdbRating: true,
  oscarWins: true,
};

randomRouter.get("/", async (_req, res) => {
  const count = await prisma.film.count();
  if (count === 0) {
    throw new HttpError(404, "No films found", "NO_FILMS_FOUND");
  }

  const skip = Math.floor(Math.random() * count);
  const film = await prisma.film.findFirst({
    skip,
    select: randomFilmSelect,
  });

  if (!film) {
    throw new HttpError(404, "No films found", "NO_FILMS_FOUND");
  }

  setPublicCache(res, 60);
  res.json(film);
});
