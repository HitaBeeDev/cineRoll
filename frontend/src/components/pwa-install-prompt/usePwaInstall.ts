"use client";

import { useCallback, useEffect, useState } from "react";
import type { BeforeInstallPromptEvent, Platform } from "@/components/pwa-install-prompt/types";
import {
  isIosSafari,
  isStandalone,
  isTouchDevice,
} from "@/components/pwa-install-prompt/platform-detection";
import {
  markDismissed,
  recentlyDismissed,
} from "@/components/pwa-install-prompt/dismissal";

const SHOW_DELAY_MS = 2500;

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

  return { platform, visible, install, dismiss };
}
