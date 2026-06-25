import { cache, cacheKeys } from "../../lib/cache";
import { prisma } from "../../lib/prisma";
import { filmDetailSelect } from "./selects";

const FILM_DETAIL_TTL_MS = 60 * 60 * 1000;

export async function getFilmDetail(slug: string) {
  const payload = await cache.getOrSet(cacheKeys.filmDetail(slug), FILM_DETAIL_TTL_MS, async () => {
    const film = await prisma.film.findUnique({
      where: { slug },
      select: filmDetailSelect,
    });

    return film ? { ...film, year: film.releaseYear } : null;
  });

  if (!payload) return null;

  const ratingAggregate = await prisma.userRating.aggregate({
    where: { filmId: payload.id },
    _avg: { rating: true },
    _count: { rating: true },
  });

  return {
    ...payload,
    averageRating: roundedAverage(ratingAggregate._avg.rating),
    ratingCount: ratingAggregate._count.rating,
  };
}

function roundedAverage(averageRating: number | null): number | null {
  return averageRating === null ? null : Math.round(averageRating * 10) / 10;
}
