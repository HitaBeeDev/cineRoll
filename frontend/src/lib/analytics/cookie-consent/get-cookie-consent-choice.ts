import { CONSENT_DECLINED_VALUE } from "@/lib/analytics/constants/consent-declined-value";
import { CONSENT_GRANTED_VALUES } from "@/lib/analytics/constants/consent-granted-values";
import { COOKIE_CONSENT_KEY } from "@/lib/analytics/constants/cookie-consent-key";
import type { CookieConsentChoice } from "../types";

export function getCookieConsentChoice(): CookieConsentChoice | null {
  if (typeof window === "undefined") return null;

  const storedChoice = window.localStorage.getItem(COOKIE_CONSENT_KEY) ?? "";
  if (CONSENT_GRANTED_VALUES.has(storedChoice)) return "granted";
  if (storedChoice === CONSENT_DECLINED_VALUE) return "declined";
  return null;
}
