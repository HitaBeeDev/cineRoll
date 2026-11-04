import type { MetadataRoute } from "next";
import { fetchSitemapEntries } from "@/lib/seo/fetch-sitemap-entries";
import { absoluteUrl } from "@/lib/seo/absolute-url";

// Rendered per request so a backend outage can never fail the build or bake an
// empty sitemap in; the one API call behind it is cached (see fetchSitemapEntries).
export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const films = await fetchSitemapEntries("films");
  return films.map((film) => ({
    url: absoluteUrl(`/film/${film.slug}`),
    lastModified: film.updatedAt,
  }));
}
