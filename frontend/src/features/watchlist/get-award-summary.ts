import type { WatchlistFilm } from "./domain-types";

export function getAwardSummary(film: WatchlistFilm): string | null {
  const wins =
    film.oscarWins + film.ggWins + film.cannesWins + film.berlinWins;
  const nominations =
    film.oscarNominations +
    film.ggNominations +
    film.cannesNominations +
    film.berlinNominations;

  if (wins > 0) return `${wins} award ${wins === 1 ? "win" : "wins"}`;
  if (nominations > 0) {
    return `${nominations} ${nominations === 1 ? "nomination" : "nominations"}`;
  }
  return null;
}
