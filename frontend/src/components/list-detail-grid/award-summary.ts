import type { SavedFilm } from "@/types/saved-film";

/**
 * A one-line accolade label for a saved film — wins take precedence over
 * nominations, and `null` means the film has neither to show.
 */
export function awardSummary(film: SavedFilm): string | null {
  const wins = film.oscarWins + film.ggWins + film.cannesWins + film.berlinWins;
  const noms =
    film.oscarNominations + film.ggNominations + film.cannesNominations + film.berlinNominations;
  if (wins > 0) return `${wins} award ${wins === 1 ? "win" : "wins"}`;
  if (noms > 0) return `${noms} ${noms === 1 ? "nomination" : "nominations"}`;
  return null;
}
