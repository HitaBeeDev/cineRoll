import type { RollFilm } from "@/lib/api";
import type { AwardHighlight } from "./award-highlight";

/** The at-a-glance credential badges: one entry per award body the film touched,
 *  plus any IMDb Top 250 rank. Drives the header recognition summary. */
export function getAwardHighlights(film: RollFilm): AwardHighlight[] {
  const highlights: AwardHighlight[] = [];
  if (film.oscarWins > 0 || film.oscarNominations > 0) {
    highlights.push({
      label: "Oscars",
      singular: "Oscar",
      wins: film.oscarWins,
      nominations: film.oscarNominations,
    });
  }
  if (film.ggWins > 0 || film.ggNominations > 0) {
    highlights.push({
      label: "Golden Globes",
      singular: "Golden Globe",
      wins: film.ggWins,
      nominations: film.ggNominations,
    });
  }
  if (film.cannesWins > 0 || film.cannesNominations > 0) {
    highlights.push({
      label: "Cannes",
      singular: "Cannes",
      wins: film.cannesWins,
      nominations: film.cannesNominations,
    });
  }
  if (film.imdbTopMovieRank != null) {
    highlights.push({
      label: "IMDb Top 250 Movies",
      singular: "IMDb Top 250 Movies",
      wins: 0,
      nominations: 0,
      rank: film.imdbTopMovieRank,
    });
  }
  if (film.imdbTopTvRank != null) {
    highlights.push({
      label: "IMDb Top 250 TV",
      singular: "IMDb Top 250 TV",
      wins: 0,
      nominations: 0,
      rank: film.imdbTopTvRank,
    });
  }
  return highlights;
}
