import type { AllowedFilterValues } from "../allowedFilterValues";

export const resolveDecade = (
  value: unknown,
  allowed: AllowedFilterValues,
): number | null => {
  const year = Number(value);
  if (!Number.isFinite(year)) return null;

  return Math.min(allowed.yearMax, Math.max(allowed.yearMin, year));
};
