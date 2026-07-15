import type { RollFilm } from "@/lib/api";

export function formatRollBattleAwardSummary(
  film: RollFilm,
  emptyLabel = "CineRoll winner",
): string {
  const nominations =
    film.oscarNominations + film.ggNominations + film.cannesNominations;
  const wins = film.oscarWins + film.ggWins + film.cannesWins;

  if (wins > 0 && nominations > 0) {
    return `${wins} wins · ${nominations} nominations`;
  }
  if (wins > 0) return wins === 1 ? "1 win" : `${wins} wins`;
  if (nominations > 0) {
    return nominations === 1 ? "1 nomination" : `${nominations} nominations`;
  }
  return emptyLabel;
}
