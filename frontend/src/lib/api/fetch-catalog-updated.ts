import { API_URL } from "@/lib/api/constants/api-url";

/**
 * When the catalogue last changed (the newest film update), for hub pages that
 * are built from the whole catalogue. Cached for a day; null on failure, so the
 * page just leaves the date out.
 */
export async function fetchCatalogUpdated(): Promise<string | null> {
  try {
    const response = await fetch(`${API_URL}/api/stats/updated`, { next: { revalidate: 86400 } });
    if (!response.ok) return null;
    const { updatedAt } = (await response.json()) as { updatedAt: string | null };
    return updatedAt;
  } catch {
    return null;
  }
}
