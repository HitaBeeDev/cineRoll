import { Prisma } from "@prisma/client";

import { ListQuery } from "./listQuerySchema";

export function rankingPredicates(query: ListQuery): Prisma.Sql[] {
  return [
    nominationCountPredicate(query),
    imdbTopMoviesPredicate(query),
    imdbTopTvPredicate(query),
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
