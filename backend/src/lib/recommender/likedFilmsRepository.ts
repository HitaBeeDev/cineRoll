import { prisma } from "../prisma";

export async function likedFilmsByGenre(userId: string): Promise<Map<string, string>> {
  const liked = await prisma.watchedFilm.findMany({
    where: { userId, sentiment: "like" },
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
