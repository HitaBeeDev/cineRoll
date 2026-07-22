import type { FilterState, PaginatedFilms } from "@cineroll/types";
import { API_URL } from "./constants";
import { filtersToParams } from "./filters-to-params";
import type { RollFilm } from "./roll-types";

export async function fetchFilmBySlug(slug: string): Promise<RollFilm> {
  const response = await fetch(
    `${API_URL}/api/films/${encodeURIComponent(slug)}`,
    { cache: "no-store" },
  );
  if (!response.ok) throw new Error("Failed to fetch film");
  return response.json() as Promise<RollFilm>;
}

export async function fetchFilms(
  filters: Partial<FilterState>,
  limit = 12,
): Promise<PaginatedFilms> {
  const params = filtersToParams(filters);
  params.set("limit", String(limit));
  if (filters.page && filters.page > 1) params.set("page", String(filters.page));

  const response = await fetch(`${API_URL}/api/films?${params}`, {
    cache: "no-store",
  });
  if (!response.ok) throw new Error("Failed to fetch films");
  return response.json() as Promise<PaginatedFilms>;
}

export async function fetchOnboardingTasteCards(): Promise<
  PaginatedFilms["films"]
> {
  const params = new URLSearchParams({ sample: "onboarding", limit: "8" });
  const response = await fetch(`${API_URL}/api/films?${params}`, {
    cache: "no-store",
  });
  if (!response.ok) return [];
  const data = (await response.json()) as PaginatedFilms;
  return data.films;
}
