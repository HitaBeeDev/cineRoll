import type { AwardRecord, Film } from "@cineroll/types";
import type { AwardSummary, CeremonySummary } from "./domain-types";

export function computeAwardSummary(film: Film): AwardSummary {
  const ceremonies = getCeremonies(film).filter(
    (ceremony) => ceremony.nominations > 0,
  );

  return {
    totalWins: ceremonies.reduce((sum, ceremony) => sum + ceremony.wins, 0),
    totalNominations: ceremonies.reduce(
      (sum, ceremony) => sum + ceremony.nominations,
      0,
    ),
    ceremonies,
  };
}

function getCeremonies(film: Film): CeremonySummary[] {
  return [
    createCeremony("Academy Awards", "AMPAS", "Oscar", "oscar", film.oscarWins, film.oscarNominations, film.oscarCategories),
    createCeremony("Golden Globes", "HFPA", "Golden Globe", "globe", film.ggWins, film.ggNominations, film.ggCategories),
    createCeremony("Cannes Film Festival", "Cannes", "Cannes", "cannes", film.cannesWins, film.cannesNominations, film.cannesCategories),
  ];
}

function createCeremony(
  title: string,
  code: string,
  shortLabel: string,
  icon: CeremonySummary["icon"],
  wins: number,
  nominations: number,
  records: unknown,
): CeremonySummary {
  return {
    title,
    code,
    shortLabel,
    icon,
    wins,
    nominations,
    records: (records as AwardRecord[]) ?? [],
  };
}
