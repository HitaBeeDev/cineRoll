import type { Film } from "@cineroll/types";
import { fetchCollectionFilms } from "@/features/collections/fetch-collection-films";
import { pickDaily } from "./pick-daily";

/**
 * Today's picks for one country: award winners rated 7+ on IMDb that stream
 * by subscription there, a daily-rotating 12 from the best-rated 100. Feature
 * films only — "tonight" is one sitting.
 */
export async function fetchTonightPicks(region: string): Promise<{ films: Film[]; pool: number }> {
  const { films, total } = await fetchCollectionFilms(
    { streamsIn: region, winnerOnly: "true", imdbRatingMin: "7", contentType: "movie" },
    "wins",
    100,
  );
  return { films: pickDaily(films, 12, new Date()), pool: total };
}
