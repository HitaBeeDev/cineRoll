export type YearRangeQuery = {
  yearMin?: number | undefined;
  yearMax?: number | undefined;
};

export const validYearRange = (query: YearRangeQuery) =>
  query.yearMin === undefined ||
  query.yearMax === undefined ||
  query.yearMin <= query.yearMax;

export const yearRangeError = {
  message: "yearMin must be less than or equal to yearMax",
  path: ["yearMin"],
};

/** Pre-rename names for the same bounds, still live in shared and bookmarked links. */
export type LegacyYearRangeQuery = YearRangeQuery & {
  decadeMin?: number | undefined;
  decadeMax?: number | undefined;
};

/**
 * Fold the legacy `decadeMin`/`decadeMax` params into `yearMin`/`yearMax`.
 *
 * Both always meant "year >= / <= this" (the old names described the UI's decade
 * dropdowns, not the comparison), so links shared before the rename keep working.
 * The new names win where both are present, and the legacy keys are dropped so
 * nothing downstream can read the stale pair.
 */
export const foldLegacyYearRange = <T extends LegacyYearRangeQuery>(query: T) => {
  const { decadeMin, decadeMax, ...rest } = query;

  return {
    ...rest,
    yearMin: rest.yearMin ?? decadeMin,
    yearMax: rest.yearMax ?? decadeMax,
  };
};
