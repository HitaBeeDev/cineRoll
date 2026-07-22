import {
  ANON_ID_KEY,
  CONSENT_DECLINED_VALUE,
  CONSENT_GRANTED_VALUES,
  COOKIE_CONSENT_CHANGED_EVENT,
  COOKIE_CONSENT_KEY,
  SESSION_ID_KEY,
} from "./constants";
import { clearEvents } from "./event-queue";
import { clearRecordedImpressions } from "./impression-store";
import type { CookieConsentChoice } from "./types";

export function hasAnalyticsConsent(): boolean {
  return getCookieConsentChoice() === "granted";
}

export function getCookieConsentChoice(): CookieConsentChoice | null {
  if (typeof window === "undefined") return null;

  const storedChoice = window.localStorage.getItem(COOKIE_CONSENT_KEY) ?? "";
  if (CONSENT_GRANTED_VALUES.has(storedChoice)) return "granted";
  if (storedChoice === CONSENT_DECLINED_VALUE) return "declined";
  return null;
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

function clearAnalyticsData(): void {
  clearEvents();
  clearRecordedImpressions();
  window.localStorage.removeItem(ANON_ID_KEY);
  window.sessionStorage.removeItem(SESSION_ID_KEY);
}
