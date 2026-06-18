import type { AllowedFilterValues } from "./allowedFilterValues";

/**
 * Validates model-emitted structural filters against the DB-derived allowed-value
 * lists ([[allowedFilterValues]]) before they ever reach a query. Near-misses are
 * mapped to the canonical value ("Sci-Fi" → "Science Fiction", "France" → "fr");
 * values with no match in the catalog are dropped. Free-text fields the model
 * can't get "wrong" against a list (director, person) and plain booleans pass
 * through untouched.
 */

export type StructuralFilters = {
  language?: string | null | undefined;
  genre?: string | null | undefined;
  contentType?: string | null | undefined;
  awardBody?: string | null | undefined;
  category?: string | null | undefined;
  awardYear?: number | null | undefined;
  decadeMin?: number | null | undefined;
  decadeMax?: number | null | undefined;
  [key: string]: unknown;
};

/** Fields validated against an allowed list; everything else passes through. */
const VALIDATED_KEYS = new Set([
  "language",
  "genre",
  "contentType",
  "awardBody",
  "category",
  "awardYear",
  "decadeMin",
  "decadeMax",
]);

/** Normalize for forgiving comparison: lowercase, strip accents and punctuation. */
function norm(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

/** Common phrasings → a canonical genre name that should exist in the catalog. */
const GENRE_ALIASES: Record<string, string> = {
  "sci fi": "Science Fiction",
  scifi: "Science Fiction",
  "science fiction": "Science Fiction",
  space: "Science Fiction",
  historical: "History",
  "period piece": "History",
  period: "History",
  biopic: "Biography",
  doc: "Documentary",
  documentaries: "Documentary",
  animated: "Animation",
  anime: "Animation",
  "rom com": "Romance",
  romcom: "Romance",
};

/** Award-category phrasings → the canonical category stored on films. */
const CATEGORY_ALIASES: Record<string, string> = {
  "best picture": "Best Picture",
  "best director": "Directing",
  "best actress": "Actress",
  "best actor": "Actor",
  "best screenplay": "Writing",
  "best writing": "Writing",
  cinematographer: "Cinematography",
  "foreign language": "International Feature",
  "best foreign language": "International Feature",
};

/** Language / country words → ISO 639-1 code. */
const LANGUAGE_NAME_TO_CODE: Record<string, string> = {
  english: "en", american: "en", british: "en", usa: "en", uk: "en",
  french: "fr", france: "fr",
  italian: "it", italy: "it",
  german: "de", germany: "de", deutsch: "de",
  japanese: "ja", japan: "ja",
  spanish: "es", spain: "es", mexican: "es", mexico: "es",
  korean: "ko", korea: "ko",
  chinese: "zh", china: "zh", mandarin: "zh", cantonese: "zh",
  russian: "ru", russia: "ru",
  portuguese: "pt", portugal: "pt", brazilian: "pt", brazil: "pt",
  swedish: "sv", sweden: "sv",
};

/** Resolve a value to a canonical member of `allowed` (via exact-normalized
 *  match, then aliases); returns null when nothing in the catalog matches. */
function resolveAgainstSet(
  value: string,
  allowed: Set<string>,
  aliases: Record<string, string>,
): string | null {
  const n = norm(value);
  for (const member of allowed) {
    if (norm(member) === n) return member;
  }
  const aliased = aliases[n];
  if (aliased) {
    for (const member of allowed) {
      if (norm(member) === norm(aliased)) return member;
    }
  }
  return null;
}

function resolveLanguage(value: string, allowed: Set<string>): string | null {
  const raw = value.trim().toLowerCase();
  // Already a code that exists.
  if (allowed.has(raw)) return raw;
  // Map a language/country word to a code, then confirm it's in the catalog.
  const code = LANGUAGE_NAME_TO_CODE[norm(value)];
  if (code && allowed.has(code)) return code;
  return null;
}

function clampYear(value: number, allowed: AllowedFilterValues): number {
  return Math.min(allowed.yearMax, Math.max(allowed.yearMin, value));
}

/**
 * Returns the validated filters plus the keys that were dropped (for logging).
 * Only known fields are touched; a dropped field is simply absent from the
 * result, so the downstream query never runs with a value the data can't honor.
 */
export function validateStructuralFilters(
  filters: StructuralFilters,
  allowed: AllowedFilterValues,
): { filters: Record<string, unknown>; dropped: string[] } {
  const out: Record<string, unknown> = {};
  const dropped: string[] = [];

  // Keep `value` when non-null, else record `key` as dropped.
  const resolve = (key: string, value: unknown) => {
    if (value === null) dropped.push(key);
    else out[key] = value;
  };

  for (const [key, value] of Object.entries(filters)) {
    if (value === null || value === undefined || value === "") continue;

    // Pass-through fields (director, person, booleans) aren't list-checked.
    if (!VALIDATED_KEYS.has(key)) {
      out[key] = value;
      continue;
    }

    switch (key) {
      case "genre":
        resolve(key, resolveAgainstSet(String(value), allowed.genres, GENRE_ALIASES));
        break;
      case "category":
        resolve(key, resolveAgainstSet(String(value), allowed.categories, CATEGORY_ALIASES));
        break;
      case "contentType":
        resolve(key, resolveAgainstSet(String(value), allowed.contentTypes, {}));
        break;
      case "language":
        resolve(key, resolveLanguage(String(value), allowed.languages));
        break;
      case "awardBody": {
        const raw = String(value).toLowerCase();
        resolve(key, allowed.awardBodies.has(raw) ? raw : null);
        break;
      }
      case "awardYear": {
        const year = Number(value);
        const valid = Number.isFinite(year) && year >= allowed.yearMin && year <= allowed.yearMax;
        resolve(key, valid ? year : null);
        break;
      }
      case "decadeMin":
      case "decadeMax": {
        const year = Number(value);
        resolve(key, Number.isFinite(year) ? clampYear(year, allowed) : null);
        break;
      }
    }
  }

  return { filters: out, dropped };
}
