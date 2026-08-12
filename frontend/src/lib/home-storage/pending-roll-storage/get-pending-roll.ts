import { PENDING_ROLL_STORAGE_KEY } from "@/lib/home-storage/pending-roll-constants/pending-roll-storage-key";
import type { PendingRoll } from "@/lib/home-storage/pending-roll-types";
import { isPendingRoll } from "./is-pending-roll";

export function getPendingRoll(): PendingRoll | null {
  try {
    const raw = window.sessionStorage.getItem(PENDING_ROLL_STORAGE_KEY);
    const parsed = raw ? (JSON.parse(raw) as unknown) : null;
    return isPendingRoll(parsed) ? parsed : null;
  } catch {
    return null;
  }
}
