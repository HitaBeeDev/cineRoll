import type { AllowedFilterValues } from "./allowedFilterValues";
import {
  FILTER_OUTPUT_KEYS,
  isValidatedFilterKey,
  resolveValidatedFilter,
} from "./validateFilters/resolvers";
import {
  StructuralFilters,
  StructuralFilterValidationResult,
} from "./validateFilters/types";

/**
 * Validates model-emitted structural filters against the DB-derived allowed-value
 * lists ([[allowedFilterValues]]) before they ever reach a query. Near-misses are
 * mapped to the canonical value ("Sci-Fi" → "Science Fiction", "France" → "fr");
 * values with no match in the catalog are dropped. Free-text fields the model
 * can't get "wrong" against a list (director, person) and plain booleans pass
 * through untouched.
 */

/**
 * Returns the validated filters plus the keys that were dropped (for logging).
 * Only known fields are touched; a dropped field is simply absent from the
 * result, so the downstream query never runs with a value the data can't honor.
 */
export function validateStructuralFilters(
  filters: StructuralFilters,
  allowed: AllowedFilterValues,
): StructuralFilterValidationResult {
  const out: Record<string, unknown> = {};
  const dropped: string[] = [];

  for (const [key, value] of Object.entries(filters)) {
    if (value === null || value === undefined || value === "") continue;

    if (!isValidatedFilterKey(key)) {
      out[key] = value;
      continue;
    }

    keepResolvedFilter(key, resolveValidatedFilter(key, value, allowed), out, dropped);
  }

  return { filters: out, dropped };
}

function keepResolvedFilter(
  key: string,
  value: unknown | null,
  out: Record<string, unknown>,
  dropped: string[],
): void {
  if (value === null) dropped.push(key);
  else out[FILTER_OUTPUT_KEYS[key as keyof typeof FILTER_OUTPUT_KEYS] ?? key] = value;
}

export type { StructuralFilters, StructuralFilterValidationResult };
