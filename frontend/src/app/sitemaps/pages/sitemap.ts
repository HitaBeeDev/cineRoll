import type { MetadataRoute } from "next";
import { fetchListableCollections } from "@/features/collections/fetch-collection-sizes";
import { DECADES } from "@/features/decades/decades";
import { fetchListableMoods } from "@/features/moods/fetch-listable-moods";
import { fetchPlaces } from "@/features/places/fetch-places";
import type { PlaceKind } from "@/features/places/place-types";
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
  "/decades",
  "/countries",
  "/languages",
  "/moods",
  ...DECADES.map((start) => `/decades/${start}s`),
];

// Rendered per request: the collection sizes behind it are cached API calls,
// and a build must never depend on the backend.
export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Only collections big enough to have a page; thin ones would 404.
  const [collections, moods, ...placeLists] = await Promise.all([
    fetchListableCollections(),
    fetchListableMoods(),
    ...(["countries", "languages"] as PlaceKind[]).map((kind) =>
      fetchPlaces(kind)
        .then((places) => places.map((place) => `/${kind}/${place.slug}`))
        .catch(() => []),
    ),
  ]);
  const paths = [
    ...PATHS,
    ...collections.map((collection) => `/collections/${collection.slug}`),
    ...moods.map((mood) => `/moods/${mood.tag}`),
    ...placeLists.flat(),
  ];
  return paths.map((path) => ({ url: `${SITE_URL}${path}` }));
}
