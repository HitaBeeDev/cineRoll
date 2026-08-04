import { FILM_API_URL } from "@/features/film-detail/config/film-api-url";
import { FILM_REVALIDATE_SECONDS } from "@/features/film-detail/config/film-revalidate-seconds";
import type { SimilarFilm } from "../domain-types";

export async function fetchSimilarFilms(slug: string): Promise<SimilarFilm[]> {
  try {
    const response = await fetch(
      `${FILM_API_URL}/api/films/${encodeURIComponent(slug)}/similar`,
      { next: { revalidate: FILM_REVALIDATE_SECONDS } },
    );
    if (!response.ok) return [];
    return (await response.json()) as SimilarFilm[];
  } catch {
    return [];
  }
}
