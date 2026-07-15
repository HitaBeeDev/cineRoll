"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
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
          className="fixed inset-x-0 bottom-0 z-40 border-t border-[#1e1e2a] bg-[#08080f]/95 backdrop-blur-md"
        >
          <div className="mx-auto flex max-w-screen-xl flex-col gap-3.5 px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between sm:gap-6 sm:px-6">
            <div className="min-w-0">
              <p className="font-[family-name:var(--font-geist-mono)] text-[10px] uppercase tracking-[0.28em] text-[#6a6a80]">
                {"// cookies"}
              </p>
              <p className="mt-1.5 max-w-2xl text-[13px] leading-6 text-[#b7b7c8]">
                A couple of essential cookies keep CineRoll running. Analytics
                stays off until you turn it on.{" "}
                <a
                  href="/privacy"
                  className="text-[#d7d7e4] underline decoration-[#3a3a4e] underline-offset-[3px] transition-colors hover:decoration-[#e8453c]"
                >
                  Privacy policy
                </a>
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <button
                type="button"
                onClick={() => setPreferencesOpen(true)}
                className="inline-flex h-9 items-center rounded-full px-3 font-[family-name:var(--font-geist-mono)] text-[11px] font-bold uppercase tracking-[0.18em] text-[#888899] transition-colors hover:text-[#f5f5f0] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e8453c] focus-visible:ring-offset-2 focus-visible:ring-offset-[#08080f]"
              >
                Manage
              </button>
              <button
                type="button"
                onClick={() => saveChoice("declined")}
                className="inline-flex h-9 items-center rounded-full border border-[#2a2a3e] bg-[#11111b] px-4 font-[family-name:var(--font-geist-mono)] text-[11px] font-bold uppercase tracking-[0.18em] text-[#d7d7e4] transition-colors hover:border-[#6a6a85] hover:text-[#f5f5f0] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e8453c] focus-visible:ring-offset-2 focus-visible:ring-offset-[#08080f]"
              >
                Decline
              </button>
              <button
                type="button"
                onClick={() => saveChoice("granted")}
                className="inline-flex h-9 items-center rounded-full bg-[#e8453c] px-4 font-[family-name:var(--font-geist-mono)] text-[11px] font-bold uppercase tracking-[0.18em] text-[#09090f] transition-colors hover:bg-[#d5342b] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e8453c] focus-visible:ring-offset-2 focus-visible:ring-offset-[#08080f]"
              >
                Allow analytics
              </button>
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
              <p className="mt-3 font-[family-name:var(--font-geist-mono)] text-[10px] uppercase tracking-[0.22em] text-[#8a8aa0]">
                Current:{" "}
                <span
                  className={
                    choice === "granted" ? "text-[#e8453c]" : "text-[#c9c9d8]"
                  }
                >
                  {choice === "granted" ? "Allowed" : "Declined"}
                </span>
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="secondary"
              className="border-[#2a2a3e] bg-[#11111b] text-[#d7d7e4] hover:border-[#6a6a85] hover:bg-[#161622] hover:text-[#f5f5f0]"
              onClick={() => saveChoice("declined")}
            >
              Decline analytics
            </Button>
            <Button
              type="button"
              className="bg-[#e8453c] text-[#09090f] hover:bg-[#d5342b]"
              onClick={() => saveChoice("granted")}
            >
              Allow analytics
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
