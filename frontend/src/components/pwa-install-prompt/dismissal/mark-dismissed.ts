import { DISMISS_KEY } from "./dismiss-key";

/** Persist a dismissal so the prompt stays snoozed for DISMISS_DAYS. */
export function markDismissed(): void {
  try {
    window.localStorage.setItem(DISMISS_KEY, String(Date.now()));
  } catch {
    // storage unavailable (private mode) — dismissal just won't persist
  }
}
