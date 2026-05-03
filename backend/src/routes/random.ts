import { Router } from "express";
import { prisma } from "../lib/prisma";
import { HttpError } from "../middleware/errorHandler";

export const randomRouter = Router();

randomRouter.get("/", async (_req, res) => {
  const count = await prisma.film.count();
  if (count === 0) {
    throw new HttpError(404, "No films found", "NO_FILMS_FOUND");
  }

  const skip = Math.floor(Math.random() * count);
  const film = await prisma.film.findFirst({ skip });

  if (!film) {
    throw new HttpError(404, "No films found", "NO_FILMS_FOUND");
  }

  res.json(film);
});
