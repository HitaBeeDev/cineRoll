import { getPendingRoll } from "./get-pending-roll";
import { writePendingRoll } from "./write-pending-roll";

/**
 * Records how the user reacted to the draw on screen.
 *
 * A mark, not a spend: the penalty and the bandit reward are applied when the
 * next roll is asked for, so the card can confirm what it recorded instead of
 * vanishing the instant you touch it. Marking a draw that is no longer the
 * pending one is a no-op — a stale card in another tab must not grade this one.
 */
export function markPendingRoll(filmId: string, mark: "engaged" | "rejected"): void {
  const pending = getPendingRoll();
  if (!pending || pending.film.id !== filmId) return;

  writePendingRoll({ ...pending, [mark]: true });
}
