import type { AllowedFilterValues } from "../allowedFilterValues";
import { GENRE_ALIASES } from "./genreAliases";
import { resolveAgainstAllowedSet } from "./resolveAgainstAllowedSet";

// Invalid genres are dropped independently so one hallucination does not
// discard otherwise valid OR/AND genre constraints.
export const resolveGenres = (
  value: unknown,
  allowed: AllowedFilterValues,
): string[] | null => {
  const requestedGenres = Array.isArray(value) ? value : [value];
  const resolvedGenres = requestedGenres
    .map(genre => resolveAgainstAllowedSet(
      String(genre),
      allowed.genres,
      GENRE_ALIASES,
    ))
    .filter((genre): genre is string => genre !== null);

  return resolvedGenres.length > 0 ? [...new Set(resolvedGenres)] : null;
};
