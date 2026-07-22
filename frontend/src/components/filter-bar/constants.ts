import type { AwardBodyFilter } from "@cineroll/types";

export const DECADE_MIN = 1900;
export const DECADE_MAX = 2030;

export const AWARD_BODIES: { value: AwardBodyFilter; label: string }[] = [
  { value: "oscar", label: "Oscar" },
  { value: "goldenglobe", label: "Golden Globe" },
  { value: "cannes", label: "Cannes" },
  { value: "berlin", label: "Berlinale" },
];

export const CONTENT_TYPES: { value: string; label: string }[] = [
  { value: "movie", label: "Movie" },
  { value: "short", label: "Short" },
  { value: "animation", label: "Animation" },
  { value: "documentary", label: "Documentary" },
  { value: "tv-series", label: "TV Series" },
];

/** Add/remove `value` in a multi-select facet array. */
export function toggleValue<T>(list: T[], value: T): T[] {
  return list.includes(value) ? list.filter((v) => v !== value) : [...list, value];
}

export function awardBodyName(body: AwardBodyFilter): string {
  return AWARD_BODIES.find((b) => b.value === body)?.label ?? body;
}
