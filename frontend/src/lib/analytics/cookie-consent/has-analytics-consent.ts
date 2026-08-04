import { getCookieConsentChoice } from "./get-cookie-consent-choice";

export function hasAnalyticsConsent(): boolean {
  return getCookieConsentChoice() === "granted";
}
