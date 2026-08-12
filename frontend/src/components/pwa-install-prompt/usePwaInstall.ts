"use client";

import { useCallback, useEffect, useState, useSyncExternalStore } from "react";
import { COOKIE_CONSENT_CHANGED_EVENT, getCookieConsentChoice } from "@/lib/analytics";
import type { BeforeInstallPromptEvent, Platform } from "@/components/pwa-install-prompt/types";
import { isIosSafari } from "@/components/pwa-install-prompt/platform-detection/is-ios-safari";
import { isStandalone } from "@/components/pwa-install-prompt/platform-detection/is-standalone";
import { isTouchDevice } from "@/components/pwa-install-prompt/platform-detection/is-touch-device";
import { markDismissed } from "@/components/pwa-install-prompt/dismissal/mark-dismissed";
import { recentlyDismissed } from "@/components/pwa-install-prompt/dismissal/recently-dismissed";

const SHOW_DELAY_MS = 2500;

function subscribeToConsent(onChange: () => void): () => void {
  window.addEventListener(COOKIE_CONSENT_CHANGED_EVENT, onChange);
  return () => window.removeEventListener(COOKIE_CONSENT_CHANGED_EVENT, onChange);
}

/**
 * Whether the cookie banner has been answered and given up the bottom of the
 * screen. Both of these are fixed to that edge, so shown together the second one
 * to mount is simply hidden behind the first — and the one that cannot be
 * skipped has to go first. The install offer waits its turn.
 */
function useConsentAnswered(): boolean {
  return useSyncExternalStore(
    subscribeToConsent,
    () => getCookieConsentChoice() !== null,
    () => false,
  );
}

interface PwaInstallState {
  platform: Platform | null;
  visible: boolean;
  install: () => Promise<void>;
  dismiss: () => void;
}

/**
 * Drives the "Add to Home Screen" lifecycle: registers the no-op service worker,
 * captures Android's `beforeinstallprompt`, offers iOS Safari manual steps, and
 * exposes install/dismiss actions. Stays hidden when already installed, on
 * desktop, or while a prior dismissal is still snoozed.
 */
export function usePwaInstall(): PwaInstallState {
  const [platform, setPlatform] = useState<Platform | null>(null);
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [visible, setVisible] = useState(false);
  const consentAnswered = useConsentAnswered();

  const dismiss = useCallback(() => {
    setVisible(false);
    markDismissed();
  }, []);

  // Register the no-op service worker once on mount. Browsers won't fire
  // `beforeinstallprompt` (nor offer "Add to Home Screen") until a SW with a
  // fetch handler is active, so this must run regardless of platform/dismissal.
  useEffect(() => {
    if (typeof navigator === "undefined" || !("serviceWorker" in navigator)) return;
    navigator.serviceWorker.register("/sw.js").catch(() => {
      // Registration failing (e.g. non-HTTPS dev host) just means no install
      // prompt — nothing else on the site depends on the SW.
    });
  }, []);

  useEffect(() => {
    if (isStandalone() || !isTouchDevice() || recentlyDismissed()) return;

    let showTimer: ReturnType<typeof setTimeout> | undefined;
    const reveal = (next: Platform) => {
      setPlatform(next);
      showTimer = setTimeout(() => setVisible(true), SHOW_DELAY_MS);
    };

    // Android/Chromium: wait for the browser to say the app is installable.
    const onBeforeInstall = (event: Event) => {
      event.preventDefault();
      setDeferredPrompt(event as BeforeInstallPromptEvent);
      reveal("android");
    };
    window.addEventListener("beforeinstallprompt", onBeforeInstall);

    // iOS Safari: no event exists, so offer manual instructions.
    if (isIosSafari()) reveal("ios");

    // If the app gets installed while the prompt is open, retract it.
    const onInstalled = () => dismiss();
    window.addEventListener("appinstalled", onInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstall);
      window.removeEventListener("appinstalled", onInstalled);
      if (showTimer) clearTimeout(showTimer);
    };
  }, [dismiss]);

  const install = useCallback(async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    await deferredPrompt.userChoice; // "accepted" | "dismissed" — either way we're done
    setDeferredPrompt(null);
    dismiss();
  }, [deferredPrompt, dismiss]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") dismiss();
    };
    if (visible) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [visible, dismiss]);

  return { platform, visible: visible && consentAnswered, install, dismiss };
}
