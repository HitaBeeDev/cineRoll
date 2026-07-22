import type { RollFilm } from "@/lib/api";
import type { AwardRecord } from "@cineroll/types";

export type AwardHighlight = {
  label: string;
  wins: number;
  nominations: number;
  rank?: number;
};

/** The at-a-glance credential badges: one row per award body the film touched,
 *  plus any IMDb Top 250 rank. Drives the header Recognition panel. */
export function getAwardHighlights(film: RollFilm): AwardHighlight[] {
  const highlights: AwardHighlight[] = [];
  if (film.oscarWins > 0 || film.oscarNominations > 0) {
    highlights.push({ label: "Oscars", wins: film.oscarWins, nominations: film.oscarNominations });
  }
  if (film.ggWins > 0 || film.ggNominations > 0) {
    highlights.push({ label: "Golden Globes", wins: film.ggWins, nominations: film.ggNominations });
  }
  if (film.cannesWins > 0 || film.cannesNominations > 0) {
    highlights.push({ label: "Cannes", wins: film.cannesWins, nominations: film.cannesNominations });
  }
  if (film.imdbTopMovieRank != null) {
    highlights.push({ label: "IMDb Top 250 Movies", wins: 0, nominations: 0, rank: film.imdbTopMovieRank });
  }
  if (film.imdbTopTvRank != null) {
    highlights.push({ label: "IMDb Top 250 TV", wins: 0, nominations: 0, rank: film.imdbTopTvRank });
  }
  return highlights;
}

const RECOGNITION_CAP = 4;

export const AWARD_BODY_LABEL: Record<AwardRecord["awardBody"], string> = {
  oscar: "Oscar",
  goldenglobe: "Golden Globe",
  cannes: "Cannes",
  berlin: "Berlinale",
};

/** Flatten the per-body category arrays into one wins-first, recent-first ledger.
 *  Capped so the roll card stays scannable; the rest lives on the detail page. */
export function getRecognitionRecords(film: RollFilm): { records: AwardRecord[]; more: number } {
  const all = [
    ...film.oscarCategories,
    ...film.ggCategories,
    ...film.cannesCategories,
  ].sort((a, b) => Number(b.won) - Number(a.won) || b.awardYear - a.awardYear);
  return {
    records: all.slice(0, RECOGNITION_CAP),
    more: Math.max(0, all.length - RECOGNITION_CAP),
  };
}
