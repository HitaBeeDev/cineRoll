import { Router } from "express";
import { setPublicCache } from "../lib/cache";
import { prisma } from "../lib/prisma";
import { HttpError } from "../middleware/errorHandler";

export const pickOfDayRouter = Router();

const pickOfDaySelect = {
  id: true,
  slug: true,
  title: true,
  releaseYear: true,
  runtime: true,
  genres: true,
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
};

pickOfDayRouter.get("/", async (_req, res) => {
  const cutoff = new Date(Date.now() - 48 * 60 * 60 * 1000);

  // Count rolls per film in the last 48 hours
  const rollCounts = await prisma.$queryRaw<{ filmId: string; rolls: bigint }[]>`
    SELECT "filmId", COUNT(*)::BIGINT AS rolls
    FROM "RollEvent"
    WHERE "rolledAt" >= ${cutoff}
    GROUP BY "filmId"
    ORDER BY rolls DESC
    LIMIT 1
  `;

  const topRolledId = rollCounts[0]?.filmId;

  // If there's recent roll activity, use the most-rolled film
  if (topRolledId) {
    const film = await prisma.film.findUnique({
      where: { id: topRolledId },
      select: pickOfDaySelect,
    });
    if (film) {
      setPublicCache(res, 3_600);
      res.json({ ...film, year: film.releaseYear });
      return;
    }
  }

  // Fallback: most-awarded film in the DB (deterministic, never 404 unless DB empty)
  const fallback = await prisma.film.findFirst({
    orderBy: [
      { oscarWins: "desc" },
      { ggWins: "desc" },
      { oscarNominations: "desc" },
    ],
    select: pickOfDaySelect,
  });

  if (!fallback) {
    throw new HttpError(404, "No films in database", "NO_FILMS");
  }

  setPublicCache(res, 3_600);
  res.json({ ...fallback, year: fallback.releaseYear });
});
