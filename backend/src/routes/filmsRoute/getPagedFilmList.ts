import { buildWhereClause } from "../../lib/filmFilters/whereClause";
import type { ListQuery } from "../../lib/filmFilters/listQuerySchema";
import { viewerPredicates } from "../../lib/filmFilters/viewerPredicates";
import { countFilms } from "./countFilms";
import { createFilmListPayload } from "./createFilmListPayload";
import type { FilmListPayload } from "./filmListPayload";
import { queryFilmPage } from "./queryFilmPage";

export const getPagedFilmList = async (
  query: ListQuery,
  /** The signed-in viewer, when the request carried a valid token. Only the
   *  per-viewer filters read it (see viewerPredicates). */
  viewerId?: string,
): Promise<FilmListPayload> => {
  const whereSql = buildWhereClause(query, viewerPredicates(query, viewerId));
  const [films, countRows] = await Promise.all([
    queryFilmPage(whereSql, query, query.page),
    countFilms(whereSql),
  ]);

  // A page past the end is served as the last real page rather than as an empty
  // one: the caller's page number is echoed back into "Showing X–Y of N", so an
  // unclamped `?page=999999` reported a window that starts after it ends. The
  // count decides where the end is, so the clamp can only happen here, once it
  // has landed — and only then does it cost a second query.
  const total = Number(countRows[0]?.count ?? 0);
  const lastPage = Math.max(1, Math.ceil(total / query.limit));
  if (query.page > lastPage) {
    const lastFilms = total === 0 ? films : await queryFilmPage(whereSql, query, lastPage);

    return createFilmListPayload(lastFilms, countRows, lastPage, query.limit);
  }

  return createFilmListPayload(films, countRows, query.page, query.limit);
};
