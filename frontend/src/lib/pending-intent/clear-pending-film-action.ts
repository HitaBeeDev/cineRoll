import { ACTION_KEY } from "./action-key";
import { safeRemove } from "./safe-remove";

export function clearPendingFilmAction(filmId: string): void {
  safeRemove(ACTION_KEY(filmId));
}
