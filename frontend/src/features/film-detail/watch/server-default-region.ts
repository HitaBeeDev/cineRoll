import type { WatchRegion } from "@cineroll/types";

/**
 * The region the server renders before it knows who is looking: the US when
 * the title streams there, else the first in the list. The client swaps in the
 * viewer's own country after hydration.
 */
export function serverDefaultRegion(regions: WatchRegion[]): string {
  return regions.some((region) => region.country === "US") ? "US" : regions[0]!.country;
}
