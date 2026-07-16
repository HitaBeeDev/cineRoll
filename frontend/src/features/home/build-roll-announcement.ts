import type { RollFilm } from "@/lib/api";

export function buildRollAnnouncement(
  film: RollFilm | null,
  isRolling: boolean,
  effectiveCount: number | null,
): string {
  if (isRolling) return "Rolling for a film…";
  if (film) return `Rolled: ${film.title}${film.year ? `, ${film.year}` : ""}.`;
  if (effectiveCount === 0) return "No films match your filters.";
  return "";
}
