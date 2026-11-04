import { COLLECTIONS } from "./collections";
import { fetchCollectionFilms } from "./fetch-collection-films";

/** Below this a collection is too thin to be worth a page, a link or a sitemap entry. */
export const MIN_COLLECTION_FILMS = 5;

/**
 * The collections big enough to list, for the index page and the sitemap.
 * A collection whose size can't be fetched is kept: it most likely exists, and
 * dropping it would hide a good page because of a passing outage.
 */
export async function fetchListableCollections() {
  const sizes = await Promise.all(
    COLLECTIONS.map((collection) =>
      fetchCollectionFilms(collection.params, collection.sort, 1)
        .then((page) => page.total)
        .catch(() => null),
    ),
  );
  return COLLECTIONS.filter((_, index) => {
    const size = sizes[index];
    return size === null || size === undefined || size >= MIN_COLLECTION_FILMS;
  });
}
