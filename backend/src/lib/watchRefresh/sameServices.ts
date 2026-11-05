import type { WatchRegion } from "@cineroll/types";

function key(regions: WatchRegion[]): string {
  return regions
    .map((region) => `${region.country}:${region.providers.map((p) => p.name).sort().join("|")}`)
    .sort()
    .join(";");
}

/**
 * Whether two answers name the same services in the same countries. Ids,
 * logos and order are ignored: filling in a logo is not a change a visitor
 * would notice, and must not bump the film's "last updated" date.
 */
export function sameServices(a: WatchRegion[], b: WatchRegion[]): boolean {
  return key(a) === key(b);
}
