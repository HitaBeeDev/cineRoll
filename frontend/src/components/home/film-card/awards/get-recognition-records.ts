import type { RollFilm } from "@/lib/api";
import type { AwardRecord } from "@cineroll/types";

const RECOGNITION_CAP = 4;

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
