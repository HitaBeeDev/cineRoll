import { prisma } from "../../lib/prisma";

type HeadshotRow = { photoUrl: string | null };

/**
 * A headshot for someone the catalogue already has a picture of.
 *
 * `Person.photoUrl` is the proper home for this and is currently empty, so the
 * person page fell back to an initials monogram while the same face was on the
 * film page one click away — every cast row carries a TMDB portrait. This reads
 * that portrait back out of the film data by name.
 *
 * Cast only, so it covers actors and the directors who have acted; a director
 * who never appeared on screen is not in any cast list and still needs a real
 * `Person.photoUrl`.
 *
 * `order` ascending prefers a billing where the person was near the top, which
 * is where TMDB's portrait is most likely to be the current one.
 *
 * Matched case-insensitively because the award data and the cast data disagree
 * about capitalisation — the Cannes rows carry surnames in caps ("Martin
 * SCORSESE"), and an exact match silently found nothing for all of them.
 */
export const getCastHeadshot = async (name: string): Promise<string | null> => {
  const rows = await prisma.$queryRaw<HeadshotRow[]>`
    SELECT member->>'photoUrl' AS "photoUrl"
    FROM "Film" f, jsonb_array_elements(f."cast") AS member
    WHERE LOWER(member->>'name') = LOWER(${name})
      AND member->>'photoUrl' IS NOT NULL
    ORDER BY (member->>'order')::INT ASC
    LIMIT 1
  `;

  return rows[0]?.photoUrl ?? null;
};
