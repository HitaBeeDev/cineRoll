import type { AllowedFilterValues } from "../allowedFilterValues";
import { CATEGORY_ALIASES } from "./categoryAliases";
import { CONTENT_TYPE_ALIASES } from "./contentTypeAliases";
import { resolveAgainstAllowedSet } from "./resolveAgainstAllowedSet";
import { resolveAwardBody } from "./resolveAwardBody";
import { resolveAwardYear } from "./resolveAwardYear";
import { resolveYearBound } from "./resolveYearBound";
import { resolveGenres } from "./resolveGenres";
import { resolveLanguage } from "./resolveLanguage";
import type { ValidatedFilterKey } from "./validatedFilterKey";

export const resolveValidatedFilter = (
  key: ValidatedFilterKey,
  value: unknown,
  allowed: AllowedFilterValues,
): unknown | null => {
  switch (key) {
    case "awardBody":
      return resolveAwardBody(value, allowed);
    case "awardYear":
      return resolveAwardYear(value, allowed);
    case "category":
      return resolveAgainstAllowedSet(String(value), allowed.categories, CATEGORY_ALIASES);
    case "contentType":
      return resolveAgainstAllowedSet(String(value), allowed.contentTypes, CONTENT_TYPE_ALIASES);
    case "genres":
    case "genresAll":
      return resolveGenres(value, allowed);
    case "language":
      return resolveLanguage(String(value), allowed.languages);
    case "yearMax":
    case "yearMin":
      return resolveYearBound(value, allowed);
  }
};
