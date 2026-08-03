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

/**
 * Ceremony-year bounds, and the single-year param that predates them.
 *
 * `awardYear` stays in the query vocabulary because other surfaces genuinely mean
 * one ceremony — the natural-roll extractor pulls "won in 1994" out of a prompt,
 * and old browse links carry it. Folding it to the range [y, y] leaves exactly one
 * comparison downstream instead of two code paths that could disagree.
 */
export type AwardYearRangeQuery = {
  awardYear?: number | undefined;
  awardYearMin?: number | undefined;
  awardYearMax?: number | undefined;
};

export const validAwardYearRange = (query: AwardYearRangeQuery) =>
  query.awardYearMin === undefined ||
  query.awardYearMax === undefined ||
  query.awardYearMin <= query.awardYearMax;

export const awardYearRangeError = {
  message: "awardYearMin must be less than or equal to awardYearMax",
  path: ["awardYearMin"],
};

export const foldAwardYear = <T extends AwardYearRangeQuery>(query: T) => {
  const { awardYear, ...rest } = query;

  return {
    ...rest,
    awardYearMin: rest.awardYearMin ?? awardYear,
    awardYearMax: rest.awardYearMax ?? awardYear,
  };
};
