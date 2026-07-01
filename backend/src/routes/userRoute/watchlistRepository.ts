import { prisma } from "../../lib/prisma";
import { filmSummarySelect } from "./selects";

export function findWatchlistPage(userId: string, limit: number, cursor?: string) {
  return prisma.watchlist.findMany({
    where: { userId },
    orderBy: [{ addedAt: "desc" }, { id: "desc" }],
    include: { film: { select: filmSummarySelect } },
    take: limit + 1,
    ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
  });
}

export function countWatchlist(userId: string) {
  return prisma.watchlist.count({ where: { userId } });
}

export function createWatchlistEntry(userId: string, filmId: string) {
  return prisma.watchlist.create({
    data: { userId, filmId },
    include: { film: { select: filmSummarySelect } },
  });
}

export async function deleteWatchlistEntry(userId: string, filmId: string): Promise<boolean> {
  const result = await prisma.watchlist.deleteMany({
    where: { userId, filmId },
  });

  return result.count > 0;
}
