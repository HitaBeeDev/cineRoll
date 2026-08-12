import { Router, Response } from "express";

import { setPublicCache } from "../lib/cache";
import { RandomQuery, randomQuerySchema } from "../lib/filmFilters/randomQuerySchema";
import { HttpError } from "../middleware/errorHandler";
import { getValidated, validate } from "../middleware/validate";
import { logRollEvent } from "./randomRoute/eventLogger";
import { getPersonalizedRandomFilm } from "./randomRoute/personalizedService";
import { getCatalogCount, getRandomCount } from "./randomRoute/randomRepository";
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

  const total = await getRandomCount(query);

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

// Two numbers, because two questions get asked of this endpoint and they have
// different right answers:
//
//   total    the catalogue for these filters — what the home page states, and the
//            same figure browse and stats report, so the product quotes one size
//            for itself everywhere. 0 when nothing is rollable, so callers can
//            still use it to disable the roll.
//   rollable what a draw can actually land on. Any control that PROMISES a draw
//            ("Roll from N films") has to quote this one instead.
randomRouter.get("/count", validate(randomQuerySchema), async (req, res) => {
  const query = getValidated<RandomQuery>(req, "query");
  const [total, rollable] = await Promise.all([
    getCatalogCount(query),
    getRandomCount(query),
  ]);

  setPublicCache(res, 60);
  res.json({ total, rollable });
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
