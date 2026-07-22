import type { AllowedFilterValues } from "../allowedFilterValues";

export const resolveAwardBody = (
  value: unknown,
  allowed: AllowedFilterValues,
): string | null => {
  const awardBody = String(value).toLowerCase();

  return allowed.awardBodies.has(awardBody) ? awardBody : null;
};
