import type { FacetCounts } from "@cineroll/types";
import { API_URL } from "@/lib/api/constants/api-url";
import { adTierBase } from "@/lib/streaming/ad-tier-base";
import { nameToSlug } from "@/lib/utils/name-to-slug";
import { MIN_STREAMING_FILMS } from "./min-streaming-films";
import type { StreamingService } from "./streaming-types";

// A day — the streaming refresh runs daily.
const REVALIDATE_SECONDS = 86400;

/**
 * Services in one country with enough award films for a page, most films
 * first. Read from the providers facet (no other filters), so the counts are
 * the same ones browse shows. Two services whose names slug the same keep the
 * bigger one — a URL has to name exactly one. An ad tier whose main service
 * is listed too ("Amazon Prime Video with Ads") is the same catalogue: no page.
 */
export async function fetchRegionServices(region: string): Promise<StreamingService[]> {
  const response = await fetch(`${API_URL}/api/films/facets?region=${region}`, {
    next: { revalidate: REVALIDATE_SECONDS },
  });
  if (!response.ok) throw new Error(`Streaming services ${response.status} for ${region}`);
  const { providers } = (await response.json()) as FacetCounts;

  const names = new Set(providers.map((provider) => provider.name));
  const bySlug = new Map<string, StreamingService>();
  for (const provider of providers) {
    if (provider.count < MIN_STREAMING_FILMS) continue;
    if (names.has(adTierBase(provider.name) ?? "")) continue;
    const slug = nameToSlug(provider.name);
    if (!slug) continue;
    const current = bySlug.get(slug);
    if (current && current.films >= provider.count) continue;
    bySlug.set(slug, {
      id: Number(provider.value),
      slug,
      name: provider.name,
      logoPath: provider.logoPath,
      films: provider.count,
    });
  }
  return [...bySlug.values()].sort((a, b) => b.films - a.films || a.name.localeCompare(b.name));
}
