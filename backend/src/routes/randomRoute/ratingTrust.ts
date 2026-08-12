import { Prisma } from "@prisma/client";

/**
 * Whether a stored Rotten Tomatoes score is worth believing.
 *
 * WHY THIS EXISTS. We store the RT percentage and nothing else — OMDB returns no
 * review count (the old `tomatoReviews` fields are gone), so a 100% backed by
 * four critics is indistinguishable from a 100% backed by four hundred. 35 rows
 * in the catalogue sit at exactly 100% with an IMDb rating in the 5s and 6s:
 * "Veronica's Closet" (5.8 / 100%), "Escape Me Never" (5.3 / 100%), "Captain
 * Kidd" (6.3 / 100%). Genuine unanimity across a real critic pool essentially
 * never happens; those are three-review samples.
 *
 * That used to be harmless, because the roll gate required BOTH ratings and a
 * weak IMDb score blocked the film anyway. It stopped being harmless when the
 * gate became `imdb >= 7 OR rt >= 70` — RT can now qualify a film on its own,
 * so one inflated score is enough to put a mediocre sitcom in front of someone
 * as "tonight's film".
 *
 * THE TEST. Without a review count the only signal available is disagreement
 * with the crowd. The threshold is deliberately high: critics and audiences
 * differ by 10-20 points constantly and that is real, not broken. Only a gap
 * this wide says "too few people voted for this number to mean anything".
 *
 * ONE DIRECTION ONLY. An RT score that is far BELOW its IMDb rating is usually
 * true — critics really did pan Patch Adams (22% / 6.9), The Da Vinci Code
 * (25% / 6.6) and Cocktail (11% / 6.0). It also cannot do any harm here: a low
 * score has nothing to qualify, so IMDb decides and the film is judged on the
 * signal we trust. Distrusting it would delete ~100 correct scores to fix none.
 *
 * NOT A DATA FIX. Nothing is written back. The score stays in the database and
 * on the film page — this only governs what the ROLL is willing to act on. If
 * the underlying rows are ever corrected (see `data/scripts/rt-audit.ts`), this
 * guard simply stops matching anything and can be deleted.
 */
export const RT_TRUST_MAX_GAP = 35;

/**
 * TS form, for scoring an already-fetched row.
 *
 * With no IMDb rating to compare against there is nothing to be suspicious of,
 * so RT is trusted — that is the "if it only has one score, that one decides"
 * half of the gate, and it must keep working.
 */
export function rtScoreIsTrusted(
  imdbRating: number | null,
  rtScore: number | null,
): boolean {
  if (rtScore == null) return false;
  if (imdbRating == null) return true;

  return rtScore - imdbRating * 10 < RT_TRUST_MAX_GAP;
}

/** SQL form of the same predicate, for the roll's eligibility gate. */
export function rtScoreIsTrustedSql(): Prisma.Sql {
  return Prisma.sql`(
    "Film"."imdbRating" IS NULL
    OR "Film"."rtScore" - "Film"."imdbRating" * 10 < ${RT_TRUST_MAX_GAP}
  )`;
}
