import type { MetadataRoute } from "next";
import { API_URL } from "@/lib/api/constants/api-url";
import { SITE_URL } from "@/lib/site-url";

// Rendered per request so a backend outage never fails the build; the API call
// is cached for a day and only 200s are cached, so a failure is retried.
export const dynamic = "force-dynamic";

/** Every award page with enough films to exist, as listed by the backend. */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  try {
    const response = await fetch(`${API_URL}/api/sitemap/awards`, { next: { revalidate: 86400 } });
    if (!response.ok) return [];
    const paths = (await response.json()) as string[];
    return paths.map((path) => ({ url: `${SITE_URL}${path}` }));
  } catch {
    return [];
  }
}
