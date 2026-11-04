import type { PaginatedFilms } from "@cineroll/types";
import { API_URL } from "@/lib/api/constants/api-url";
import { PAGE_SIZE } from "@/lib/browse/options/page-size";

// Once a day: the browse page is regenerated at most daily, so a backend that
// was down at build time heals within a day instead of serving an empty grid
// for months. One cheap API call per day either way.
const PREVIEW_REVALIDATE_SECONDS = 86400;

/**
 * First page of the default browse view (most wins first), fetched on the
 * server so crawlers and first paint get real film links instead of an empty
 * shell. Null on any failure — the page still renders, just without the grid.
 */
export async function fetchBrowsePreview(): Promise<PaginatedFilms | null> {
  try {
    const response = await fetch(`${API_URL}/api/films?sort=wins&limit=${PAGE_SIZE}`, {
      next: { revalidate: PREVIEW_REVALIDATE_SECONDS },
    });
    if (!response.ok) return null;
    return (await response.json()) as PaginatedFilms;
  } catch {
    return null;
  }
}
