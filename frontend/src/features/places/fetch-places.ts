import { API_URL } from "@/lib/api/constants/api-url";
import { MIN_COLLECTION_FILMS } from "@/features/collections/fetch-collection-sizes";
import { languageName } from "./language-name";
import type { Place, PlaceKind } from "./place-types";

// A day: the catalogue's countries and languages only change on a seed.
const PLACES_REVALIDATE_SECONDS = 86400;

type Facet = { value: string; count: number };

function slugify(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

/**
 * Every country or language with at least five films, biggest first — the set
 * that gets a page. Read from the browse facets, so a page exists exactly when
 * browse can filter to it. Throws on failure so an outage is never cached.
 */
export async function fetchPlaces(kind: PlaceKind): Promise<Place[]> {
  const response = await fetch(`${API_URL}/api/films/facets`, {
    next: { revalidate: PLACES_REVALIDATE_SECONDS },
  });
  if (!response.ok) throw new Error(`Facets fetch failed: ${response.status}`);
  const facets = (await response.json()) as Record<PlaceKind, Facet[]>;

  return facets[kind]
    .filter((facet) => facet.count >= MIN_COLLECTION_FILMS)
    .flatMap((facet) => {
      const name = kind === "languages" ? languageName(facet.value) : facet.value;
      return name ? [{ slug: slugify(name), value: facet.value, name, films: facet.count }] : [];
    })
    .sort((a, b) => b.films - a.films);
}
