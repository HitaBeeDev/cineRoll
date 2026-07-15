import type { Film } from "@cineroll/types";

export function buildRollBattleCaption(film: Film): string {
  const accolades = getShareAccolades(film);
  const awardText = accolades.length > 0 ? ` — ${accolades.join(", ")}` : "";
  return `Roll Battle picked ${film.title}${awardText} 🎬 via CineRoll`;
}

function getShareAccolades(film: Film): string[] {
  const accolades: string[] = [];
  if (film.oscarWins > 0) {
    accolades.push(`${film.oscarWins} Oscar ${pluralize(film.oscarWins, "win")}`);
  }
  if (film.ggNominations > 0) {
    accolades.push(
      `${film.ggNominations} Golden Globe ${pluralize(film.ggNominations, "nomination")}`,
    );
  }
  if (film.cannesWins > 0) {
    accolades.push(`${film.cannesWins} Cannes ${pluralize(film.cannesWins, "win")}`);
  }
  return accolades;
}

function pluralize(count: number, noun: string): string {
  return count === 1 ? noun : `${noun}s`;
}
