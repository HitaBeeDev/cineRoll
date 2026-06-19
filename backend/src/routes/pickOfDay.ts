import { Router } from "express";
import { cache, cacheKeys, setPublicCache } from "../lib/cache";
import { logEvent } from "../lib/events";
import { getPickOfDay, pickOfDaySelect } from "../lib/pickOfDay";
import { prisma } from "../lib/prisma";
import { HttpError } from "../middleware/errorHandler";

export const pickOfDayRouter = Router();

/** Today's pick is deterministic; cache it for the day (the key rolls over at
 *  UTC midnight, so the TTL is just a safety ceiling). */
const PICK_OF_DAY_TTL_MS = 60 * 60 * 1000;

pickOfDayRouter.get("/", async (_req, res) => {
  const day = new Date().toISOString().slice(0, 10);
  const pick = await cache.getOrSet(cacheKeys.pickOfDay(day), PICK_OF_DAY_TTL_MS, () =>
    getPickOfDay(),
  );

  if (pick) {
    await logEvent({
      type: "recommendation_served",
      filmId: pick.film.id,
      context: {
        source: "pick_of_day",
        strategy: "deterministic_daily",
        fromHistory: pick.fromHistory,
      },
    });
    setPublicCache(res, 3_600);
    res.json({ ...pick.film, year: pick.film.releaseYear });
    return;
  }

  // Last resort: most-awarded film — only reached if the catalog has no
  // prestige films at all (otherwise getPickOfDay always returns one).
  const mostAwarded = await prisma.film.findFirst({
    orderBy: [
      { oscarWins: "desc" },
      { ggWins: "desc" },
      { cannesWins: "desc" },
      { oscarNominations: "desc" },
      { title: "asc" },
    ],
    select: pickOfDaySelect,
  });

  if (!mostAwarded) {
    throw new HttpError(404, "No films in database", "NO_FILMS");
  }

  setPublicCache(res, 3_600);
  await logEvent({
    type: "recommendation_served",
    filmId: mostAwarded.id,
    context: { source: "pick_of_day", strategy: "most_awarded_fallback" },
  });
  res.json({ ...mostAwarded, year: mostAwarded.releaseYear });
});
