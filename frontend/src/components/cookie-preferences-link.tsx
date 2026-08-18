"use client";

import { COOKIE_PREFERENCES_EVENT } from "@/components/cookie-consent";

export function CookiePreferencesLink() {
  return (
    <button
      type="button"
      className="rounded-sm font-[family-name:var(--font-geist-mono)] text-[10px] uppercase tracking-[0.16em] text-fg-muted transition-colors hover:text-accent focus-visible:outline-none focus-visible:text-accent focus-visible:ring-2 focus-visible:ring-accent/50 sm:tracking-[0.24em]"
      onClick={() => window.dispatchEvent(new Event(COOKIE_PREFERENCES_EVENT))}
    >
      Cookie Preferences
    </button>
  );
}
