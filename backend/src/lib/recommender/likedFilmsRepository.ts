import { prisma } from "../prisma";
import { POSITIVE_SENTIMENTS } from "../tasteWeights";

// One anchor title per genre made every Drama pick say "Because you liked
// Ben-Hur". Keep the whole liked list per genre so the reason builder can
// rotate through it and give each card its own sentence.
const MAX_ANCHORS_PER_GENRE = 12;

export async function likedFilmsByGenre(userId: string): Promise<Map<string, string[]>> {
  const liked = await prisma.watchedFilm.findMany({
    // Both endorsement levels, not just "like" — a loved film is the strongest
    // example of a genre the user is into, so it must not be the one left out.
    where: { userId, sentiment: { in: [...POSITIVE_SENTIMENTS] } },
    orderBy: { watchedAt: "desc" },
    select: { film: { select: { title: true, genres: true } } },
  });

  const byGenre = new Map<string, string[]>();
  for (const { film } of liked) {
    for (const genre of film.genres) {
      const titles = byGenre.get(genre) ?? [];
      if (titles.length >= MAX_ANCHORS_PER_GENRE || titles.includes(film.title)) continue;

      titles.push(film.title);
      byGenre.set(genre, titles);
    }
  }

  return byGenre;
}
