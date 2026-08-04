import { ANON_ID_KEY } from "@/lib/analytics/constants/anon-id-key";
import { COOKIE_CONSENT_CHANGED_EVENT } from "@/lib/analytics/constants/cookie-consent-changed-event";
import { COOKIE_CONSENT_KEY } from "@/lib/analytics/constants/cookie-consent-key";
import { SESSION_ID_KEY } from "@/lib/analytics/constants/session-id-key";
import { clearEvents } from "@/lib/analytics/event-queue/clear-events";
import { clearRecordedImpressions } from "@/lib/analytics/impression-store/clear-recorded-impressions";
import type { CookieConsentChoice } from "../types";

function clearAnalyticsData(): void {
  clearEvents();
  clearRecordedImpressions();
  window.localStorage.removeItem(ANON_ID_KEY);
  window.sessionStorage.removeItem(SESSION_ID_KEY);
}

export function setCookieConsentChoice(choice: CookieConsentChoice): void {
  if (typeof window === "undefined") return;

  window.localStorage.setItem(COOKIE_CONSENT_KEY, choice);
  if (choice === "declined") clearAnalyticsData();

  window.dispatchEvent(
    new CustomEvent<CookieConsentChoice>(COOKIE_CONSENT_CHANGED_EVENT, {
      detail: choice,
    }),
  );
}
