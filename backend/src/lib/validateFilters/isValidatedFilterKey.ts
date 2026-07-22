import type { ValidatedFilterKey } from "./validatedFilterKey";

const VALIDATED_FILTER_KEYS = new Set<string>([
  "awardBody",
  "awardYear",
  "category",
  "contentType",
  "decadeMax",
  "decadeMin",
  "genres",
  "genresAll",
  "language",
]);

export const isValidatedFilterKey = (key: string): key is ValidatedFilterKey =>
  VALIDATED_FILTER_KEYS.has(key);
