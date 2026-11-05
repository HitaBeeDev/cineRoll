import { buildPersonCreditIndex } from "./buildPersonCreditIndex";
import { loadPersonCreditIndexFromTables } from "./loadPersonCreditIndexFromTables";
import type { PersonCreditIndex } from "./personCreditTypes";
import { findAllAwardCreditRows, findAllDirectors } from "./personRepository";

// A day. Credits only change on a seed; ~22k rows, one query per instance per day.
const CREDIT_INDEX_TTL_MS = 24 * 60 * 60 * 1000;

let cache: { index: PersonCreditIndex; builtAt: number } | null = null;
let inFlight: Promise<PersonCreditIndex> | null = null;

/** The memoized person index: names for slugs, and each person's award rows. */
export async function getPersonCreditIndex(): Promise<PersonCreditIndex> {
  if (cache && Date.now() - cache.builtAt < CREDIT_INDEX_TTL_MS) return cache.index;
  if (inFlight) return inFlight; // collapse concurrent rebuilds into one load

  // The Credit tables when `link-credits --apply` has filled them; otherwise
  // (before the first apply, or right after a seed) parse the award JSON.
  inFlight = loadPersonCreditIndexFromTables()
    .then(async fromTables => {
      if (fromTables) return fromTables;
      const [rows, directors] = await Promise.all([findAllAwardCreditRows(), findAllDirectors()]);
      return buildPersonCreditIndex(rows, directors);
    })
    .then(index => {
      cache = { index, builtAt: Date.now() };
      return index;
    })
    .finally(() => {
      inFlight = null;
    });

  return inFlight;
}
