"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Share, SquarePlus, X } from "lucide-react";

// Real-world "Add to Home Screen" prompt.
//
// Two platforms, two mechanisms:
//   • Android/Chromium fires `beforeinstallprompt`; we capture it and trigger the
//     native install dialog from our own button (Chrome requires a user gesture).
//   • iOS Safari has no such event — installing is a manual Share → "Add to Home
//     Screen", so we show illustrated instructions instead.
//
// Shown only on touch phones/tablets, never when already installed, and snoozed
// for DISMISS_DAYS after a dismissal so it never nags.

const DISMISS_KEY = "cineroll-a2hs-dismissed-at";
const DISMISS_DAYS = 30;
const SHOW_DELAY_MS = 2500;

type Platform = "android" | "ios";

// Minimal shape of the (non-standard) beforeinstallprompt event.
type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

function isStandalone(): boolean {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    // iOS Safari exposes this legacy flag when launched from the home screen.
    (window.navigator as Navigator & { standalone?: boolean }).standalone === true
  );
}

function isTouchDevice(): boolean {
  return window.matchMedia("(pointer: coarse)").matches && window.innerWidth <= 1024;
}

function isIosSafari(): boolean {
  const ua = window.navigator.userAgent;
  const iOS =
    /iphone|ipad|ipod/i.test(ua) ||
    // iPadOS 13+ masquerades as desktop Safari but reports touch points.
    (window.navigator.platform === "MacIntel" && window.navigator.maxTouchPoints > 1);
  const otherIosBrowser = /crios|fxios|edgios|opios/i.test(ua); // Chrome/FF/Edge/Opera on iOS
  return iOS && !otherIosBrowser;
}

function recentlyDismissed(): boolean {
  try {
    const raw = window.localStorage.getItem(DISMISS_KEY);
    if (!raw) return false;
    const ageMs = Date.now() - Number(raw);
    return ageMs < DISMISS_DAYS * 24 * 60 * 60 * 1000;
  } catch {
    return false;
  }
}

export function PwaInstallPrompt() {
  const reduced = useReducedMotion() ?? false;
  const [platform, setPlatform] = useState<Platform | null>(null);
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [visible, setVisible] = useState(false);

  const dismiss = useCallback(() => {
    setVisible(false);
    try {
      window.localStorage.setItem(DISMISS_KEY, String(Date.now()));
    } catch {
      // storage unavailable (private mode) — dismissal just won't persist
    }
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

  return (
    <AnimatePresence>
      {visible && platform && (
        <motion.div
          role="dialog"
          aria-label="Add CineRoll to your home screen"
          initial={reduced ? { opacity: 0 } : { opacity: 0, y: 24 }}
          animate={reduced ? { opacity: 1 } : { opacity: 1, y: 0 }}
          exit={reduced ? { opacity: 0 } : { opacity: 0, y: 24 }}
          transition={{ duration: 0.28, ease: "easeOut" }}
          className="fixed inset-x-3 bottom-3 z-[95] mx-auto max-w-md rounded-2xl border border-[#2a2a3e] bg-[#0d0d1a]/95 p-4 shadow-[0_20px_60px_rgba(0,0,0,0.55)] backdrop-blur-md"
          style={{ marginBottom: "env(safe-area-inset-bottom)" }}
        >
          <button
            type="button"
            onClick={dismiss}
            aria-label="Dismiss"
            className="absolute right-3 top-3 rounded-full p-1 text-[#8a8a9e] transition-colors hover:bg-white/5 hover:text-[#F5F5F0]"
          >
            <X className="h-4 w-4" />
          </button>

          <div className="flex items-start gap-3.5 pr-6">
            <div className="shrink-0 overflow-hidden rounded-xl border border-[#1e1e2a] bg-[#09090f]">
              <Image src="/icon-192.png" alt="CineRoll" width={48} height={48} className="h-12 w-12" />
            </div>
            <div className="min-w-0">
              <h2 className="font-[family-name:var(--font-display)] text-lg font-bold leading-tight text-[#F5F5F0]">
                Add CineRoll to your home screen
              </h2>
              <p className="mt-0.5 text-sm leading-5 text-[#a0a0b5]">
                One tap to tonight&apos;s film — full-screen, no browser bar.
              </p>
            </div>
          </div>

          {platform === "android" ? (
            <div className="mt-4 flex items-center gap-2">
              <button
                type="button"
                onClick={() => void install()}
                className="flex-1 rounded-xl bg-[#e8453c] px-4 py-2.5 text-center font-[family-name:var(--font-geist-mono)] text-[12px] font-bold uppercase tracking-[0.14em] text-[#F5F5F0] transition-colors hover:bg-[#d5342b]"
              >
                Add to home screen
              </button>
              <button
                type="button"
                onClick={dismiss}
                className="rounded-xl border border-[#2a2a3e] px-4 py-2.5 font-[family-name:var(--font-geist-mono)] text-[12px] font-bold uppercase tracking-[0.14em] text-[#a0a0b5] transition-colors hover:text-[#F5F5F0]"
              >
                Not now
              </button>
            </div>
          ) : (
            <div className="mt-4 rounded-xl border border-[#1e1e2a] bg-[#09090f]/60 p-3">
              <ol className="space-y-2 font-[family-name:var(--font-geist-mono)] text-[12px] leading-5 text-[#c4c4d2]">
                <li className="flex items-center gap-2">
                  <span className="text-[#8a8a9e]">1.</span>
                  <span className="flex items-center gap-1.5">
                    Tap the Share button
                    <Share className="h-4 w-4 text-[#4a9eff]" />
                  </span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-[#8a8a9e]">2.</span>
                  <span className="flex items-center gap-1.5">
                    Choose
                    <span className="inline-flex items-center gap-1 font-bold text-[#F5F5F0]">
                      Add to Home Screen
                      <SquarePlus className="h-4 w-4" />
                    </span>
                  </span>
                </li>
              </ol>
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
