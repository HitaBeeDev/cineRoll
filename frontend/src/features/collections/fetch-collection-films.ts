import type { PaginatedFilms } from "@cineroll/types";
import { API_URL } from "@/lib/api/constants/api-url";
import type { CollectionSort } from "./collection-types";

// A day: collections only change on a seed.
const COLLECTION_REVALIDATE_SECONDS = 86400;
// The API's page cap; every collection here is under it (Best Picture: ~100).
const COLLECTION_LIMIT = 100;

/**
 * A collection's films in its own order (`limit` 1 for just the total). Throws on failure, so a backend outage
 * shows the error page and is retried — never cached as an empty collection.
 */
export async function fetchCollectionFilms(
  params: Record<string, string>,
  sort: CollectionSort,
  limit = COLLECTION_LIMIT,
): Promise<PaginatedFilms> {
  const query = new URLSearchParams({ ...params, sort, limit: String(limit) });
  const response = await fetch(`${API_URL}/api/films?${query}`, {
    next: { revalidate: COLLECTION_REVALIDATE_SECONDS },
  });
  if (!response.ok) throw new Error(`Collection fetch failed: ${response.status}`);
  return (await response.json()) as PaginatedFilms;
}
