import type { FilmListPayload } from "./filmListPayload";

type CountRow = { count: bigint };

export const createFilmListPayload = (
  films: unknown[],
  countRows: CountRow[],
  page: number,
  pageSize: number,
): FilmListPayload => {
  const total = Number(countRows[0]?.count ?? 0);

  return {
    films,
    total,
    page,
    totalPages: Math.ceil(total / pageSize),
    pageSize,
  };
};
