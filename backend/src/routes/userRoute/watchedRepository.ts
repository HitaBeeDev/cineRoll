import { prisma } from "../../lib/prisma";
import { filmSummarySelect } from "./selects";

export function findWatchedPage(userId: string, limit: number, cursor?: string) {
  return prisma.watchedFilm.findMany({
    where: { userId },
    orderBy: [{ watchedAt: "desc" }, { id: "desc" }],
    include: { film: { select: filmSummarySelect } },
    take: limit + 1,
    ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
  });
}

export function upsertWatchedFilm(
  userId: string,
  filmId: string,
  doNotSuggest: boolean,
  sentiment: "like" | "dislike" | null | undefined,
) {
  const sentimentData = sentiment === undefined ? {} : { sentiment };

  return prisma.watchedFilm.upsert({
    where: { userId_filmId: { userId, filmId } },
    create: { userId, filmId, doNotSuggest, sentiment: sentiment ?? null },
    update: { doNotSuggest, watchedAt: new Date(), ...sentimentData },
    include: { film: { select: filmSummarySelect } },
  });
}

export async function deleteWatchedFilm(userId: string, filmId: string): Promise<boolean> {
  const result = await prisma.watchedFilm.deleteMany({
    where: { userId, filmId },
  });

  return result.count > 0;
}
