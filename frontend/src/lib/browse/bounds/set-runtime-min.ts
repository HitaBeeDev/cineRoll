import type { RuntimeBounds } from "./runtime-bounds";

/** Sets the floor, dropping a cap that sits below it. */
export function setRuntimeMin(bounds: RuntimeBounds, value: number | null): RuntimeBounds {
  const contradicts = value != null && bounds.runtimeMax != null && value > bounds.runtimeMax;

  return { runtimeMin: value, runtimeMax: contradicts ? null : bounds.runtimeMax };
}
