import type { MetadataRoute } from "next";
import { fetchRegionServices } from "@/features/streaming/fetch-region-services";
import { absoluteUrl } from "@/lib/seo/absolute-url";
import { STREAMING_REGIONS } from "@/lib/streaming/streaming-regions";

// Rendered per request so a backend outage never fails the build; the facet
// calls behind it are cached for a day.
export const dynamic = "force-dynamic";

/**
 * /streaming, then every country with at least one service page, then those
 * service pages — the same MIN_STREAMING_FILMS cut the pages 404 under, so the
 * sitemap never lists a page that doesn't exist. A country whose lookup fails
 * is left out this time and retried on the next fetch.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const perRegion = await Promise.all(
    STREAMING_REGIONS.map(async (region) => {
      const services = await fetchRegionServices(region).catch(() => []);
      if (services.length === 0) return [];
      const base = `/streaming/${region.toLowerCase()}`;
      return [base, ...services.map((service) => `${base}/${service.slug}`)];
    }),
  );
  return ["/streaming", ...perRegion.flat()].map((path) => ({ url: absoluteUrl(path) }));
}
