import type { RollFilm } from "@/lib/api";
import {
  getAwardWinCount,
  getDecadeLabel,
  getPrimaryGenre,
} from "./film-signals";

export function buildTasteSummary(picks: RollFilm[]): string {
  if (picks.length === 0) return "";

  const genreCounts = countLabels(picks, getVisibleGenre);
  const decadeCounts = countLabels(picks, getDecadeLabel);
  const signals = [
    getMostCommonLabel(genreCounts)?.toLowerCase(),
    getMostCommonLabel(decadeCounts),
    countMatching(picks, (film) => (film.imdbRating ?? 0) >= 8) >= 3
      ? "high-rated picks"
      : null,
    countMatching(picks, (film) => (film.runtime ?? 0) >= 150) >= 3
      ? "long-form cinema"
      : null,
    countMatching(picks, (film) => getAwardWinCount(film) > 0) >= 3
      ? "award winners"
      : null,
  ].filter((signal): signal is string => signal != null);

  return signals.length > 0
    ? `Your taste leaned toward ${signals.slice(0, 3).join(", ")}.`
    : "Your taste stayed balanced across the bracket.";
}

function getVisibleGenre(film: RollFilm): string | null {
  const genre = getPrimaryGenre(film);
  return genre === "archive" ? null : genre;
}

function countLabels(
  films: RollFilm[],
  getLabel: (film: RollFilm) => string | null,
): Map<string, number> {
  const counts = new Map<string, number>();
  films.forEach((film) => {
    const label = getLabel(film);
    if (label) counts.set(label, (counts.get(label) ?? 0) + 1);
  });
  return counts;
}

function getMostCommonLabel(counts: Map<string, number>): string | null {
  const [entry] = [...counts.entries()].sort((left, right) => right[1] - left[1]);
  return entry?.[0] ?? null;
}

function countMatching(
  films: RollFilm[],
  predicate: (film: RollFilm) => boolean,
): number {
  return films.filter(predicate).length;
}
