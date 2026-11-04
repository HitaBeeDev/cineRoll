import { API_URL } from "@/lib/api/constants/api-url";

type SitemapEntry = { slug: string; updatedAt: string };

// A day: one API call per sitemap per day, so a seed shows up by tomorrow.
// Next only caches 200 responses, so a failed call is retried on the next hit
// rather than an empty list being saved.
const SITEMAP_REVALIDATE_SECONDS = 86400;

/** Slugs and real last-changed dates for one page family. Empty on failure. */
export async function fetchSitemapEntries(kind: "films" | "persons"): Promise<SitemapEntry[]> {
  try {
    const response = await fetch(`${API_URL}/api/sitemap/${kind}`, {
      next: { revalidate: SITEMAP_REVALIDATE_SECONDS },
    });
    if (!response.ok) return [];
    return (await response.json()) as SitemapEntry[];
  } catch {
    return [];
  }
}
