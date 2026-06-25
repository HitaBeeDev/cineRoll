import { prisma } from "../../lib/prisma";

export const COMMENTS_PAGE_SIZE = 20;

const commentSelect = {
  id: true,
  userId: true,
  body: true,
  createdAt: true,
  updatedAt: true,
  user: {
    select: {
      name: true,
      image: true,
    },
  },
} as const;

export async function findFilmIdBySlug(slug: string): Promise<string | null> {
  const film = await prisma.film.findUnique({
    where: { slug },
    select: { id: true },
  });

  return film?.id ?? null;
}

export async function getComments(filmId: string, page: number) {
  const skip = (page - 1) * COMMENTS_PAGE_SIZE;
  const [comments, total] = await Promise.all([
    prisma.filmComment.findMany({
      where: { filmId, hidden: false },
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      skip,
      take: COMMENTS_PAGE_SIZE,
      select: commentSelect,
    }),
    prisma.filmComment.count({
      where: { filmId, hidden: false },
    }),
  ]);

  return { comments, total };
}

export async function hasWatchedFilm(userId: string, filmId: string): Promise<boolean> {
  const watched = await prisma.watchedFilm.findUnique({
    where: { userId_filmId: { userId, filmId } },
    select: { id: true },
  });

  return watched !== null;
}

export async function createComment(userId: string, filmId: string, body: string) {
  return prisma.filmComment.create({
    data: { userId, filmId, body },
    select: commentSelect,
  });
}

export async function deleteOwnComment(userId: string, id: string): Promise<boolean> {
  const result = await prisma.filmComment.deleteMany({
    where: { id, userId },
  });

  return result.count > 0;
}
