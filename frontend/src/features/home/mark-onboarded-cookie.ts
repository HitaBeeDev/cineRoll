import { ONBOARDED_COOKIE } from "./constants";

export function markOnboardedCookie(): void {
  try {
    document.cookie = `${ONBOARDED_COOKIE}=true; path=/; max-age=31536000; samesite=lax`;
  } catch {
    // Local storage remains the migration fallback when cookies are unavailable.
  }
}
