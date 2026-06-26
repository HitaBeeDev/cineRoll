import { Router, Response } from "express";

import { setPublicCache } from "../lib/cache";
import { RandomQuery, randomQuerySchema } from "../lib/filmFilters/randomQuerySchema";
import { HttpError } from "../middleware/errorHandler";
import { getValidated, validate } from "../middleware/validate";
import { logRollEvent } from "./randomRoute/eventLogger";
import { getPersonalizedRandomFilm } from "./randomRoute/personalizedService";
import {
  getRandomCount,
  getRandomFilm,
} from "./randomRoute/randomRepository";
import { RandomFilmRow } from "./randomRoute/types";

export {
  getQualityCandidates,
  getRandomCount,
  getRandomFilm,
  getRandomFilms,
} from "./randomRoute/randomRepository";
export { getPersonalizedRandomFilm } from "./randomRoute/personalizedService";
export type { RandomFilmRow } from "./randomRoute/types";

export const randomRouter = Router();

randomRouter.get("/", validate(randomQuerySchema), async (req, res) => {
  const query = getValidated<RandomQuery>(req, "query");
  const usePersonalized = query.personalized === true && query.userId != null;
  const { film, total, exploration } = usePersonalized
    ? await getPersonalizedRandomFilm(query)
    : { ...(await getRandomFilm(query)), exploration: false };

  if (!film) {
    throw new HttpError(404, "No films match the given filters", "NO_FILMS_FOUND");
  }

  await logRollEvent(query, film, total, usePersonalized, exploration);
  sendRandomFilmResponse(res, film, total, usePersonalized, exploration);
});

randomRouter.get("/count", validate(randomQuerySchema), async (req, res) => {
  const query = getValidated<RandomQuery>(req, "query");
  const total = await getRandomCount(query);

  setPublicCache(res, 60);
  res.json({ total });
});

function sendRandomFilmResponse(
  res: Response,
  film: RandomFilmRow,
  total: number,
  usePersonalized: boolean,
  exploration: boolean,
): void {
  if (usePersonalized) {
    res.set("Cache-Control", "private, no-store");
    res.json({ film, total, personalized: true, exploration });
    return;
  }

  setPublicCache(res, 60);
  res.json({ film, total });
}
