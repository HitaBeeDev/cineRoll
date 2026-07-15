import type { Film } from "@cineroll/types";
import { displayTitle } from "./display-title";

export function buildShareCaption(film: Film): string {
  const awards = getShareAwards(film);
  const awardText = awards.length > 0 ? ` — ${awards.join(", ")}` : "";
  return `Watching ${displayTitle(film.title)} tonight${awardText} 🎬 via CineRoll`;
}

function getShareAwards(film: Film): string[] {
  const awards: string[] = [];
  if (film.oscarWins > 0) {
    awards.push(`${film.oscarWins} Oscar ${pluralize(film.oscarWins, "win", "wins")}`);
  }
  if (film.ggNominations > 0) {
    awards.push(
      `${film.ggNominations} Golden Globe ${pluralize(film.ggNominations, "nomination", "nominations")}`,
    );
  }
  if (film.cannesWins > 0) {
    awards.push(`${film.cannesWins} Cannes ${pluralize(film.cannesWins, "win", "wins")}`);
  }
  return awards;
}

function pluralize(count: number, singular: string, plural: string): string {
  return count === 1 ? singular : plural;
}
