import { Prisma } from "@prisma/client";

// Hard eligibility gate for the ROLL only. A title may be *rolled* (and is
// counted in the reel pool) only if it clears these. Deliberately kept out of
// the shared browse `where` builder — browse still lists everything; the roll
// holds a higher quality bar so "tonight's film" never lands on a broken record.
// See docs/smart-roll-engine.md §5.
//
// title / year / contentType are NOT NULL in the schema, so they need no runtime
// gate — the meaningful checks are rating, poster, and a non-empty genre list.
export function eligibilityConditions(): Prisma.Sql[] {
  return [
    // Must carry BOTH external ratings. A film with only one score (IMDb or RT,
    // but not the other) is not rollable — a single rating reads as incomplete,
    // so "tonight's film" always has two independent signals behind it.
    Prisma.sql`"Film"."imdbRating" IS NOT NULL`,
    Prisma.sql`"Film"."rtScore" IS NOT NULL`,
    // Enough metadata to render a real result card.
    Prisma.sql`"Film"."posterUrl" IS NOT NULL AND "Film"."posterUrl" <> ''`,
    // array_length returns NULL for an empty array, so `>= 1` excludes both.
    Prisma.sql`array_length("Film"."genres", 1) >= 1`,
  ];
}
