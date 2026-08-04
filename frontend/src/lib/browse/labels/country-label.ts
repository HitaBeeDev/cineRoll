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
