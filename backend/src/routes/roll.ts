import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { HttpError } from "../middleware/errorHandler";
import { getValidated, validate } from "../middleware/validate";

export const rollRouter = Router();

const rollBodySchema = z.object({
  filmId: z.string().min(1),
});

rollRouter.post("/", validate(rollBodySchema, "body"), async (req, res) => {
  const { filmId } = getValidated<z.infer<typeof rollBodySchema>>(req, "body");

  const film = await prisma.film.findUnique({
    where: { id: filmId },
    select: { id: true },
  });

  if (!film) {
    throw new HttpError(404, "Film not found", "FILM_NOT_FOUND");
  }

  const event = await prisma.rollEvent.create({
    data: { filmId },
  });

  res.status(201).json(event);
});
