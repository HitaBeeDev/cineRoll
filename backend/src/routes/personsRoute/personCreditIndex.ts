import { buildPersonCreditIndex } from "./buildPersonCreditIndex";
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

  inFlight = Promise.all([findAllAwardCreditRows(), findAllDirectors()])
    .then(([rows, directors]) => {
      const index = buildPersonCreditIndex(rows, directors);
      cache = { index, builtAt: Date.now() };
      return index;
    })
    .finally(() => {
      inFlight = null;
    });

  return inFlight;
}
