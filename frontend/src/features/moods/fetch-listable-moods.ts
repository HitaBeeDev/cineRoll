import { fetchCollectionFilms } from "@/features/collections/fetch-collection-films";
import { MIN_COLLECTION_FILMS } from "@/features/collections/fetch-collection-sizes";
import { MOODS } from "./moods";

/**
 * Moods with at least five films, for the index and the sitemap. A mood whose
 * size can't be fetched is kept rather than hidden by a passing outage.
 */
export async function fetchListableMoods() {
  const sizes = await Promise.all(
    MOODS.map((mood) =>
      fetchCollectionFilms({ moodTag: mood.tag }, "wins", 1)
        .then((page) => page.total)
        .catch(() => null),
    ),
  );
  return MOODS.filter((_, index) => {
    const size = sizes[index];
    return size === null || size === undefined || size >= MIN_COLLECTION_FILMS;
  });
}
