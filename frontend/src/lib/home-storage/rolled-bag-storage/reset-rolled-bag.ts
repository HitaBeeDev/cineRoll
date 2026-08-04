import { ROLL_SEEN_STORAGE_KEY } from "@/lib/home-storage/rolled-bag-constants/roll-seen-storage-key";

export function resetRolledBag(): void {
  try {
    window.sessionStorage.removeItem(ROLL_SEEN_STORAGE_KEY);
  } catch {
    // Anti-repeat is optional.
  }
}
