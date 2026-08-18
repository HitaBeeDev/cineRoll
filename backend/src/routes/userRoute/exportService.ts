import { prisma } from "../../lib/prisma";

/**
 * Everything the account owns, in one JSON document.
 *
 * The pair to account deletion: the privacy policy offers people a way out, and
 * a way out is worth more when they can take their data with them. It is also
 * the cheapest possible answer to a GDPR access request — the user serves
 * themselves instead of mailing the feedback form and waiting on a human.
 *
 * Films are identified by SLUG, not by internal id: `seed-master` deletes and
 * re-creates every Film row, so ids are regenerated on each seed and an exported
 * id would point at nothing a week later. A slug is also the URL, so an export
 * doubles as a list of links.
 *
 * Analytics events are deliberately absent. They are session telemetry rather
 * than user content, they dwarf everything else in volume, and deletion
 * anonymizes them rather than removing them — exporting them would imply an
 * ownership the retention policy does not claim.
 */
const filmRef = {
  select: { slug: true, title: true, releaseYear: true, director: true },
} as const;

export type AccountExport = Awaited<ReturnType<typeof buildAccountExport>>;

export async function buildAccountExport(userId: string) {
  const [user, watchlist, watched, lists, tasteProfile] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: {
        email: true,
        name: true,
        image: true,
        emailVerified: true,
        createdAt: true,
        onboardingGenres: true,
      },
    }),
    prisma.watchlist.findMany({
      where: { userId },
      select: { addedAt: true, film: filmRef },
      orderBy: { addedAt: "asc" },
    }),
    prisma.watchedFilm.findMany({
      where: { userId },
      select: { watchedAt: true, sentiment: true, doNotSuggest: true, film: filmRef },
      orderBy: { watchedAt: "asc" },
    }),
    prisma.userList.findMany({
      where: { userId },
      select: {
        name: true,
        createdAt: true,
        entries: { select: { addedAt: true, film: filmRef }, orderBy: { addedAt: "asc" } },
      },
      orderBy: { createdAt: "asc" },
    }),
    prisma.userTasteProfile.findUnique({
      where: { userId },
      select: {
        genreWeights: true,
        directorWeights: true,
        decadeWeights: true,
        runtimeBandWeights: true,
        awardAffinity: true,
        ratingTier: true,
        positiveCount: true,
        negativeCount: true,
        updatedAt: true,
      },
    }),
  ]);

  return {
    exportedAt: new Date().toISOString(),
    account: user,
    watchlist,
    watched,
    lists,
    tasteProfile,
  };
}
