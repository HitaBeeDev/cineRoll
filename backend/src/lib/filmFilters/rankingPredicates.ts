import { Prisma } from "@prisma/client";

import { ListQuery } from "./listQuerySchema";

export function rankingPredicates(query: ListQuery): Prisma.Sql[] {
  return [
    nominationCountPredicate(query),
    ceremonyCountPredicate(query),
    imdbTopMoviesPredicate(query),
    imdbTopTvPredicate(query),
    imdbTopExcludePredicate(query),
    winsMinPredicate(query),
    winsMaxPredicate(query),
  ].filter((predicate): predicate is Prisma.Sql => predicate !== undefined);
}

function nominationCountPredicate(query: ListQuery): Prisma.Sql | undefined {
  if (query.nominationCount === undefined) return undefined;

  return Prisma.sql`
    (
      "Film"."oscarNominations"
      + "Film"."ggNominations"
      + "Film"."cannesNominations"
      + "Film"."berlinNominations"
    ) >= ${query.nominationCount}
  `;
}

/**
 * Cross-ceremony consensus: how many of the four juries recognised the film at
 * all, nomination or win.
 *
 * Deliberately not a sum — 20 Oscar nominations is one ceremony's verdict twenty
 * times over, and nominationCount already asks that question. This asks the one
 * only a four-body catalogue can answer: did juries with different tastes agree.
 * The distribution earns the filter — 7,129 films at one ceremony, 1,734 at two,
 * 315 at three, 2 at all four — so each step up is a real cut, not a rounding of
 * the same set.
 *
 * Nominations, not wins, are what "recognised" means here: a Palme d'Or nominee
 * was in the room at Cannes whether or not it left with the trophy, and every win
 * in this catalogue carries its nomination, so the win counts would only ever
 * narrow the same four flags.
 */
function ceremonyCountPredicate(query: ListQuery): Prisma.Sql | undefined {
  if (query.ceremonyCount === undefined) return undefined;

  return Prisma.sql`
    (
      (CASE WHEN "Film"."oscarNominations"  > 0 THEN 1 ELSE 0 END)
      + (CASE WHEN "Film"."ggNominations"     > 0 THEN 1 ELSE 0 END)
      + (CASE WHEN "Film"."cannesNominations" > 0 THEN 1 ELSE 0 END)
      + (CASE WHEN "Film"."berlinNominations" > 0 THEN 1 ELSE 0 END)
    ) >= ${query.ceremonyCount}
  `;
}

function imdbTopMoviesPredicate(query: ListQuery): Prisma.Sql | undefined {
  if (query.imdbTopMoviesOnly !== true) return undefined;

  return Prisma.sql`"Film"."imdbTopMovieRank" IS NOT NULL`;
}

function imdbTopTvPredicate(query: ListQuery): Prisma.Sql | undefined {
  if (query.imdbTopTvOnly !== true) return undefined;

  return Prisma.sql`"Film"."imdbTopTvRank" IS NOT NULL`;
}

// Obscurity: keep only films outside the IMDb Top 250 (movies and TV both) —
// the famous canon is excluded, leaving room for genuine discoveries.
function imdbTopExcludePredicate(query: ListQuery): Prisma.Sql | undefined {
  if (query.imdbTopExclude !== true) return undefined;

  return Prisma.sql`"Film"."imdbTopMovieRank" IS NULL AND "Film"."imdbTopTvRank" IS NULL`;
}

/**
 * Total major award wins, at least this many — the counterpart to the nomination
 * floor. Nominations measure how often a film was in the room; wins measure how
 * often it left with something, and 54% of the catalogue never did, so this is
 * the sharper of the two.
 *
 * Summed across all four bodies for the same reason nominationCount is: the
 * stored counts are per body, and a film's standing is the total.
 */
function winsMinPredicate(query: ListQuery): Prisma.Sql | undefined {
  if (query.winsMin === undefined) return undefined;

  return Prisma.sql`
    (
      "Film"."oscarWins"
      + "Film"."ggWins"
      + "Film"."cannesWins"
      + "Film"."berlinWins"
    ) >= ${query.winsMin}
  `;
}

// Obscurity: cap total major award wins. A film that swept the Oscars/Cannes is
// famous by definition; `winsMax: 0` keeps only films that won none.
function winsMaxPredicate(query: ListQuery): Prisma.Sql | undefined {
  if (query.winsMax === undefined) return undefined;

  return Prisma.sql`
    (
      "Film"."oscarWins"
      + "Film"."ggWins"
      + "Film"."cannesWins"
      + "Film"."berlinWins"
    ) <= ${query.winsMax}
  `;
}
