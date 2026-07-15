import type { RollFilm } from "@/lib/api";

export type FilmAwardSummary = {
  key: string;
  label: string;
  nominations: number;
  wins: number;
};

export function getFilmAwards(film: RollFilm): FilmAwardSummary[] {
  return [
    createSummary("oscar", "Oscar", film.oscarWins, film.oscarNominations),
    createSummary("gg", "GG", film.ggWins, film.ggNominations),
    createSummary("cannes", "Cannes", film.cannesWins, film.cannesNominations),
  ].filter((award) => award.nominations > 0);
}

function createSummary(
  key: string,
  label: string,
  wins: number,
  nominations: number,
): FilmAwardSummary {
  return { key, label, nominations, wins };
}
