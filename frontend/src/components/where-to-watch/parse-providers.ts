import type { CountryData } from "@/components/where-to-watch/types";

/** Narrows TMDB's loosely-typed watch-provider payload into per-country data. */
export function parseProviders(
  raw: Record<string, unknown>,
): Record<string, CountryData> {
  const result: Record<string, CountryData> = {};
  for (const [code, value] of Object.entries(raw)) {
    if (value && typeof value === "object") {
      result[code] = value as CountryData;
    }
  }
  return result;
}
