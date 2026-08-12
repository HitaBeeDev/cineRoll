import { Prisma } from "@prisma/client";

import { contentTypeSql } from "../../lib/filmFilters/contentTypeSql";
import { rtScoreIsTrustedSql } from "./ratingTrust";

// Hard eligibility gate for the ROLL only. A title may be *rolled* (and is
// counted in the reel pool) only if it clears these. Deliberately kept out of
// the shared browse `where` builder — browse still lists everything; the roll
// holds a higher quality bar so "tonight's film" never lands on a weak record.
// See docs/smart-roll-engine.md §5.
//
// title / year / contentType are NOT NULL in the schema, so they need no runtime
// gate — the meaningful checks are the quality bar, a poster, and a genre list.
export function eligibilityConditions(): Prisma.Sql[] {
  return [
    qualityGate(),
    // Enough metadata to render a real result card.
    Prisma.sql`"Film"."posterUrl" IS NOT NULL AND "Film"."posterUrl" <> ''`,
    // array_length returns NULL for an empty array, so `>= 1` excludes both.
    Prisma.sql`array_length("Film"."genres", 1) >= 1`,
  ];
}

const IMDB_FLOOR = 7;
const RT_FLOOR = 70;

/**
 * The quality bar, which is per content type because the ratings data is.
 *
 * Rotten Tomatoes barely covers anything but English-language features — it has
 * a score for 80% of movies but only 23% of documentaries, 8% of series and 4%
 * of shorts. The previous gate required BOTH ratings, which was never a quality
 * bar at all: it was a completeness check that silently deleted whatever RT
 * hadn't reviewed. It cost the Berlinale 82% of its catalogue.
 *
 * So RT is a veto, never a requirement. A feature passes on either score —
 * whichever exists — and a missing score simply doesn't vote. COALESCE is what
 * makes that literal: `NULL >= 7` is NULL, and a CASE arm that evaluates to NULL
 * drops the row from the WHERE just as surely as FALSE, but says so by accident
 * rather than on purpose.
 *
 * Branching is on `types` (the derived set) rather than the single-valued
 * `contentType` column, and through `contentTypeSql` — the same helper the
 * browse facets resolve through. If the gate and the facet disagreed about what
 * "movie" means, the reel pool count would stop matching what the reel can
 * actually serve, which is the exact bug this gate's own count once had.
 *
 * Order is shortest-axis-first, because `types` crosses two axes: a 9-minute war
 * documentary derives ["documentary","short"] and must be read as a short.
 */
function qualityGate(): Prisma.Sql {
  const typesColumn = Prisma.raw(`"Film"."types"`);
  const isShort = contentTypeSql(typesColumn, "short");
  const isDocumentary = contentTypeSql(typesColumn, "documentary");
  const isSeries = contentTypeSql(typesColumn, "tv-series");

  const clearsImdb = Prisma.sql`COALESCE("Film"."imdbRating" >= ${IMDB_FLOOR}, FALSE)`;
  // RT only gets a vote when the score is believable — see ratingTrust.ts. Since
  // either score can qualify a feature on its own, an inflated 100% off three
  // reviews would otherwise be enough to admit a film IMDb rates in the 5s.
  const clearsRt = Prisma.sql`COALESCE(
    "Film"."rtScore" >= ${RT_FLOOR} AND ${rtScoreIsTrustedSql()},
    FALSE
  )`;

  return Prisma.sql`
    CASE
      -- Shorts and documentaries carry no rating bar. Both are systematically
      -- under-rated by IMDb and all but uncovered by RT, so any floor here
      -- filters on who bothered to review them, not on whether they are good.
      WHEN ${isShort} OR ${isDocumentary} THEN TRUE
      -- Series are IMDb-only: 8% RT coverage means an RT clause would just
      -- delete 92% of them.
      WHEN ${isSeries} THEN ${clearsImdb}
      -- Features and animation: either score clears it.
      ELSE ${clearsImdb} OR ${clearsRt}
    END
  `;
}
