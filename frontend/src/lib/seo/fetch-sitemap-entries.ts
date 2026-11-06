import { API_URL } from "@/lib/api/constants/api-url";

type SitemapEntry = { slug: string; updatedAt: string };

// A day: one API call per sitemap per day, so a seed shows up by tomorrow.
// Next only caches 200 responses, so a failed call is retried on the next hit
// rather than an empty list being saved.
const SITEMAP_REVALIDATE_SECONDS = 86400;

/** Fail the sitemap request on outages rather than publish an empty catalogue. */
export async function fetchSitemapEntries(kind: "films" | "persons"): Promise<SitemapEntry[]> {
  const response = await fetch(`${API_URL}/api/sitemap/${kind}`, {
    next: { revalidate: SITEMAP_REVALIDATE_SECONDS },
  });
  if (!response.ok) throw new Error(`Sitemap ${kind}: backend returned ${response.status}`);
  return (await response.json()) as SitemapEntry[];
}
