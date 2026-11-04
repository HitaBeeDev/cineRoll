import type { MetadataRoute } from "next";
import { fetchSitemapEntries } from "@/lib/seo/fetch-sitemap-entries";
import { absoluteUrl } from "@/lib/seo/absolute-url";

// Same rendering rule as the films sitemap. The backend already leaves out
// people with a single award credit — thin pages that would flood the index.
export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const persons = await fetchSitemapEntries("persons");
  return persons.map((person) => ({
    url: absoluteUrl(`/person/${person.slug}`),
    lastModified: person.updatedAt,
  }));
}
