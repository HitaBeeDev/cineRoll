import type { WatchRegion } from "@cineroll/types";

import { adTierBase } from "./adTierBase";

/** The slice of TMDB's /{movie|tv}/{id}/watch/providers response we read. */
export type TmdbWatchResponse = {
  results?: Record<
    string,
    {
      flatrate?: { provider_id: number; provider_name: string; logo_path: string | null; display_priority?: number }[];
    }
  >;
};

const COUNTRY = /^[A-Z]{2}$/;

/**
 * TMDB's per-country provider lists → our regions. Subscription ("flatrate")
 * only, same as the seed; TMDB's display order kept, one entry per service,
 * countries sorted so an unchanged answer serializes identically. An ad tier
 * ("Amazon Prime Video with Ads") is dropped when its main service is listed
 * too — it is the same catalogue, and kept it made a duplicate service page.
 * An ad tier on its own stays: it is the only way to watch the film there.
 */
export function tmdbWatchRegions(response: TmdbWatchResponse): WatchRegion[] {
  return Object.entries(response.results ?? {})
    .filter(([country]) => COUNTRY.test(country))
    .map(([country, data]) => {
      const seen = new Set<number>();
      const providers = [...(data.flatrate ?? [])]
        .sort((a, b) => (a.display_priority ?? 0) - (b.display_priority ?? 0))
        .filter((p) => p.provider_name && !seen.has(p.provider_id) && seen.add(p.provider_id))
        .map((p) => ({ id: p.provider_id, name: p.provider_name, logoPath: p.logo_path ?? null }));
      const names = new Set(providers.map((p) => p.name));
      return { country, providers: providers.filter((p) => !names.has(adTierBase(p.name) ?? "")) };
    })
    .filter((region) => region.providers.length > 0)
    .sort((a, b) => a.country.localeCompare(b.country));
}
