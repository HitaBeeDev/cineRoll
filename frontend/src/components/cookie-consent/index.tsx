"use client";

import { useCookieConsent } from "@/components/cookie-consent/useCookieConsent";
import { ConsentBanner } from "@/components/cookie-consent/consent-banner";
import { PreferencesDialog } from "@/components/cookie-consent/preferences-dialog";

export { COOKIE_PREFERENCES_EVENT } from "@/components/cookie-consent/preferences-event";

export function CookieConsent() {
  const { choice, preferencesOpen, setPreferencesOpen, saveChoice } = useCookieConsent();

  return (
    <>
      {choice === null && (
        <ConsentBanner onManage={() => setPreferencesOpen(true)} onSave={saveChoice} />
      )}

      <PreferencesDialog
        open={preferencesOpen}
        onOpenChange={setPreferencesOpen}
        choice={choice}
        onSave={saveChoice}
      />
    </>
  );
}
