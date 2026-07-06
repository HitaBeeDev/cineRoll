import type { Film } from "@cineroll/types";

export function getAwardBadges(film: Film): string[] {
  return [
    getImdbMovieBadge(film),
    getImdbTvBadge(film),
    getOscarBadge(film),
    getGlobeBadge(film),
    getCannesBadge(film),
  ].filter((badge): badge is string => Boolean(badge));
}

function getImdbMovieBadge(film: Film): string | null {
  return film.imdbTopMovieRank !== null ? `IMDb Top 250 #${film.imdbTopMovieRank}` : null;
}

function getImdbTvBadge(film: Film): string | null {
  return film.imdbTopTvRank !== null ? `IMDb Top TV #${film.imdbTopTvRank}` : null;
}

function getOscarBadge(film: Film): string | null {
  if (film.oscarWins > 0) return `${film.oscarWins} Oscar ${film.oscarWins === 1 ? "Win" : "Wins"}`;
  if (film.oscarNominations > 0) {
    return `${film.oscarNominations} Oscar ${film.oscarNominations === 1 ? "Nom" : "Noms"}`;
  }
  return null;
}

function getGlobeBadge(film: Film): string | null {
  return film.ggWins > 0 ? `${film.ggWins} Globe ${film.ggWins === 1 ? "Win" : "Wins"}` : null;
}

function getCannesBadge(film: Film): string | null {
  return film.cannesWins > 0 ? `${film.cannesWins} Cannes ${film.cannesWins === 1 ? "Win" : "Wins"}` : null;
}
