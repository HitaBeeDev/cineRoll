import { prisma } from "../../lib/prisma";

export function upsertRating(userId: string, filmId: string, rating: number) {
  return prisma.userRating.upsert({
    where: { userId_filmId: { userId, filmId } },
    create: { userId, filmId, rating },
    update: { rating },
  });
}

export function findRating(userId: string, filmId: string) {
  return prisma.userRating.findUnique({
    where: { userId_filmId: { userId, filmId } },
  });
}

export async function deleteRating(userId: string, filmId: string): Promise<boolean> {
  const result = await prisma.userRating.deleteMany({
    where: { userId, filmId },
  });

  return result.count > 0;
}
