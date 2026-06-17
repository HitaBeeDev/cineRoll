import { Router } from "express";
import { setPublicCache } from "../lib/cache";
import { logEvent } from "../lib/events";
import { prisma } from "../lib/prisma";
import { HttpError } from "../middleware/errorHandler";

export const pickOfDayRouter = Router();

const pickOfDaySelect = {
  id: true,
  slug: true,
  title: true,
  originalTitle: true,
  releaseYear: true,
  runtime: true,
  genres: true,
  contentType: true,
  plot: true,
  director: true,
  posterUrl: true,
  posterColor: true,
  backdropUrl: true,
  imdbRating: true,
  rtScore: true,
  oscarNominations: true,
  oscarWins: true,
  ggNominations: true,
  ggWins: true,
  cannesNominations: true,
  cannesWins: true,
};

const filmColumns = /* sql */`
  f."id", f."slug", f."title", f."originalTitle",
  f."year" AS "releaseYear",
  f."runtime", f."genres", f."contentType", f."plot", f."director",
  f."posterUrl", f."posterColor", f."backdropUrl",
  f."imdbRating", f."rtScore",
  f."oscarNominations", f."oscarWins",
  f."ggNominations", f."ggWins",
  f."cannesNominations", f."cannesWins"
`;

// Cached at module load — WatchlistEntry table won't appear mid-process
let watchlistTableExists: boolean | null = null;
async function hasWatchlist(): Promise<boolean> {
  if (watchlistTableExists !== null) return watchlistTableExists;
  const rows = await prisma.$queryRaw<{ exists: boolean }[]>`
    SELECT to_regclass('public."WatchlistEntry"') IS NOT NULL AS "exists"
  `;
  watchlistTableExists = rows[0]?.exists === true;
  return watchlistTableExists;
}

type PickRow = {
  id: string; slug: string; title: string; originalTitle: string | null;
  releaseYear: number; runtime: number | null; genres: string[]; contentType: string;
  plot: string | null; director: string | null; posterUrl: string | null;
  posterColor: string | null; backdropUrl: string | null;
  imdbRating: number | null; rtScore: number | null;
  oscarNominations: number; oscarWins: number;
  ggNominations: number; ggWins: number;
  cannesNominations: number; cannesWins: number;
};

pickOfDayRouter.get("/", async (_req, res) => {
  const cutoff = new Date(Date.now() - 48 * 60 * 60 * 1000);

  const useWatchlist = await hasWatchlist();

  // Single query: score films from activity in last 48h, JOIN film data directly
  const activityQuery = useWatchlist
    ? prisma.$queryRawUnsafe<PickRow[]>(`
        SELECT ${filmColumns}
        FROM (
          SELECT "filmId", SUM(score) AS score
          FROM (
            SELECT "filmId", COUNT(*) AS score FROM "RollEvent" WHERE "rolledAt" >= $1 GROUP BY "filmId"
            UNION ALL
            SELECT "filmId", COUNT(*) AS score FROM "WatchlistEntry" WHERE "addedAt" >= $1 GROUP BY "filmId"
          ) activity
          GROUP BY "filmId"
          ORDER BY score DESC
          LIMIT 1
        ) top
        JOIN "Film" f ON f."id" = top."filmId"
      `, cutoff)
    : prisma.$queryRawUnsafe<PickRow[]>(`
        SELECT ${filmColumns}
        FROM (
          SELECT "filmId", COUNT(*) AS score FROM "RollEvent" WHERE "rolledAt" >= $1 GROUP BY "filmId"
          ORDER BY score DESC LIMIT 1
        ) top
        JOIN "Film" f ON f."id" = top."filmId"
      `, cutoff);

  // Run activity query and hand-curated fallback in parallel
  const [activityRows, handPick] = await Promise.all([
    activityQuery,
    prisma.film.findFirst({
      where: {
        OR: [{ pickOfDayDate: { gte: cutoff } }, { isPickOfDay: true }],
      },
      orderBy: [{ pickOfDayDate: "desc" }, { updatedAt: "desc" }],
      select: pickOfDaySelect,
    }),
  ]);

  const film = activityRows[0] ?? handPick;

  if (film) {
    await logEvent({
      type: "recommendation_served",
      filmId: film.id,
      context: {
        source: "pick_of_day",
        strategy: activityRows[0] ? "recent_activity" : "curated",
      },
    });
    setPublicCache(res, 3_600);
    res.json({ ...film, year: film.releaseYear });
    return;
  }

  // Last resort: most-awarded film — only 404s if DB is completely empty
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
    context: {
      source: "pick_of_day",
      strategy: "most_awarded_fallback",
    },
  });
  res.json({ ...mostAwarded, year: mostAwarded.releaseYear });
});
