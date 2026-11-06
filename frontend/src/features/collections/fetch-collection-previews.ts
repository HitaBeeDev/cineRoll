import type { Film } from "@cineroll/types";
import { COLLECTIONS } from "./collections";
import { MIN_COLLECTION_FILMS } from "./fetch-collection-sizes";
import { fetchCollectionFilms } from "./fetch-collection-films";

/** Use the same query for inclusion and artwork, rather than fetching sizes twice. */
export async function fetchCollectionPreviews() {
  const previews = await Promise.all(COLLECTIONS.map(async (collection) => {
    try {
      const page = await fetchCollectionFilms(collection.params, collection.sort, 4);
      return { collection, films: page.films, total: page.total };
    } catch {
      // Keep the navigation available during an artwork/catalogue outage.
      return { collection, films: [] as Film[], total: null };
    }
  }));
  return previews.filter(({ total }) => total === null || total >= MIN_COLLECTION_FILMS);
}
