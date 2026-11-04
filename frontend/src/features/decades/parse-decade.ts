import { DECADES } from "./decades";

/** "1970s" → 1970, for a decade that has a page; null for anything else. */
export function parseDecade(segment: string): number | null {
  const match = /^(\d{4})s$/.exec(segment);
  const start = match ? Number(match[1]) : NaN;
  return DECADES.includes(start) ? start : null;
}
