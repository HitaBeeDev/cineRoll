import { ROLL_SEEN_STORAGE_KEY } from "@/lib/home-storage/rolled-bag-constants/roll-seen-storage-key";
import { isString } from "./is-string";

export function getRolledBag(): string[] {
  try {
    const raw = window.sessionStorage.getItem(ROLL_SEEN_STORAGE_KEY);
    const parsed = raw ? (JSON.parse(raw) as unknown) : [];
    return Array.isArray(parsed) ? parsed.filter(isString) : [];
  } catch {
    return [];
  }
}
