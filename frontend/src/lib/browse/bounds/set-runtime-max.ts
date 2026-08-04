import type { RuntimeBounds } from "./runtime-bounds";

/** Sets the cap, dropping a floor that sits above it. */
export function setRuntimeMax(bounds: RuntimeBounds, value: number | null): RuntimeBounds {
  const contradicts = value != null && bounds.runtimeMin != null && value < bounds.runtimeMin;

  return { runtimeMin: contradicts ? null : bounds.runtimeMin, runtimeMax: value };
}
