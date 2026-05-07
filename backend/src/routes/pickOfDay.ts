import { Router } from "express";
import { setPublicCache } from "../lib/cache";
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

pickOfDayRouter.get("/", async (_req, res) => {
  const cutoff = new Date(Date.now() - 48 * 60 * 60 * 1000);

  const watchlistTableRows = await prisma.$queryRaw<{ exists: boolean }[]>`
    SELECT to_regclass('public."WatchlistEntry"') IS NOT NULL AS "exists"
  `;
  const hasWatchlistTable = watchlistTableRows[0]?.exists === true;

  const scoredFilms = hasWatchlistTable
    ? await prisma.$queryRaw<{ filmId: string; score: bigint }[]>`
        SELECT "filmId", SUM(score)::BIGINT AS score
        FROM (
          SELECT "filmId", COUNT(*)::BIGINT AS score
          FROM "RollEvent"
          WHERE "rolledAt" >= ${cutoff}
          GROUP BY "filmId"
          UNION ALL
          SELECT "filmId", COUNT(*)::BIGINT AS score
          FROM "WatchlistEntry"
          WHERE "addedAt" >= ${cutoff}
          GROUP BY "filmId"
        ) activity
        GROUP BY "filmId"
        ORDER BY score DESC
        LIMIT 1
      `
    : await prisma.$queryRaw<{ filmId: string; score: bigint }[]>`
        SELECT "filmId", COUNT(*)::BIGINT AS score
        FROM "RollEvent"
        WHERE "rolledAt" >= ${cutoff}
        GROUP BY "filmId"
        ORDER BY score DESC
        LIMIT 1
      `;

  const topFilmId = scoredFilms[0]?.filmId;

  if (topFilmId) {
    const film = await prisma.film.findUnique({
      where: { id: topFilmId },
      select: pickOfDaySelect,
    });
    if (film) {
      setPublicCache(res, 3_600);
      res.json({ ...film, year: film.releaseYear });
      return;
    }
  }

  const previousPick = await prisma.film.findFirst({
    where: {
      OR: [
        { pickOfDayDate: { gte: cutoff } },
        { isPickOfDay: true },
      ],
    },
    orderBy: [
      { pickOfDayDate: "desc" },
      { updatedAt: "desc" },
    ],
    select: pickOfDaySelect,
  });

  if (previousPick) {
    setPublicCache(res, 3_600);
    res.json({ ...previousPick, year: previousPick.releaseYear });
    return;
  }

  const fallback = await prisma.film.findFirst({
    orderBy: [
      { oscarWins: "desc" },
      { ggWins: "desc" },
      { cannesWins: "desc" },
      { oscarNominations: "desc" },
      { title: "asc" },
    ],
    select: pickOfDaySelect,
  });

  if (!fallback) {
    throw new HttpError(404, "No films in database", "NO_FILMS");
  }

  setPublicCache(res, 3_600);
  res.json({ ...fallback, year: fallback.releaseYear });
});
