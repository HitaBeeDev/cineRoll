import type { AwardCategoryPayload, AwardGenrePayload, AwardYearPayload } from "./award-types";
import { fetchAward } from "./fetch-award";

export type AwardSegment =
  | { kind: "year"; data: AwardYearPayload }
  | { kind: "category"; data: AwardCategoryPayload }
  | { kind: "genre"; data: AwardGenrePayload };

/**
 * `/awards/{body}/{segment}` serves three page types from one URL slot: a year
 * ("1976"), a category ("palme-d-or") or a genre ("horror"). A four-digit
 * segment is a year; otherwise the category wins and the genre is the fallback
 * (the backend never lists a genre whose slug clashes with a category).
 * Null when none exists — the route 404s.
 */
export async function resolveAwardSegment(body: string, segment: string): Promise<AwardSegment | null> {
  if (/^\d{4}$/.test(segment)) {
    const data = await fetchAward<AwardYearPayload>(`${body}/years/${segment}`);
    return data && { kind: "year", data };
  }

  const category = await fetchAward<AwardCategoryPayload>(`${body}/categories/${segment}`);
  if (category) return { kind: "category", data: category };

  const genre = await fetchAward<AwardGenrePayload>(`${body}/genres/${segment}`);
  return genre && { kind: "genre", data: genre };
}
