"use client";

import { COOKIE_PREFERENCES_EVENT } from "@/components/cookie-consent";

export function CookiePreferencesLink() {
  return (
    <button
      type="button"
      className="font-[family-name:var(--font-geist-mono)] text-[10px] uppercase tracking-[0.16em] text-[#9a9aac] transition-colors hover:text-[#e8453c] focus-visible:outline-none focus-visible:text-[#e8453c] sm:tracking-[0.24em]"
      onClick={() => window.dispatchEvent(new Event(COOKIE_PREFERENCES_EVENT))}
    >
      Cookie Preferences
    </button>
  );
}
