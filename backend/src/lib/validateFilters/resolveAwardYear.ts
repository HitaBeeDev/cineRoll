import type { AllowedFilterValues } from "../allowedFilterValues";

export const resolveAwardYear = (
  value: unknown,
  allowed: AllowedFilterValues,
): number | null => {
  const year = Number(value);
  const isAllowed = Number.isFinite(year)
    && year >= allowed.yearMin
    && year <= allowed.yearMax;

  return isAllowed ? year : null;
};
