import { LOCAL_GENRE_PATTERNS } from "../patterns";
import type { Stage1Filters } from "../schemas";
import { findAllPatternMatches } from "./patternMatches";

type GenreSplit = Pick<Stage1Filters, "requiredGenres" | "preferredGenres">;

const ATTRIBUTE_MARKER =
  /\b(?:with|should have|that has|featuring|including|full of|plus some|has)\b/i;

export const extractGenreSplit = (prompt: string): GenreSplit => {
  const markerIndex = prompt.search(ATTRIBUTE_MARKER);
  const head = markerIndex === -1 ? prompt : prompt.slice(0, markerIndex);
  const tail = markerIndex === -1 ? "" : prompt.slice(markerIndex);
  const requiredGenres = findAllPatternMatches(head, LOCAL_GENRE_PATTERNS) ?? [];
  const tailGenres = findAllPatternMatches(tail, LOCAL_GENRE_PATTERNS) ?? [];
  const preferredGenres = tailGenres.filter(
    genre => !requiredGenres.includes(genre),
  );

  return {
    requiredGenres: requiredGenres.length > 0 ? requiredGenres : undefined,
    preferredGenres: preferredGenres.length > 0 ? preferredGenres : undefined,
  };
};
