import type { FilterState } from "@cineroll/types";
import type { RandomResult } from "@/lib/api";
import { trackEvent } from "@/lib/analytics";
import {
  addToRolledBag,
  pushRollHistory,
  setLaneBandit,
  writePendingRoll,
} from "@/lib/home-storage";
import type { RollSource } from "./roll-session-types";

type RecordInput = {
  result: RandomResult;
  filters: FilterState;
  source: RollSource;
  drawIndex: number;
};

/**
 * Files the draw that just landed: into the shuffle bag so it does not come
 * straight back, into the session history, into the bandit state the server
 * returned, and into the pending record the next roll will grade.
 *
 * The impression event carries the draw id, so the row that says the film was
 * shown and the row that says how the user reacted to it can be joined.
 */
export function recordRollResult({ result, filters, source, drawIndex }: RecordInput): void {
  addToRolledBag(result.film.id);
  if (result.bandit) setLaneBandit(result.bandit);
  pushRollHistory(result.film);
  writePendingRoll({
    film: {
      id: result.film.id,
      genres: result.film.genres,
      contentType: result.film.contentType,
    },
    lane: result.lane,
    drawId: result.drawId,
    index: drawIndex,
    engaged: false,
    rejected: false,
  });

  void trackEvent({
    type: "impression",
    filmId: result.film.id,
    context: {
      source,
      filters,
      total: result.total,
      drawIndex,
      ...(result.drawId ? { drawId: result.drawId } : {}),
    },
  });
}
