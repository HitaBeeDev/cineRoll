export const ANON_ID_KEY = "cineroll_anon_id";
export const SESSION_ID_KEY = "cineroll_session_id";
export const IMPRESSED_FILM_IDS_KEY = "cineroll_impressed_film_ids";
export const COOKIE_CONSENT_KEY = "cineroll_cookie_consent";
export const COOKIE_CONSENT_CHANGED_EVENT =
  "cineroll:cookie-consent-changed";
export const CONSENT_GRANTED_VALUES = new Set([
  "accepted",
  "granted",
  "analytics",
]);
export const CONSENT_DECLINED_VALUE = "declined";
export const FLUSH_INTERVAL_MS = 5_000;
export const MAX_BATCH_SIZE = 25;
