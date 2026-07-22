import {
  MAX_ROLL_SEEN_IDS,
  ROLL_SEEN_STORAGE_KEY,
} from "./rolled-bag-constants";

export function getRolledBag(): string[] {
  try {
    const raw = window.sessionStorage.getItem(ROLL_SEEN_STORAGE_KEY);
    const parsed = raw ? (JSON.parse(raw) as unknown) : [];
    return Array.isArray(parsed) ? parsed.filter(isString) : [];
  } catch {
    return [];
  }
}

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

export function resetRolledBag(): void {
  try {
    window.sessionStorage.removeItem(ROLL_SEEN_STORAGE_KEY);
  } catch {
    // Anti-repeat is optional.
  }
}

function isString(value: unknown): value is string {
  return typeof value === "string";
}
