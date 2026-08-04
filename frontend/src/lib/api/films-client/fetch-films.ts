import type { FilterState, PaginatedFilms } from "@cineroll/types";
import { API_URL } from "@/lib/api/constants/api-url";
import { filtersToParams } from "../filters-to-params";

export async function fetchFilms(
  filters: Partial<FilterState>,
  limit = 12,
): Promise<PaginatedFilms> {
  const params = filtersToParams(filters);
  params.set("limit", String(limit));
  if (filters.page && filters.page > 1) params.set("page", String(filters.page));

  // "Hide what I've watched" is the one browse query whose answer depends on who
  // is asking, and the browser has no way to prove that to the backend. Those
  // requests go through the same-origin proxy, which attaches the session; every
  // other query keeps hitting the backend directly, cache and all.
  const base = filters.excludeWatched ? "/api/films" : `${API_URL}/api/films`;

  const response = await fetch(`${base}?${params}`, {
    cache: "no-store",
  });
  if (!response.ok) throw new Error("Failed to fetch films");
  return response.json() as Promise<PaginatedFilms>;
}
