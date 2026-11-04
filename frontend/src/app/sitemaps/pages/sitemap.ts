import type { MetadataRoute } from "next";
import { fetchListableCollections } from "@/features/collections/fetch-collection-sizes";
import { TOOLS } from "@/features/tools/tools";
import { SITE_URL } from "@/lib/site-url";

// The hand-built public pages. No lastModified: there is no real date to give,
// and a fake "now" teaches Google to ignore the dates in every other sitemap.
const PATHS = [
  "/",
  "/browse",
  "/picks",
  "/ask-ai",
  "/stats",
  "/about",
  "/tools",
  ...TOOLS.map((tool) => `/tools/${tool.slug}`),
  "/collections",
];

// Rendered per request: the collection sizes behind it are cached API calls,
// and a build must never depend on the backend.
export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Only collections big enough to have a page; thin ones would 404.
  const collections = await fetchListableCollections();
  const paths = [...PATHS, ...collections.map((collection) => `/collections/${collection.slug}`)];
  return paths.map((path) => ({ url: `${SITE_URL}${path}` }));
}
