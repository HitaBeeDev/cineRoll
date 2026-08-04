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
