import { cache, cacheKeys } from "../../lib/cache";
import { prisma } from "../../lib/prisma";
import { filmDetailSelect } from "./selects";

const FILM_DETAIL_TTL_MS = 60 * 60 * 1000;

export async function getFilmDetail(slug: string) {
  return cache.getOrSet(cacheKeys.filmDetail(slug), FILM_DETAIL_TTL_MS, async () => {
    const film = await prisma.film.findUnique({
      where: { slug },
      select: filmDetailSelect,
    });

    return film ? { ...film, year: film.releaseYear } : null;
  });
}
