import { Router, Response } from "express";

import { setPublicCache } from "../lib/cache";
import { RandomQuery, randomQuerySchema } from "../lib/filmFilters/randomQuerySchema";
import { HttpError } from "../middleware/errorHandler";
import { getValidated, validate } from "../middleware/validate";
import { logRollEvent } from "./randomRoute/eventLogger";
import { getPersonalizedRandomFilm } from "./randomRoute/personalizedService";
import { getDisplayCount } from "./randomRoute/randomRepository";
import { getSessionRoll } from "./randomRoute/sessionRollService";
import { RandomFilmResult, RandomFilmRow } from "./randomRoute/types";

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
  const { film, exploration, lane, posteriors } = usePersonalized
    ? { ...(await getPersonalizedRandomFilm(query)), lane: undefined, posteriors: undefined }
    : { ...(await getSessionRoll(query)), exploration: false };

  if (!film) {
    throw new HttpError(404, "No films match the given filters", "NO_FILMS_FOUND");
  }

  // The pool count reported to the client is the full catalog for these filters,
  // not the eligibility-gated roll pool (see getDisplayCount). A film exists here,
  // so the rollable pool is non-empty and this resolves to the real total X.
  const total = await getDisplayCount(query);

  await logRollEvent(query, film, total, usePersonalized, exploration);
  sendRandomFilmResponse(res, film, total, usePersonalized, exploration, lane, posteriors);
});

randomRouter.get("/count", validate(randomQuerySchema), async (req, res) => {
  const query = getValidated<RandomQuery>(req, "query");
  const total = await getDisplayCount(query);

  setPublicCache(res, 60);
  res.json({ total });
});

function sendRandomFilmResponse(
  res: Response,
  film: RandomFilmRow,
  total: number,
  usePersonalized: boolean,
  exploration: boolean,
  lane: "safe" | "gem" | "wild" | undefined,
  posteriors: RandomFilmResult["posteriors"],
): void {
  if (usePersonalized) {
    res.set("Cache-Control", "private, no-store");
    res.json({ film, total, personalized: true, exploration });
    return;
  }

  // A signed-in base roll read/wrote the user's DB posteriors and echoes them
  // back — that response is per-user, so it must not be publicly cached.
  if (posteriors) {
    res.set("Cache-Control", "private, no-store");
    res.json({ film, total, lane, bandit: posteriors });
    return;
  }

  // Guest base roll: the lane depends on the client's own bandit state (sent in
  // the query), so the cache key already varies with it — safe to keep caching.
  setPublicCache(res, 60);
  res.json({ film, total, lane });
}
