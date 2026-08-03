/**
 * The non-year min/max pairs — runtime in minutes, total award wins.
 *
 * Same rule the year bounds follow (see year-range.ts): setting one end never
 * strands the pair on an impossible range. Picking "≥ 2h30" under a "≤ 90m" cap
 * would leave a filter that can only return nothing and no obvious way back, so
 * the far bound moves out of the way instead. Only ever widens toward the bound
 * being set — it never silently narrows the other one.
 */

export type NumberRange = { min: number | null; max: number | null };

export function setRangeMin(range: NumberRange, value: number | null): NumberRange {
  const max = value != null && range.max != null && value > range.max ? value : range.max;

  return { min: value, max };
}

export function setRangeMax(range: NumberRange, value: number | null): NumberRange {
  const min = value != null && range.min != null && value < range.min ? value : range.min;

  return { min, max: value };
}

type RuntimeBounds = { runtimeMin: number | null; runtimeMax: number | null };

export function setRuntimeMin(bounds: RuntimeBounds, value: number | null): RuntimeBounds {
  const { min, max } = setRangeMin({ min: bounds.runtimeMin, max: bounds.runtimeMax }, value);
  return { runtimeMin: min, runtimeMax: max };
}

export function setRuntimeMax(bounds: RuntimeBounds, value: number | null): RuntimeBounds {
  const { min, max } = setRangeMax({ min: bounds.runtimeMin, max: bounds.runtimeMax }, value);
  return { runtimeMin: min, runtimeMax: max };
}

type WinBounds = { winsMin: number | null; winsMax: number | null };

export function setWinsMin(bounds: WinBounds, value: number | null): WinBounds {
  const { min, max } = setRangeMin({ min: bounds.winsMin, max: bounds.winsMax }, value);
  return { winsMin: min, winsMax: max };
}

export function setWinsMax(bounds: WinBounds, value: number | null): WinBounds {
  const { min, max } = setRangeMax({ min: bounds.winsMin, max: bounds.winsMax }, value);
  return { winsMin: min, winsMax: max };
}
