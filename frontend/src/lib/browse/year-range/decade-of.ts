import { YEARS_PER_DECADE } from "./years-per-decade";

/** The decade a year belongs to: 1994 → 1990. */
export function decadeOf(year: number): number {
  return Math.floor(year / YEARS_PER_DECADE) * YEARS_PER_DECADE;
}
