import type { AwardBodyFilter, FilterState } from "@cineroll/types";
import { AWARD_BODY_OPTIONS, CONTENT_TYPE_OPTIONS, SORT_OPTIONS } from "@/lib/browse/options";

/**
 * Display-only overrides for verbose/awkward country names. The stored value
 * (the TMDB form used for filtering) is unchanged — only the label differs.
 */
const COUNTRY_DISPLAY_NAMES: Record<string, string> = {
  "United States of America": "United States",
  "United Kingdom of Great Britain and Northern Ireland": "United Kingdom",
  "Syrian Arab Republic": "Syria",
  "Kyrgyz Republic": "Kyrgyzstan",
  "Cote D'Ivoire": "Côte d'Ivoire",
  "Palestinian Territory": "Palestine",
  "Russian Federation": "Russia",
};

export function countryLabel(value: string): string {
  return COUNTRY_DISPLAY_NAMES[value] ?? value;
}

// Languages are stored as ISO 639-1 codes (en, fr, …); render them as names.
const LANGUAGE_DISPLAY = typeof Intl !== "undefined" && "DisplayNames" in Intl
  ? new Intl.DisplayNames(["en"], { type: "language", fallback: "code" })
  : null;

export function languageLabel(code: string): string {
  try {
    return LANGUAGE_DISPLAY?.of(code) ?? code.toUpperCase();
  } catch {
    return code.toUpperCase();
  }
}

export function awardBodyLabel(awardBody: AwardBodyFilter): string {
  return AWARD_BODY_OPTIONS.find((o) => o.value === awardBody)?.label ?? awardBody;
}

export function contentTypeLabel(value: string): string {
  return CONTENT_TYPE_OPTIONS.find((o) => o.value === value)?.label ?? value;
}

export function sortLabel(sort: FilterState["sort"]): string {
  return SORT_OPTIONS.find((option) => option.value === sort)?.label ?? "Newest";
}
