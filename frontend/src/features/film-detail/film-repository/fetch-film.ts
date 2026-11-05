import type { Film } from "@cineroll/types";
import { FILM_API_URL } from "@/features/film-detail/config/film-api-url";
import { FILM_REVALIDATE_SECONDS } from "@/features/film-detail/config/film-revalidate-seconds";

// Part of the fetch URL, so part of Next's data-cache key. Bump it when the film
// payload gains fields: Vercel keeps cached responses across deploys, so pages
// otherwise go on rendering the old shape until each entry expires (v2: cast
// `hasPage`, `updatedAt` and `watchProviders` — all missing live on 2026-11-05).
const FILM_PAYLOAD_VERSION = 2;

export async function fetchFilm(slug: string): Promise<Film | null> {
  const response = await fetch(
    `${FILM_API_URL}/api/films/${encodeURIComponent(slug)}?v=${FILM_PAYLOAD_VERSION}`,
    { next: { revalidate: FILM_REVALIDATE_SECONDS } },
  );

  if (response.status === 404) return null;
  if (!response.ok) {
    throw new Error(`Failed to fetch film: ${response.status}`);
  }
  return (await response.json()) as Film;
}
