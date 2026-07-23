const DISMISS_KEY = "cineroll-a2hs-dismissed-at";
const DISMISS_DAYS = 30;

/** True while a prior dismissal is still within its snooze window. */
export function recentlyDismissed(): boolean {
  try {
    const raw = window.localStorage.getItem(DISMISS_KEY);
    if (!raw) return false;
    const ageMs = Date.now() - Number(raw);
    return ageMs < DISMISS_DAYS * 24 * 60 * 60 * 1000;
  } catch {
    return false;
  }
}

/** Persist a dismissal so the prompt stays snoozed for DISMISS_DAYS. */
export function markDismissed(): void {
  try {
    window.localStorage.setItem(DISMISS_KEY, String(Date.now()));
  } catch {
    // storage unavailable (private mode) — dismissal just won't persist
  }
}
