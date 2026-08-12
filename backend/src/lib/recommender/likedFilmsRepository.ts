import { prisma } from "../prisma";
import { POSITIVE_SENTIMENTS } from "../tasteWeights";

export async function likedFilmsByGenre(userId: string): Promise<Map<string, string>> {
  const liked = await prisma.watchedFilm.findMany({
    // Both endorsement levels, not just "like" — a loved film is the strongest
    // example of a genre the user is into, so it must not be the one left out.
    where: { userId, sentiment: { in: [...POSITIVE_SENTIMENTS] } },
    orderBy: { watchedAt: "desc" },
    select: { film: { select: { title: true, genres: true } } },
  });

  const byGenre = new Map<string, string>();
  for (const { film } of liked) {
    for (const genre of film.genres) {
      if (!byGenre.has(genre)) byGenre.set(genre, film.title);
    }
  }

  return byGenre;
}
