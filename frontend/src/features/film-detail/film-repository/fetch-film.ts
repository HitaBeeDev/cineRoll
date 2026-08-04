import type { Film } from "@cineroll/types";
import { FILM_API_URL } from "@/features/film-detail/config/film-api-url";
import { FILM_REVALIDATE_SECONDS } from "@/features/film-detail/config/film-revalidate-seconds";

export async function fetchFilm(slug: string): Promise<Film | null> {
  const response = await fetch(
    `${FILM_API_URL}/api/films/${encodeURIComponent(slug)}`,
    { next: { revalidate: FILM_REVALIDATE_SECONDS } },
  );

  if (response.status === 404) return null;
  if (!response.ok) {
    throw new Error(`Failed to fetch film: ${response.status}`);
  }
  return (await response.json()) as Film;
}
