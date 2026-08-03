/**
 * Release-year bounds and the decade shortcuts over them.
 *
 * There is one filter here, not two: `yearMin`/`yearMax`. The Decade control
 * writes a whole decade into that pair and lights up only while the pair still
 * spans exactly one decade, so a decade and a year range can never contradict
 * each other (the old Decade Range was two decade dropdowns compared against the
 * year column, which quietly made "up to the 2020s" mean `year <= 2020` and hid
 * everything released after it).
 */

export const YEARS_PER_DECADE = 10;

export type YearRange = { yearMin: number | null; yearMax: number | null };

/** The decade a year belongs to: 1994 → 1990. */
export function decadeOf(year: number): number {
  return Math.floor(year / YEARS_PER_DECADE) * YEARS_PER_DECADE;
}

/** Every decade the catalogue actually has films in, ascending. */
export function decadesFromYears(years: number[]): number[] {
  return [...new Set(years.map(decadeOf))].sort((a, b) => a - b);
}

/** The bounds a Decade chip writes. */
export function decadeToYearRange(decade: number): YearRange {
  return { yearMin: decade, yearMax: decade + YEARS_PER_DECADE - 1 };
}

/**
 * The decade this range represents, or null when it spans anything else — which
 * is what deselects the chips the moment the years are narrowed by hand.
 */
export function yearRangeToDecade({ yearMin, yearMax }: YearRange): number | null {
  if (yearMin == null || yearMax == null) return null;
  if (yearMin % YEARS_PER_DECADE !== 0) return null;

  return yearMax === yearMin + YEARS_PER_DECADE - 1 ? yearMin : null;
}

export function hasYearRange({ yearMin, yearMax }: YearRange): boolean {
  return yearMin != null || yearMax != null;
}

/** Select-option value standing in for "no bound" — a select can't hold null. */
export const ANY_YEAR = "_any";

export function parseYear(value: string): number | null {
  return value === ANY_YEAR ? null : Number(value);
}

/**
 * Move one bound, pushing the other ahead of it rather than crossing it.
 *
 * A start after the end is an impossible range the API rejects outright (400),
 * so picking one drags the far bound along instead of stranding the user on an
 * error. Only ever widens toward the bound being set — never silently narrows.
 */
export function setYearMin(range: YearRange, yearMin: number | null): YearRange {
  const yearMax =
    yearMin != null && range.yearMax != null && yearMin > range.yearMax ? yearMin : range.yearMax;

  return { yearMin, yearMax };
}

export function setYearMax(range: YearRange, yearMax: number | null): YearRange {
  const yearMin =
    yearMax != null && range.yearMin != null && yearMax < range.yearMin ? yearMax : range.yearMin;

  return { yearMin, yearMax };
}

/** Chip/summary text: "1990s", "1994–1996", "2001", "1994 onwards", "up to 1996". */
export function formatYearRange(range: YearRange): string {
  const decade = yearRangeToDecade(range);
  if (decade != null) return `${decade}s`;

  const { yearMin, yearMax } = range;
  // A single year is a range of one — "2001", never "2001–2001".
  if (yearMin != null && yearMin === yearMax) return String(yearMin);
  if (yearMin != null && yearMax != null) return `${yearMin}–${yearMax}`;
  if (yearMin != null) return `${yearMin} onwards`;
  if (yearMax != null) return `up to ${yearMax}`;

  return "Any year";
}

/** The ceremony-year bounds, in the shape the shared range helpers expect. */
export function ceremonyYearRange(filters: {
  awardYearMin: number | null;
  awardYearMax: number | null;
}): YearRange {
  return { yearMin: filters.awardYearMin, yearMax: filters.awardYearMax };
}

export function hasCeremonyYearRange(filters: {
  awardYearMin: number | null;
  awardYearMax: number | null;
}): boolean {
  return hasYearRange(ceremonyYearRange(filters));
}

/** Write a moved ceremony bound back, keeping the pair from crossing. */
export function setCeremonyYearMin(
  filters: { awardYearMin: number | null; awardYearMax: number | null },
  value: number | null,
) {
  const { yearMin, yearMax } = setYearMin(ceremonyYearRange(filters), value);
  return { awardYearMin: yearMin, awardYearMax: yearMax };
}

export function setCeremonyYearMax(
  filters: { awardYearMin: number | null; awardYearMax: number | null },
  value: number | null,
) {
  const { yearMin, yearMax } = setYearMax(ceremonyYearRange(filters), value);
  return { awardYearMin: yearMin, awardYearMax: yearMax };
}
