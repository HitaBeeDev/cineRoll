import type { SoftPreferences } from "../softPreferences";
import type { ReferenceOutcome } from "./referenceTypes";

// How many of the reference's own genres are worth carrying. Every preferred
// genre a candidate misses costs it points, so pushing a film's full genre list
// through would punish anything that isn't a near-clone.
const MAX_REFERENCE_GENRES = 3;

/** Fold what we learned about the named film into the ranking signals.
 *
 *  For a resolved reference the SQL neighbourhood has already done the
 *  retrieval; these preferences only order it. For an external one they are the
 *  entire signal — the honest substitute for a neighbourhood we cannot compute
 *  against a film the catalogue does not hold. */
export const withReferencePreferences = (
  preferences: SoftPreferences,
  reference: ReferenceOutcome,
): SoftPreferences => {
  const attributes = referenceAttributes(reference);
  if (!attributes) return preferences;

  return {
    ...preferences,
    // Merged as *preferred*, never required: "like John Wick" asks for a family
    // resemblance, not for every one of its genres at once.
    preferredGenres: mergeUnique(
      preferences.preferredGenres,
      attributes.genres.slice(0, MAX_REFERENCE_GENRES),
    ),
    keywords: mergeUnique(preferences.keywords, attributes.keywords),
  };
};

function referenceAttributes(
  reference: ReferenceOutcome,
): { genres: string[]; keywords: string[] } | null {
  if (reference.kind === "resolved") {
    return {
      genres: reference.film.genres,
      keywords: [...reference.film.moodTags, ...reference.film.keywords],
    };
  }

  if (reference.kind === "external") {
    return { genres: reference.reference.genres, keywords: reference.reference.keywords };
  }

  return null;
}

function mergeUnique(existing: string[], added: string[]): string[] {
  const seen = new Map(existing.map(value => [value.toLowerCase(), value]));
  for (const value of added) {
    if (!seen.has(value.toLowerCase())) seen.set(value.toLowerCase(), value);
  }

  return [...seen.values()];
}
