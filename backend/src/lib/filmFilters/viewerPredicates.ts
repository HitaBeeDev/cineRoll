import { Prisma } from "@prisma/client";

import { ListQuery } from "./listQuerySchema";

/**
 * Filters that depend on WHO is asking, rather than on the catalogue.
 *
 * They are built from the authenticated viewer id and the query together, and
 * they are the reason a request carrying one cannot be cached publicly: two
 * people sending identical query strings must get different result sets.
 *
 * The id is a parameter here, never a query field. Reading it off the query
 * would let anyone filter by anyone else's watch history simply by typing a
 * different id into the URL.
 */
export function viewerPredicates(query: ListQuery, viewerId?: string): Prisma.Sql[] {
  if (query.excludeWatched !== true || !viewerId) return [];

  return [
    Prisma.sql`
      NOT EXISTS (
        SELECT 1 FROM "WatchedFilm"
        WHERE "WatchedFilm"."filmId" = "Film"."id"
          AND "WatchedFilm"."userId" = ${viewerId}
      )
    `,
  ];
}

/** Does this request resolve differently per viewer? Decides public vs private caching. */
export function isViewerScoped(query: ListQuery, viewerId?: string): boolean {
  return viewerPredicates(query, viewerId).length > 0;
}
