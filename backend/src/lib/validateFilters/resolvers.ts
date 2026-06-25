import type { AllowedFilterValues } from "../allowedFilterValues";
import {
  CATEGORY_ALIASES,
  GENRE_ALIASES,
  LANGUAGE_NAME_TO_CODE,
} from "./aliases";
import { normalizeForMatch } from "./normalize";

export type ValidatedFilterKey =
  | "awardBody"
  | "awardYear"
  | "category"
  | "contentType"
  | "decadeMax"
  | "decadeMin"
  | "genre"
  | "language";

export const VALIDATED_KEYS = new Set<string>([
  "awardBody",
  "awardYear",
  "category",
  "contentType",
  "decadeMax",
  "decadeMin",
  "genre",
  "language",
]);

export function resolveValidatedFilter(
  key: ValidatedFilterKey,
  value: unknown,
  allowed: AllowedFilterValues,
): unknown | null {
  switch (key) {
    case "awardBody":
      return resolveAwardBody(value, allowed);
    case "awardYear":
      return resolveAwardYear(value, allowed);
    case "category":
      return resolveAgainstSet(String(value), allowed.categories, CATEGORY_ALIASES);
    case "contentType":
      return resolveAgainstSet(String(value), allowed.contentTypes, {});
    case "decadeMax":
    case "decadeMin":
      return resolveDecade(value, allowed);
    case "genre":
      return resolveAgainstSet(String(value), allowed.genres, GENRE_ALIASES);
    case "language":
      return resolveLanguage(String(value), allowed.languages);
  }
}

export function isValidatedFilterKey(key: string): key is ValidatedFilterKey {
  return VALIDATED_KEYS.has(key);
}

function resolveAgainstSet(
  value: string,
  allowed: Set<string>,
  aliases: Record<string, string>,
): string | null {
  const normalized = normalizeForMatch(value);
  const exact = findAllowedMember(normalized, allowed);
  if (exact) return exact;

  const aliased = aliases[normalized];
  return aliased ? findAllowedMember(normalizeForMatch(aliased), allowed) : null;
}

function findAllowedMember(normalizedValue: string, allowed: Set<string>): string | null {
  for (const member of allowed) {
    if (normalizeForMatch(member) === normalizedValue) return member;
  }

  return null;
}

function resolveLanguage(value: string, allowed: Set<string>): string | null {
  const raw = value.trim().toLowerCase();
  if (allowed.has(raw)) return raw;

  const code = LANGUAGE_NAME_TO_CODE[normalizeForMatch(value)];
  return code && allowed.has(code) ? code : null;
}

function resolveAwardBody(value: unknown, allowed: AllowedFilterValues): string | null {
  const raw = String(value).toLowerCase();

  return allowed.awardBodies.has(raw) ? raw : null;
}

function resolveAwardYear(value: unknown, allowed: AllowedFilterValues): number | null {
  const year = Number(value);
  const valid = Number.isFinite(year) && year >= allowed.yearMin && year <= allowed.yearMax;

  return valid ? year : null;
}

function resolveDecade(value: unknown, allowed: AllowedFilterValues): number | null {
  const year = Number(value);

  return Number.isFinite(year) ? clampYear(year, allowed) : null;
}

function clampYear(value: number, allowed: AllowedFilterValues): number {
  return Math.min(allowed.yearMax, Math.max(allowed.yearMin, value));
}
