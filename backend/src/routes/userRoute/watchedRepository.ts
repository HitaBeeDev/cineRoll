import { prisma } from "../../lib/prisma";
import { filmSummarySelect } from "./selects";

export function findWatchedPage(userId: string, limit: number, cursor?: string) {
  return prisma.watchedFilm.findMany({
    // Exclude "not interested" (doNotSuggest) rows at the source — those are
    // hidden, not watched. Filtering here (rather than on the client) keeps the
    // page size honest and the cursor aligned with what's rendered.
    where: { userId, doNotSuggest: false },
    orderBy: [{ watchedAt: "desc" }, { id: "desc" }],
    include: { film: { select: filmSummarySelect } },
    take: limit + 1,
    ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
  });
}

// Excludes "not interested" (doNotSuggest) entries — those are hidden, not
// watched — so the header total matches the list the page actually renders.
export function countWatched(userId: string) {
  return prisma.watchedFilm.count({ where: { userId, doNotSuggest: false } });
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
