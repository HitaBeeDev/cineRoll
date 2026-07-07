"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { Cookie, Settings2 } from "lucide-react";
import {
  COOKIE_CONSENT_CHANGED_EVENT,
  type CookieConsentChoice,
  getCookieConsentChoice,
  setCookieConsentChoice,
} from "@/lib/analytics";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export const COOKIE_PREFERENCES_EVENT = "cineroll:open-cookie-preferences";

function subscribeToConsentStore(onChange: () => void) {
  window.addEventListener(COOKIE_CONSENT_CHANGED_EVENT, onChange);
  return () => window.removeEventListener(COOKIE_CONSENT_CHANGED_EVENT, onChange);
}

export function CookieConsent() {
  const choice = useSyncExternalStore(
    subscribeToConsentStore,
    getCookieConsentChoice,
    () => null,
  );
  const [preferencesOpen, setPreferencesOpen] = useState(false);

  useEffect(() => {
    const openPreferences = () => setPreferencesOpen(true);

    window.addEventListener(COOKIE_PREFERENCES_EVENT, openPreferences);

    return () => {
      window.removeEventListener(COOKIE_PREFERENCES_EVENT, openPreferences);
    };
  }, []);

  const saveChoice = (nextChoice: CookieConsentChoice) => {
    setCookieConsentChoice(nextChoice);
    setPreferencesOpen(false);
  };

  return (
    <>
      {choice === null ? (
        <section
          aria-label="Cookie consent"
          className="fixed inset-x-0 bottom-0 z-40 border-t border-[#2a2a3d] bg-[#08080f]/95 px-4 py-4 shadow-2xl shadow-black/70 backdrop-blur-md sm:px-6"
        >
          <div className="mx-auto flex max-w-screen-xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex min-w-0 gap-3">
              <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-[#35354c] bg-[#10101a] text-[#d4af37]">
                <Cookie className="h-4 w-4" aria-hidden="true" />
              </div>
              <div className="min-w-0">
                <h2 className="font-[family-name:var(--font-geist-mono)] text-[11px] font-semibold uppercase tracking-[0.28em] text-[#f5f5f0]">
                  Cookie Preferences
                </h2>
                <p className="mt-1 max-w-2xl text-sm leading-6 text-[#b7b7c8]">
                  CineRoll uses essential storage for core features. Analytics
                  only runs if you allow it.
                </p>
              </div>
            </div>
            <div className="flex shrink-0 flex-col gap-2 sm:flex-row sm:items-center">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="border border-[#303047] text-[#d7d7e4] hover:bg-[#161622]"
                onClick={() => setPreferencesOpen(true)}
              >
                <Settings2 className="h-3.5 w-3.5" aria-hidden="true" />
                Preferences
              </Button>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                className="border-[#45455d] text-[#f5f5f0] hover:bg-[#171722]"
                onClick={() => saveChoice("declined")}
              >
                Decline
              </Button>
              <Button
                type="button"
                size="sm"
                className="bg-[#e8453c] text-[#09090f] hover:brightness-110"
                onClick={() => saveChoice("granted")}
              >
                Allow Analytics
              </Button>
            </div>
          </div>
        </section>
      ) : null}

      <Dialog open={preferencesOpen} onOpenChange={setPreferencesOpen}>
        <DialogContent className="border-[#242438] bg-[#0b0b14]">
          <DialogHeader>
            <DialogTitle className="font-[family-name:var(--font-geist-mono)] text-[11px] font-semibold uppercase tracking-[0.35em] text-[#e8453c]">
              Cookie Preferences
            </DialogTitle>
            <DialogDescription className="text-[#9a9aac]">
              Manage optional analytics storage for this browser.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 text-sm leading-6 text-[#c9c9d8]">
            <div className="rounded-lg border border-[#252538] bg-[#11111b] p-4">
              <div className="font-medium text-[#f5f5f0]">Essential</div>
              <p className="mt-1 text-[#9a9aac]">
                Required for sign-in, onboarding, saved preferences, and basic
                app behavior. These cannot be turned off here.
              </p>
            </div>
            <div className="rounded-lg border border-[#252538] bg-[#11111b] p-4">
              <div className="font-medium text-[#f5f5f0]">Analytics</div>
              <p className="mt-1 text-[#9a9aac]">
                Optional product analytics helps measure film impressions,
                searches, rolls, and feature usage.
              </p>
              <p className="mt-3 font-[family-name:var(--font-geist-mono)] text-[10px] uppercase tracking-[0.22em] text-[#d4af37]">
                Current: {choice === "granted" ? "Allowed" : "Declined"}
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="secondary"
              onClick={() => saveChoice("declined")}
            >
              Decline Analytics
            </Button>
            <Button type="button" onClick={() => saveChoice("granted")}>
              Allow Analytics
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
