import { MAX_ROLL_SEEN_IDS } from "@/lib/home-storage/rolled-bag-constants/max-roll-seen-ids";
import { ROLL_SEEN_STORAGE_KEY } from "@/lib/home-storage/rolled-bag-constants/roll-seen-storage-key";
import { getRolledBag } from "./get-rolled-bag";

export function addToRolledBag(filmId: string): void {
  try {
    const deduplicatedBag = getRolledBag().filter((id) => id !== filmId);
    const nextBag = [...deduplicatedBag, filmId].slice(-MAX_ROLL_SEEN_IDS);
    window.sessionStorage.setItem(
      ROLL_SEEN_STORAGE_KEY,
      JSON.stringify(nextBag),
    );
  } catch {
    // Anti-repeat is optional; rolling must work when storage is blocked.
  }
}
