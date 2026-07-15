import type { Film } from "@cineroll/types";
import { FILM_API_URL, FILM_REVALIDATE_SECONDS } from "./config";
import type { SimilarFilm } from "./domain-types";

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
