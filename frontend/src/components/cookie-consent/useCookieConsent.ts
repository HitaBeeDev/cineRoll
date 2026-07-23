"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import {
  COOKIE_CONSENT_CHANGED_EVENT,
  type CookieConsentChoice,
  getCookieConsentChoice,
  setCookieConsentChoice,
} from "@/lib/analytics";
import { COOKIE_PREFERENCES_EVENT } from "@/components/cookie-consent/preferences-event";

function subscribeToConsentStore(onChange: () => void) {
  window.addEventListener(COOKIE_CONSENT_CHANGED_EVENT, onChange);
  return () => window.removeEventListener(COOKIE_CONSENT_CHANGED_EVENT, onChange);
}

/**
 * Reads the current cookie-consent choice from the analytics store and manages
 * the preferences dialog: opens on the external preferences event, and persists
 * a new choice (which also closes the dialog).
 */
export function useCookieConsent() {
  const choice = useSyncExternalStore(
    subscribeToConsentStore,
    getCookieConsentChoice,
    () => null,
  );
  const [preferencesOpen, setPreferencesOpen] = useState(false);

  useEffect(() => {
    const openPreferences = () => setPreferencesOpen(true);
    window.addEventListener(COOKIE_PREFERENCES_EVENT, openPreferences);
    return () => window.removeEventListener(COOKIE_PREFERENCES_EVENT, openPreferences);
  }, []);

  const saveChoice = (nextChoice: CookieConsentChoice) => {
    setCookieConsentChoice(nextChoice);
    setPreferencesOpen(false);
  };

  return { choice, preferencesOpen, setPreferencesOpen, saveChoice };
}
