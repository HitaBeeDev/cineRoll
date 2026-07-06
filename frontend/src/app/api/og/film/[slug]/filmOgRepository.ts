import type { Film } from "@cineroll/types";

import { API_URL } from "./filmOgConfig";

export async function fetchFilmBySlug(slug: string): Promise<Film | null> {
  const response = await fetch(`${API_URL}/api/films/${encodeURIComponent(slug)}`, {
    next: { revalidate: 86400 },
  });

  if (response.status === 404) return null;
  if (!response.ok) throw new Error(`Failed to fetch film: ${response.status}`);

  return (await response.json()) as Film;
}
