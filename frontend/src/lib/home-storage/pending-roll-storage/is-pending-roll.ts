import type { PendingRoll } from "@/lib/home-storage/pending-roll-types";

/**
 * Guards the one stored value that later feeds arithmetic — the penalty tables
 * and the bandit posteriors. Anything half-written, or left behind by an older
 * shape of this record, is treated as no pending roll rather than trusted into
 * the learning path.
 */
export function isPendingRoll(value: unknown): value is PendingRoll {
  if (typeof value !== "object" || value === null) return false;
  const candidate = value as Partial<PendingRoll>;
  const film = candidate.film;

  return (
    typeof film === "object" &&
    film !== null &&
    typeof film.id === "string" &&
    Array.isArray(film.genres) &&
    film.genres.every((genre) => typeof genre === "string") &&
    typeof film.contentType === "string" &&
    typeof candidate.index === "number" &&
    Number.isFinite(candidate.index) &&
    typeof candidate.engaged === "boolean" &&
    typeof candidate.rejected === "boolean"
  );
}
