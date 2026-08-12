import type { RollFilm } from "@/lib/api";
import type { AwardRecord } from "@cineroll/types";

const RECOGNITION_CAP = 4;

/** Flatten the per-body category arrays into one wins-first, recent-first ledger.
 *  Capped so the roll card stays scannable; the rest lives on the detail page.
 *
 *  `cap` is lowered in the roll dialog, where the card shares a fixed-height box
 *  with the controls and every extra row is a row of scrolling. Nothing is lost
 *  by it — whatever the cap excludes is counted in `more`, which already points
 *  at the detail page. */
export function getRecognitionRecords(
  film: RollFilm,
  cap: number = RECOGNITION_CAP,
): { records: AwardRecord[]; more: number } {
  const all = [
    ...film.oscarCategories,
    ...film.ggCategories,
    ...film.cannesCategories,
  ].sort((a, b) => Number(b.won) - Number(a.won) || b.awardYear - a.awardYear);
  return {
    records: all.slice(0, cap),
    more: Math.max(0, all.length - cap),
  };
}
