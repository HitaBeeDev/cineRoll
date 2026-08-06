import type { ReferenceOutcome } from "./referenceFilm/referenceTypes";
import type { SoftPreferences } from "./softPreferences";

// contentType is deliberately not signal. "suggest some movies" sets it, but it
// says nothing about WHICH film — treating it as signal would let the empty case
// go on claiming confidence it doesn't have.
const NON_SIGNAL_FILTER_KEYS = new Set(["contentType"]);

/** Did the request give us anything to rank on?
 *
 *  When every filter, preference and reference comes back empty, the reranker
 *  still returns a full set of picks — ordered by the only term left in the
 *  scoring function, the IMDb quality tie-breaker. That output is "the
 *  highest-rated award films", which is a real answer to a question the user
 *  did not ask. Detecting the case lets the response say so instead of
 *  presenting the fallback as a match. */
export const hasInterpretationSignal = (
  appliedFilters: Record<string, unknown>,
  preferences: SoftPreferences,
  reference: ReferenceOutcome,
): boolean =>
  hasFilterSignal(appliedFilters)
  || hasPreferenceSignal(preferences)
  || reference.kind === "resolved"
  || reference.kind === "external";

function hasFilterSignal(appliedFilters: Record<string, unknown>): boolean {
  return Object.entries(appliedFilters).some(
    ([key, value]) => !NON_SIGNAL_FILTER_KEYS.has(key) && isMeaningful(value),
  );
}

function hasPreferenceSignal(preferences: SoftPreferences): boolean {
  return [
    preferences.requiredGenres,
    preferences.preferredGenres,
    preferences.tones,
    preferences.themes,
    preferences.keywords,
  ].some(list => list.length > 0);
}

function isMeaningful(value: unknown): boolean {
  if (value === null || value === undefined || value === "") return false;
  if (Array.isArray(value)) return value.length > 0;

  return true;
}
