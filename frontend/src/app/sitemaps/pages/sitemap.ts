import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site-url";

// The hand-built public pages. No lastModified: there is no real date to give,
// and a fake "now" teaches Google to ignore the dates in every other sitemap.
const PATHS = ["/", "/browse", "/picks", "/ask-ai", "/stats", "/about"];

export default function sitemap(): MetadataRoute.Sitemap {
  return PATHS.map((path) => ({ url: `${SITE_URL}${path}` }));
}
