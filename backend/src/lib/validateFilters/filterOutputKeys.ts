import type { ValidatedFilterKey } from "./validatedFilterKey";

// Extraction keys that differ from the query parameters they populate.
export const FILTER_OUTPUT_KEYS: Partial<Record<ValidatedFilterKey, string>> = {
  genres: "genre",
  genresAll: "genreAll",
};
