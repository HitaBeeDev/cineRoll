import { buildPersonNameIndex } from "./buildPersonNameIndex";
import { findAllAwardNames } from "./personRepository";

// A day. Names only change on a seed; one query per server instance per day.
const NAME_INDEX_TTL_MS = 24 * 60 * 60 * 1000;

let cache: { index: Map<string, string>; builtAt: number } | null = null;
let inFlight: Promise<Map<string, string>> | null = null;

/** The memoized slug → name index for person pages and the persons sitemap. */
export async function getPersonNameIndex(): Promise<Map<string, string>> {
  if (cache && Date.now() - cache.builtAt < NAME_INDEX_TTL_MS) return cache.index;
  if (inFlight) return inFlight; // collapse concurrent rebuilds into one query

  inFlight = findAllAwardNames()
    .then(names => {
      const index = buildPersonNameIndex(names);
      cache = { index, builtAt: Date.now() };
      return index;
    })
    .finally(() => {
      inFlight = null;
    });

  return inFlight;
}
