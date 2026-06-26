import { Prisma } from "@prisma/client";

import { ListQuery } from "./listQuerySchema";

export function rankingPredicates(query: ListQuery): Prisma.Sql[] {
  return [
    nominationCountPredicate(query),
    imdbTopMoviesPredicate(query),
    imdbTopTvPredicate(query),
    imdbTopExcludePredicate(query),
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
