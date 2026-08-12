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

  const drawId = await logRollEvent({
    query,
    film,
    total,
    personalized: usePersonalized,
    exploration,
    lane,
  });
  sendRandomFilmResponse(res, {
    film,
    total,
    drawId,
    seeded: query.seed != null,
    usePersonalized,
    exploration,
    lane,
    posteriors,
  });
});

randomRouter.get("/count", validate(randomQuerySchema), async (req, res) => {
  const query = getValidated<RandomQuery>(req, "query");
  const total = await getDisplayCount(query);

  setPublicCache(res, 60);
  res.json({ total });
});

type RandomFilmResponse = {
  film: RandomFilmRow;
  total: number;
  /** This draw's identity, for the client to cite on the next roll. */
  drawId: string | null;
  seeded: boolean;
  usePersonalized: boolean;
  exploration: boolean;
  lane: "safe" | "gem" | "wild" | undefined;
  posteriors: RandomFilmResult["posteriors"];
};

function sendRandomFilmResponse(res: Response, result: RandomFilmResponse): void {
  const { film, total, drawId, lane } = result;

  // A seeded roll is the one draw that is deliberately the same for everyone —
  // the daily pick. It resolves deterministically, draws no lane, and belongs to
  // no one's session, so it is the only response here that a shared cache may
  // hold, and the only one that carries no draw id: an id served from a cache is
  // an id two people would both claim as their own.
  if (result.seeded) {
    setPublicCache(res, 60);
    res.json({ film, total });
    return;
  }

  // Everything below is one user's draw. It names itself, and a named decision
  // is never a shared resource — which also fixes a quieter problem: a cached
  // guest roll never reached this handler again, so those rolls went unlogged
  // and every guest behind the cache was handed the same "random" film.
  res.set("Cache-Control", "private, no-store");

  if (result.usePersonalized) {
    res.json({ film, total, drawId, personalized: true, exploration: result.exploration });
    return;
  }

  // A signed-in base roll read/wrote the user's DB posteriors and echoes them
  // back so the client can sync its local copy.
  if (result.posteriors) {
    res.json({ film, total, drawId, lane, bandit: result.posteriors });
    return;
  }

  res.json({ film, total, drawId, lane });
}
